import { describe, expect, it } from 'vitest';
import {
  AlertaState,
  EnTallerState,
  OperativoState,
} from '../src/modules/vehicles/state/VehicleState.js';
import {
  stateFromDisplay,
  stateFromInternal,
} from '../src/modules/vehicles/state/VehicleStateFactory.js';

describe('Máquina de estados de vehículo', () => {
  it('EnTaller no puede ir directo a Alerta', () => {
    expect(() => new EnTallerState().assertTo(new AlertaState())).toThrow('Transición inválida');
  });

  it('EnTaller sólo sale a Operativo', () => {
    expect(new EnTallerState().canTransitionTo(new OperativoState())).toBe(true);
    expect(new EnTallerState().canTransitionTo(new AlertaState())).toBe(false);
  });

  it('Operativo puede ir a Alerta y a EnTaller', () => {
    expect(new OperativoState().canTransitionTo(new AlertaState())).toBe(true);
    expect(new OperativoState().canTransitionTo(new EnTallerState())).toBe(true);
  });

  it('Alerta puede ir a Operativo y a EnTaller', () => {
    expect(new AlertaState().canTransitionTo(new OperativoState())).toBe(true);
    expect(new AlertaState().canTransitionTo(new EnTallerState())).toBe(true);
  });

  it('permite el no-cambio (mismo estado)', () => {
    expect(new EnTallerState().canTransitionTo(new EnTallerState())).toBe(true);
    expect(new OperativoState().canTransitionTo(new OperativoState())).toBe(true);
  });

  it('assertTo no lanza en una transición válida', () => {
    expect(() => new OperativoState().assertTo(new EnTallerState())).not.toThrow();
  });
});

describe('VehicleStateFactory', () => {
  it('stateFromInternal instancia desde el enum interno de Prisma', () => {
    expect(stateFromInternal('EnTaller')).toBeInstanceOf(EnTallerState);
    expect(stateFromInternal('Operativo')).toBeInstanceOf(OperativoState);
    expect(stateFromInternal('Alerta')).toBeInstanceOf(AlertaState);
  });

  it('stateFromDisplay instancia desde el display de API', () => {
    expect(stateFromDisplay('En Taller')).toBeInstanceOf(EnTallerState);
    expect(stateFromDisplay('Operativo')).toBeInstanceOf(OperativoState);
    expect(stateFromDisplay('Alerta')).toBeInstanceOf(AlertaState);
  });
});
