import { DtoFactory } from '../../lib/DtoFactory.js';
import { vehicleStateToDisplay, vehicleTypeToDisplay } from '../../lib/domainEnums.js';
import type { VehicleDTO, VehicleRow } from './vehicles.types.js';

// Rol Creator concreto
// Construye el DTO a partir de la fila de Prisma
export class VehicleFactory extends DtoFactory<VehicleRow, VehicleDTO> {
  create(v: VehicleRow): VehicleDTO {
    return {
      id: v.id,
      plate: v.plate,
      type: vehicleTypeToDisplay[v.type],
      consortium: v.consortium.name,
      km: v.km,
      state: vehicleStateToDisplay[v.state],
      lastInspectionDate: v.lastInspectionDate.toISOString().slice(0, 10),
    };
  }
}

export const vehicleFactory = new VehicleFactory();
