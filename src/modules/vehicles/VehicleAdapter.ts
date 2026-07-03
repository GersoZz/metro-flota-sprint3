import type { ApiResource } from '../../lib/ApiResource.js';
import { vehicleStateToDisplay, vehicleTypeToDisplay } from '../../lib/domainEnums.js';
import type { VehicleDTO, VehicleRow } from './vehicles.types.js';

// Rol Adapter: traduce la respuesta de la BD (Adaptee) a la interfaz de la API (Target).
export class VehicleAdapter implements ApiResource<VehicleDTO> {
  constructor(private readonly row: VehicleRow) {} // envuelve el adaptee

  toApi(): VehicleDTO {
    const v = this.row;
    return {
      id: v.id,
      plate: v.plate,
      type: vehicleTypeToDisplay[v.type], // BD -> display API
      consortium: v.consortium.name, // relación anidada -> string
      km: v.km,
      state: vehicleStateToDisplay[v.state], // BD -> display API ("EnTaller" -> "En taller")
      lastInspectionDate: v.lastInspectionDate.toISOString().slice(0, 10), // Date -> YYYY-MM-DD
      currentRouteCode: v.currentRouteCode,
    };
  }
}
