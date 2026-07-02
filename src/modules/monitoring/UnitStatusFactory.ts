import { DtoFactory } from '../../lib/DtoFactory.js';
import { UnitStatusAdapter, type VehicleStatusRow } from './UnitStatusAdapter.js';
import type { VehicleStatusDTO } from './monitoring.types.js';

// Rol Creator concreto: decide qué adaptador instanciar para producir el DTO de telemetría.
// El Factory Method elige el adaptador; el Adapter encapsula cómo se traduce la fila.
export class UnitStatusFactory extends DtoFactory<VehicleStatusRow, VehicleStatusDTO> {
  create(status: VehicleStatusRow): VehicleStatusDTO {
    return new UnitStatusAdapter(status).toApi();
  }
}

export const unitStatusFactory = new UnitStatusFactory();
