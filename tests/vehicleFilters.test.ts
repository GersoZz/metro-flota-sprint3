import { describe, expect, it } from 'vitest';
import { FilterContext } from '../src/lib/filters/FilterContext.js';
import {
  ConsortiumFilter,
  SearchFilter,
  StateFilter,
  TypeFilter,
  vehicleFilters,
} from '../src/modules/vehicles/filters/vehicleFilters.js';
import type { ListVehiclesQuery } from '../src/modules/vehicles/vehicles.schema.js';

const q = (partial: Partial<ListVehiclesQuery>): ListVehiclesQuery => partial as ListVehiclesQuery;

describe('FilterContext (Strategy)', () => {
  it('combina sólo las estrategias aplicables', () => {
    const ctx = new FilterContext([new StateFilter(), new SearchFilter()]);
    const where = ctx.build(q({ state: 'Operativo' }));
    // SearchFilter no aplica (no hay search): sólo participa StateFilter.
    expect(where).toEqual({ AND: [{ state: 'Operativo' }] });
  });

  it('devuelve {} cuando ninguna estrategia aplica', () => {
    expect(vehicleFilters.build(q({}))).toEqual({});
  });

  it('mapea el display de estado al enum interno (En Taller → EnTaller)', () => {
    expect(new StateFilter().toCondition(q({ state: 'En Taller' }))).toEqual({ state: 'EnTaller' });
  });

  it('mapea el display de tipo al enum interno (Bus Articulado → BusArticulado)', () => {
    expect(new TypeFilter().toCondition(q({ type: 'Bus Articulado' }))).toEqual({
      type: 'BusArticulado',
    });
  });

  it('ConsortiumFilter filtra por nombre exacto', () => {
    expect(new ConsortiumFilter().toCondition(q({ consortium: 'Lima Bus' }))).toEqual({
      consortium: { name: { equals: 'Lima Bus' } },
    });
  });

  it('SearchFilter busca en placa/id/consorcio y reconoce enums por display', () => {
    const where = new SearchFilter().toCondition(q({ search: 'taller' }));
    expect(where.OR).toEqual([
      { plate: { contains: 'taller', mode: 'insensitive' } },
      { id: { contains: 'taller', mode: 'insensitive' } },
      { consortium: { name: { contains: 'taller', mode: 'insensitive' } } },
      { state: 'EnTaller' }, // 'taller' coincide con el display 'En Taller'
    ]);
  });

  it('combina varias estrategias aplicables en un AND', () => {
    const where = vehicleFilters.build(q({ state: 'Operativo', consortium: 'Lima Bus' }));
    expect(where).toEqual({
      AND: [{ state: 'Operativo' }, { consortium: { name: { equals: 'Lima Bus' } } }],
    });
  });
});
