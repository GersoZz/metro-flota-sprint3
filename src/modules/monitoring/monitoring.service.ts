import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';

export interface MonitoringUnit {
  id: string;
  label: string;
}

export async function listUnits(): Promise<MonitoringUnit[]> {
  const units = await prisma.vehicle.findMany({
    where: { statuses: { some: {} } },
    select: { id: true },
    orderBy: { id: 'asc' },
  });
  return units.map((u) => ({ id: u.id, label: u.id }));
}

export interface VehicleStatusDTO {
  unitId: string;
  speedKmh: number;
  driver: string | null;
  passengers: number;
  capacity: number;
  nextStop: string | null;
  routeCode: string | null;
  position: { lat: number; lng: number };
}

export async function getUnitStatus(id: string): Promise<VehicleStatusDTO> {
  const status = await prisma.vehicleStatus.findFirst({
    where: { vehicleId: id },
    orderBy: { recordedAt: 'desc' },
    include: { driver: true, nextStop: true, vehicle: true },
  });
  if (!status) throw AppError.notFound(`Unidad sin telemetría: ${id}`);

  return {
    unitId: status.vehicleId,
    speedKmh: status.speedKmh,
    driver: status.driver?.name ?? null,
    passengers: status.passengers,
    capacity: status.capacity,
    nextStop: status.nextStop?.name ?? null,
    routeCode: status.vehicle.currentRouteCode,
    position: { lat: Number(status.lat), lng: Number(status.lng) },
  };
}

async function latestStatusOrThrow(id: string) {
  const status = await prisma.vehicleStatus.findFirst({
    where: { vehicleId: id },
    orderBy: { recordedAt: 'desc' },
    include: { vehicle: true, nextStop: true },
  });
  if (!status) throw AppError.notFound(`Unidad sin telemetría: ${id}`);
  return status;
}

export interface RouteProgressStop {
  name: string;
  time: string;
  active: boolean;
}

export interface RouteProgress {
  routeCode: string | null;
  stops: RouteProgressStop[];
}

export async function getUnitRoute(id: string): Promise<RouteProgress> {
  const status = await latestStatusOrThrow(id);
  const routeCode = status.vehicle.currentRouteCode;
  if (!routeCode) return { routeCode: null, stops: [] };

  const [route, stops] = await Promise.all([
    prisma.route.findUnique({ where: { code: routeCode } }),
    prisma.stop.findMany({ where: { routeCode }, orderBy: { order: 'asc' } }),
  ]);

  const gap = route?.frequencyMinutes ?? 5;
  const activeOrder = status.nextStop?.order ?? stops[0]?.order ?? 1;

  return {
    routeCode,
    stops: stops.map((s) => {
      const rel = s.order - activeOrder;
      const active = s.order === activeOrder;
      const time = rel < 0 ? 'Visitada' : `Llegada en ${(rel + 1) * gap} min`;
      return { name: s.name, time, active };
    }),
  };
}

export interface UnitPosition {
  lat: number;
  lng: number;
  markers: { name: string; order: number; lat: number; lng: number }[];
}

export async function getUnitPosition(id: string): Promise<UnitPosition> {
  const status = await latestStatusOrThrow(id);
  const routeCode = status.vehicle.currentRouteCode;

  const stops = routeCode
    ? await prisma.stop.findMany({
        where: { routeCode, lat: { not: null }, lng: { not: null } },
        orderBy: { order: 'asc' },
      })
    : [];

  return {
    lat: Number(status.lat),
    lng: Number(status.lng),
    markers: stops.map((s) => ({
      name: s.name,
      order: s.order,
      lat: Number(s.lat),
      lng: Number(s.lng),
    })),
  };
}
