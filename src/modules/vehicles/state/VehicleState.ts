import { AppError } from '../../../lib/AppError.js';

// Nombres para los states
export type VehicleStateName = 'Operativo' | 'Alerta' | 'EnTaller';

// Rol State (abstracto) del patrón State
export abstract class VehicleState {
  abstract readonly name: VehicleStateName;

  // Array de estados a los que puede transicionar
  protected abstract allowed(): readonly VehicleStateName[];

  canTransitionTo(target: VehicleState): boolean {
    return this.name === target.name || this.allowed().includes(target.name);
  }

  assertTo(target: VehicleState): void {
    if (!this.canTransitionTo(target)) {
      throw AppError.conflict(`Transición inválida: ${this.name} → ${target.name}`);
    }
  }
}

// Estados concretos del patrón State
// Cada uno define a qué otros estados puede transicionar
export class OperativoState extends VehicleState {
  readonly name = 'Operativo' as const;
  protected allowed(): readonly VehicleStateName[] {
    return ['Alerta', 'EnTaller'];
  }
}

export class AlertaState extends VehicleState {
  readonly name = 'Alerta' as const;
  protected allowed(): readonly VehicleStateName[] {
    return ['Operativo', 'EnTaller'];
  }
}

// EnTaller solo puede transicionar a Operativo
export class EnTallerState extends VehicleState {
  readonly name = 'EnTaller' as const;
  protected allowed(): readonly VehicleStateName[] {
    return ['Operativo'];
  }
}
