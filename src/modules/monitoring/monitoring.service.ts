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
