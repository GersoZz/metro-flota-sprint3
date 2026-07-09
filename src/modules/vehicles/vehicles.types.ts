import type { Prisma } from '../../generated/prisma/client.js';

// Fila de Prisma con el consorcio incluido
export type VehicleRow = Prisma.VehicleGetPayload<{ include: { consortium: true } }>;

// DTO de API de un vehículo
export interface VehicleDTO {
  id: string;
  plate: string;
  type: string;
  consortium: string;
  km: number;
  state: string;
  lastInspectionDate: string;
  currentRouteCode: string | null;
  capacity: number | null;
  year: number | null;
  fuelType: string | null;
}
