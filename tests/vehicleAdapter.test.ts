import { describe, expect, it } from 'vitest';
import { VehicleAdapter } from '../src/modules/vehicles/VehicleAdapter.js';
import type { VehicleRow } from '../src/modules/vehicles/vehicles.types.js';

const row = (partial: Partial<VehicleRow>): VehicleRow => partial as VehicleRow;

describe('VehicleAdapter (Adapter)', () => {
  it('adapta el vocabulario de BD al de la API', () => {
    const dto = new VehicleAdapter(
      row({
        id: 'V-1',
        plate: 'XYZ-9',
        type: 'BusArticulado',
        state: 'EnTaller',
        km: 5,
        lastInspectionDate: new Date('2026-03-10T00:00:00Z'),
        consortium: { name: 'Metropolitano' } as VehicleRow['consortium'],
      }),
    ).toApi();

    expect(dto).toMatchObject({
      type: 'Bus Articulado', // enum BD -> display API
      state: 'En Taller', // enum BD -> display API
      consortium: 'Metropolitano', // relación anidada -> string
      lastInspectionDate: '2026-03-10', // Date -> YYYY-MM-DD
    });
  });
});
