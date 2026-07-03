import type { Prisma } from '../../generated/prisma/client.js';
import type { ApiResource } from '../../lib/ApiResource.js';
import type { VehicleStatusDTO } from './monitoring.types.js';

// interfaz de VehicleStatus que devuelve la base de datos (Adaptee)
export type VehicleStatusRow = Prisma.VehicleStatusGetPayload<{
  include: { driver: true; nextStop: true; vehicle: true };
}>;

// Rol Adapter: traduce una fila de VehicleStatus (Adaptee) al contrato de API
export class UnitStatusAdapter implements ApiResource<VehicleStatusDTO> {
  constructor(private readonly row: VehicleStatusRow) {}

  toApi(): VehicleStatusDTO {
    const s = this.row;
    return {
      unitId: s.vehicleId,
      speedKmh: s.speedKmh,
      driver: s.driver?.name ?? null, // relación anidada -> string | null
      passengers: s.passengers,
      capacity: s.capacity,
      nextStop: s.nextStop?.name ?? null, // relación anidada -> string | null
      routeCode: s.vehicle.currentRouteCode, // relación anidada -> string | null
      position: { lat: Number(s.lat), lng: Number(s.lng) }, // Decimal -> number
    };
  }
}
