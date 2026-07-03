import { DtoFactory } from '../../lib/DtoFactory.js';
import { VehicleAdapter } from './VehicleAdapter.js';
import type { VehicleDTO, VehicleRow } from './vehicles.types.js';

// Rol Creator concreto: decide qué adaptador instanciar para producir el DTO.
// El Factory Method elige el adaptador; el Adapter encapsula cómo se traduce la fila.
export class VehicleFactory extends DtoFactory<VehicleRow, VehicleDTO> {
  create(v: VehicleRow): VehicleDTO {
    return new VehicleAdapter(v).toApi();
  }
}

export const vehicleFactory = new VehicleFactory();
