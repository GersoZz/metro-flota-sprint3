import type { Prisma } from '../../generated/prisma/client.js';
import { DtoFactory } from '../../lib/DtoFactory.js';
import type { VehicleStatusDTO } from './monitoring.service.js';

// Fila de Prisma de VehicleStatus
export type VehicleStatusRow = Prisma.VehicleStatusGetPayload<{
  include: { driver: true; nextStop: true; vehicle: true };
}>;

// Rol Creator concreto
// Construye el DTO de telemetría a partir de la fila de Prisma
export class UnitStatusFactory extends DtoFactory<VehicleStatusRow, VehicleStatusDTO> {
  create(status: VehicleStatusRow): VehicleStatusDTO {
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
}

export const unitStatusFactory = new UnitStatusFactory();
