import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { telemetryBus } from './TelemetryBus.js';
import { getUnitStatus } from '../modules/monitoring/monitoring.service.js';

const STEP = 0.25;
const ARRIVAL_EPS = 0.0005;

const randomSpeed = (): number => 30 + Math.floor(Math.random() * 41);
const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

export async function tickUnit(unitId: string): Promise<boolean> {
  const status = await prisma.vehicleStatus.findFirst({
    where: { vehicleId: unitId },
    orderBy: { recordedAt: 'desc' },
    include: { vehicle: { select: { currentRouteCode: true } } },
  });
  if (!status) return false;

  const routeCode = status.vehicle.currentRouteCode;
  const stops = routeCode
    ? await prisma.stop.findMany({
        where: { routeCode, lat: { not: null }, lng: { not: null } },
        orderBy: { order: 'asc' },
      })
    : [];

  let lat = Number(status.lat);
  let lng = Number(status.lng);
  let nextStopId = status.nextStopId;

  if (stops.length > 0) {
    const idx = Math.max(
      0,
      stops.findIndex((s) => s.id === status.nextStopId),
    );
    const target = stops[idx]!;
    const tLat = Number(target.lat);
    const tLng = Number(target.lng);

    lat += (tLat - lat) * STEP;
    lng += (tLng - lng) * STEP;

    if (Math.hypot(tLat - lat, tLng - lng) < ARRIVAL_EPS) {
      lat = tLat;
      lng = tLng;
      nextStopId = stops[(idx + 1) % stops.length]!.id;
    } else {
      nextStopId = target.id;
    }
  }

  const passengers = clamp(
    status.passengers + (Math.floor(Math.random() * 21) - 10),
    0,
    status.capacity,
  );

  await prisma.vehicleStatus.update({
    where: { id: status.id },
    data: { lat, lng, nextStopId, speedKmh: randomSpeed(), passengers, recordedAt: new Date() },
  });

  // Publica el nuevo estado al bus sólo si hay observadores escuchando esta unidad
  if (telemetryBus.hasObservers(unitId)) {
    telemetryBus.publish(unitId, await getUnitStatus(unitId));
  }
  return true;
}

export async function simulateTick(): Promise<number> {
  const units = await prisma.vehicle.findMany({
    where: { statuses: { some: {} } },
    select: { id: true },
  });
  for (const u of units) await tickUnit(u.id);
  return units.length;
}

let timer: NodeJS.Timeout | undefined;

export function startTelemetrySimulator(intervalMs: number): void {
  if (timer) return;
  timer = setInterval(() => {
    void simulateTick().catch((err: unknown) => logger.error({ err }, 'tick de telemetría falló'));
  }, intervalMs);
  timer.unref?.();
  logger.info({ intervalMs }, 'simulador de telemetría iniciado');
}

export function stopTelemetrySimulator(): void {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}
