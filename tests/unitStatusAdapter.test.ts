import { describe, expect, it } from 'vitest';
import {
  UnitStatusAdapter,
  type VehicleStatusRow,
} from '../src/modules/monitoring/UnitStatusAdapter.js';

const row = (partial: Partial<VehicleStatusRow>): VehicleStatusRow => partial as VehicleStatusRow;

describe('UnitStatusAdapter (Adapter)', () => {
  it('aplana relaciones anidadas y convierte Decimal a number', () => {
    const dto = new UnitStatusAdapter(
      row({
        vehicleId: 'V-1',
        speedKmh: 42,
        passengers: 20,
        capacity: 80,
        lat: 12.34 as unknown as VehicleStatusRow['lat'],
        lng: -76.99 as unknown as VehicleStatusRow['lng'],
        driver: { name: 'Ana' } as VehicleStatusRow['driver'],
        nextStop: { name: 'Estación Central' } as VehicleStatusRow['nextStop'],
        vehicle: { currentRouteCode: 'C1' } as VehicleStatusRow['vehicle'],
      }),
    ).toApi();

    expect(dto).toMatchObject({
      unitId: 'V-1',
      driver: 'Ana', // relación anidada -> string
      nextStop: 'Estación Central', // relación anidada -> string
      routeCode: 'C1', // relación anidada -> string
      position: { lat: 12.34, lng: -76.99 }, // Decimal -> number
    });
  });

  it('mapea relaciones ausentes a null', () => {
    const dto = new UnitStatusAdapter(
      row({
        vehicleId: 'V-2',
        speedKmh: 0,
        passengers: 0,
        capacity: 40,
        lat: 0 as unknown as VehicleStatusRow['lat'],
        lng: 0 as unknown as VehicleStatusRow['lng'],
        driver: null,
        nextStop: null,
        vehicle: { currentRouteCode: null } as VehicleStatusRow['vehicle'],
      }),
    ).toApi();

    expect(dto.driver).toBeNull();
    expect(dto.nextStop).toBeNull();
    expect(dto.routeCode).toBeNull();
  });
});
