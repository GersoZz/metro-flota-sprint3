import { Prisma } from '../../../generated/prisma/client.js';
import {
  matchEnumDisplay,
  vehicleStateFromDisplay,
  vehicleStateToDisplay,
  vehicleTypeFromDisplay,
  vehicleTypeToDisplay,
} from '../../../lib/domainEnums.js';
import { FilterContext } from '../../../lib/filters/FilterContext.js';
import type { FilterStrategy } from '../../../lib/filters/FilterStrategy.js';
import type { ListVehiclesQuery } from '../vehicles.schema.js';

type VehicleFilter = FilterStrategy<ListVehiclesQuery, Prisma.VehicleWhereInput>;

// Filtra exacto por State 
export class StateFilter implements VehicleFilter {
  applies(q: ListVehiclesQuery): boolean {
    return Boolean(q.state);
  }
  toCondition(q: ListVehiclesQuery): Prisma.VehicleWhereInput {
    return { state: vehicleStateFromDisplay[q.state as keyof typeof vehicleStateFromDisplay] };
  }
}

// Filtra exacto por Type
export class TypeFilter implements VehicleFilter {
  applies(q: ListVehiclesQuery): boolean {
    return Boolean(q.type);
  }
  toCondition(q: ListVehiclesQuery): Prisma.VehicleWhereInput {
    return { type: vehicleTypeFromDisplay[q.type as keyof typeof vehicleTypeFromDisplay] };
  }
}

// Filtra exacto por Consortium
export class ConsortiumFilter implements VehicleFilter {
  applies(q: ListVehiclesQuery): boolean {
    return Boolean(q.consortium);
  }
  toCondition(q: ListVehiclesQuery): Prisma.VehicleWhereInput {
    return { consortium: { name: { equals: q.consortium } } };
  }
}

// Filtra texto libre sobre placa/id/consorcio, y enums de state/type si coinciden.
export class SearchFilter implements VehicleFilter {
  applies(q: ListVehiclesQuery): boolean {
    return Boolean(q.search);
  }
  toCondition(q: ListVehiclesQuery): Prisma.VehicleWhereInput {
    const s = q.search!;
    const or: Prisma.VehicleWhereInput[] = [
      { plate: { contains: s, mode: 'insensitive' } },
      { id: { contains: s, mode: 'insensitive' } },
      { consortium: { name: { contains: s, mode: 'insensitive' } } },
    ];

    const stateId = matchEnumDisplay(vehicleStateToDisplay, s);
    if (stateId) or.push({ state: stateId });
    const typeId = matchEnumDisplay(vehicleTypeToDisplay, s);
    if (typeId) or.push({ type: typeId });

    return { OR: or };
  }
}

// Contexto de filtrado de vehículos, con todas las estrategias concretas registradas
export const vehicleFilters = new FilterContext<ListVehiclesQuery, Prisma.VehicleWhereInput>([
  new StateFilter(),
  new TypeFilter(),
  new ConsortiumFilter(),
  new SearchFilter(),
]);
