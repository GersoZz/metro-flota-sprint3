import { prisma } from '../../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';
import {
  paginationQuerySchema,
  paginated,
  toSkipTake,
  type Pagination,
} from '../../lib/pagination.js';
import {
  vehicleStateFromDisplay,
  vehicleStateToDisplay,
  vehicleTypeFromDisplay,
  vehicleTypeToDisplay,
} from '../../lib/domainEnums.js';
import { AppError } from '../../lib/AppError.js';
import type {
  CreateVehicleBody,
  ListVehiclesQuery,
  UpdateVehicleBody,
} from './vehicles.schema.js';

type VehicleRow = Prisma.VehicleGetPayload<{ include: { consortium: true } }>;

export interface VehicleDTO {
  id: string;
  plate: string;
  type: string;
  consortium: string;
  km: number;
  state: string;
  lastInspectionDate: string;
}

function toVehicleDTO(v: VehicleRow): VehicleDTO {
  return {
    id: v.id,
    plate: v.plate,
    type: vehicleTypeToDisplay[v.type],
    consortium: v.consortium.name,
    km: v.km,
    state: vehicleStateToDisplay[v.state],
    lastInspectionDate: v.lastInspectionDate.toISOString().slice(0, 10),
  };
}

function buildWhere(query: ListVehiclesQuery): Prisma.VehicleWhereInput {
  const and: Prisma.VehicleWhereInput[] = [];

  if (query.state) {
    and.push({ state: vehicleStateFromDisplay[query.state as keyof typeof vehicleStateFromDisplay] });
  }
  if (query.type) {
    and.push({ type: vehicleTypeFromDisplay[query.type as keyof typeof vehicleTypeFromDisplay] });
  }
  if (query.consortium) and.push({ consortium: { name: { equals: query.consortium } } });

  if (query.search) {
    const s = query.search;
    const or: Prisma.VehicleWhereInput[] = [
      { plate: { contains: s, mode: 'insensitive' } },
      { id: { contains: s, mode: 'insensitive' } },
      { consortium: { name: { contains: s, mode: 'insensitive' } } },
    ];

    const stateId = matchEnumDisplay(vehicleStateToDisplay, s);
    if (stateId) or.push({ state: stateId });
    const typeId = matchEnumDisplay(vehicleTypeToDisplay, s);
    if (typeId) or.push({ type: typeId });
    and.push({ OR: or });
  }

  return and.length > 0 ? { AND: and } : {};
}

function matchEnumDisplay<K extends string>(
  map: Record<K, string>,
  text: string,
): K | undefined {
  const t = text.toLowerCase();
  const entry = (Object.entries(map) as [K, string][]).find(([, display]) =>
    display.toLowerCase().includes(t),
  );
  return entry?.[0];
}

export async function listVehicles(query: ListVehiclesQuery) {
  const pagination: Pagination = paginationQuerySchema.parse(query);
  const where = buildWhere(query);

  const [rows, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: { consortium: true },
      orderBy: { id: 'asc' },
      ...toSkipTake(pagination),
    }),
    prisma.vehicle.count({ where }),
  ]);

  return paginated(rows.map(toVehicleDTO), total, pagination);
}

export async function getVehicle(id: string): Promise<VehicleDTO> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { consortium: true },
  });
  if (!vehicle) throw AppError.notFound(`Unidad no encontrada: ${id}`);
  return toVehicleDTO(vehicle);
}

/** Resuelve el consorcio por nombre → id (400 si no existe). */
async function resolveConsortiumId(name: string): Promise<string> {
  const consortium = await prisma.consortium.findUnique({ where: { name } });
  if (!consortium) throw AppError.badRequest(`Consorcio no existe: ${name}`);
  return consortium.id;
}

export async function createVehicle(body: CreateVehicleBody): Promise<VehicleDTO> {
  const consortiumId = await resolveConsortiumId(body.consortium);
  const created = await prisma.vehicle.create({
    data: {
      id: body.id,
      plate: body.plate,
      type: vehicleTypeFromDisplay[body.type as keyof typeof vehicleTypeFromDisplay],
      state: vehicleStateFromDisplay[body.state as keyof typeof vehicleStateFromDisplay],
      km: body.km,
      lastInspectionDate: body.lastInspectionDate,
      currentRouteCode: body.currentRouteCode ?? null,
      consortiumId,
    },
    include: { consortium: true },
  });
  return toVehicleDTO(created);
}

export async function updateVehicle(id: string, body: UpdateVehicleBody): Promise<VehicleDTO> {
  const data: Prisma.VehicleUpdateInput = {};
  if (body.plate !== undefined) data.plate = body.plate;
  if (body.km !== undefined) data.km = body.km;
  if (body.lastInspectionDate !== undefined) data.lastInspectionDate = body.lastInspectionDate;
  if (body.type !== undefined) {
    data.type = vehicleTypeFromDisplay[body.type as keyof typeof vehicleTypeFromDisplay];
  }
  if (body.state !== undefined) {
    data.state = vehicleStateFromDisplay[body.state as keyof typeof vehicleStateFromDisplay];
  }
  if (body.currentRouteCode !== undefined) {
    data.currentRoute = body.currentRouteCode
      ? { connect: { code: body.currentRouteCode } }
      : { disconnect: true };
  }
  if (body.consortium !== undefined) {
    data.consortium = { connect: { id: await resolveConsortiumId(body.consortium) } };
  }

  const updated = await prisma.vehicle.update({
    where: { id },
    data,
    include: { consortium: true },
  });
  return toVehicleDTO(updated);
}

export async function deleteVehicle(id: string): Promise<void> {
  await prisma.vehicle.delete({ where: { id } });
}
