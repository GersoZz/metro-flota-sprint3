import { describe, expect, it } from 'vitest';
import { vehicleFactory } from '../src/modules/vehicles/VehicleFactory.js';
import type { VehicleRow } from '../src/modules/vehicles/vehicles.types.js';

const row = (partial: Partial<VehicleRow>): VehicleRow => partial as VehicleRow;

describe('VehicleFactory (Factory Method)', () => {
  it('mapea los enums internos a su display de API', () => {
    const dto = vehicleFactory.create(
      row({
        id: 'V-1',
        plate: 'ABC-123',
        type: 'BusArticulado',
        state: 'EnTaller',
        km: 10,
        lastInspectionDate: new Date('2026-01-01'),
        consortium: { name: 'Metropolitano' } as VehicleRow['consortium'],
      }),
    );
    expect(dto.type).toBe('Bus Articulado');
    expect(dto.state).toBe('En Taller');
    expect(dto.consortium).toBe('Metropolitano');
    expect(dto.lastInspectionDate).toBe('2026-01-01');
  });

  it('many() reutiliza el factory method sobre una lista', () => {
    const rows = [
      row({
        id: 'V-1',
        plate: 'ABC-123',
        type: 'Alimentador',
        state: 'Operativo',
        km: 0,
        lastInspectionDate: new Date('2026-02-02'),
        consortium: { name: 'Lima Bus' } as VehicleRow['consortium'],
      }),
      row({
        id: 'V-2',
        plate: 'XYZ-789',
        type: 'BusArticulado',
        state: 'Alerta',
        km: 50,
        lastInspectionDate: new Date('2026-03-03'),
        consortium: { name: 'Lima Bus' } as VehicleRow['consortium'],
      }),
    ];
    const dtos = vehicleFactory.many(rows);
    expect(dtos).toHaveLength(2);
    expect(dtos.map((d) => d.id)).toEqual(['V-1', 'V-2']);
    expect(dtos[1]!.state).toBe('Alerta');
  });
});
