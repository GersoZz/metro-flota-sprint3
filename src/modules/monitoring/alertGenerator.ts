import { prisma } from '../../lib/prisma.js';
import { telemetryBus } from '../../realtime/TelemetryBus.js';
import { getUnitStatus } from './monitoring.service.js';
import { telemetryAlertEngine } from './rules/AlertRuleEngine.js';
import type { AlertHit, TelemetrySample } from './rules/AlertRule.js';

// Arma la muestra de telemetria que necesitan las reglas, a partir del
// estado del bus y las paradas de su ruta.
export async function buildSample(vehicleId: string): Promise<TelemetrySample | null> {
  const status = await prisma.vehicleStatus.findFirst({
    where: { vehicleId },
    orderBy: { recordedAt: 'desc' },
    include: { vehicle: { select: { currentRouteCode: true } } },
  });
  if (!status) return null;

  const routeCode = status.vehicle.currentRouteCode;
  const stops = routeCode
    ? await prisma.stop.findMany({
        where: { routeCode, lat: { not: null }, lng: { not: null } },
        orderBy: { order: 'asc' },
      })
    : [];

  return {
    vehicleId,
    routeCode,
    position: { lat: Number(status.lat), lng: Number(status.lng) },
    speedKmh: status.speedKmh,
    routeStops: stops.map((s) => ({ lat: Number(s.lat), lng: Number(s.lng) })),
    stoppedSeconds: status.speedKmh === 0 ? STOPPED_STEP_SECONDS : 0,
  };
}

// Cada tick sin movimiento suma este tiempo. Es un valor fijo del simulador.
const STOPPED_STEP_SECONDS = 6 * 60;

// Evita crear la misma alerta si ya hay una activa del mismo tipo para el bus.
async function alreadyOpen(vehicleId: string, hit: AlertHit): Promise<boolean> {
  const found = await prisma.alert.findFirst({
    where: { vehicleId, title: hit.title, acknowledgedAt: null },
  });
  return found !== null;
}

// Corre el motor de reglas sobre un bus y guarda las alertas nuevas que se disparen.
// Publica cada alerta nueva por el bus de telemetria (patron Observer).
export async function generateAlertsForVehicle(vehicleId: string): Promise<number> {
  const sample = await buildSample(vehicleId);
  if (!sample) return 0;

  const hits = telemetryAlertEngine.run(sample);
  let created = 0;

  for (const hit of hits) {
    if (await alreadyOpen(vehicleId, hit)) continue;
    await prisma.alert.create({
      data: {
        title: hit.title,
        text: hit.text,
        tone: hit.tone,
        vehicleId,
        routeCode: sample.routeCode,
      },
    });
    created += 1;
  }

  if (created > 0 && telemetryBus.hasObservers(vehicleId)) {
    telemetryBus.publish(vehicleId, await getUnitStatus(vehicleId));
  }
  return created;
}
