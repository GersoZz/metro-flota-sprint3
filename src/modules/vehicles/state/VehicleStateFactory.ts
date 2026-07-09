import { vehicleStateFromDisplay } from '../../../lib/domainEnums.js';
import {
  AlertaState,
  DadoDeBajaState,
  EnTallerState,
  OperativoState,
  type VehicleState,
  type VehicleStateName,
} from './VehicleState.js';

// Mapeo de 'nombre interno' -> constructor del estado
const REGISTRY: Record<VehicleStateName, () => VehicleState> = {
  Operativo: () => new OperativoState(),
  Alerta: () => new AlertaState(),
  EnTaller: () => new EnTallerState(),
  DadoDeBaja: () => new DadoDeBajaState(),
};

// Instancia el estado a partir del nombre interno del estado. Ej: EnTaller
export function stateFromInternal(name: VehicleStateName): VehicleState {
  return REGISTRY[name]();
}

// Instancia el estado a partir del displayname del estado. Ej: 'En Taller'
export function stateFromDisplay(display: string): VehicleState {
  const key = vehicleStateFromDisplay[display as keyof typeof vehicleStateFromDisplay];
  return REGISTRY[key]();
}
