import { prisma } from '../../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';
import {
  paginationQuerySchema,
  paginated,
  toSkipTake,
  type Pagination,
} from '../../lib/pagination.js';
import {
  routeStateFromDisplay,
  routeStateToDisplay,
  routeTypeFromDisplay,
  routeTypeToDisplay,
} from '../../lib/domainEnums.js';
import { AppError } from '../../lib/AppError.js';
import type { CreateRouteBody, ListRoutesQuery, UpdateRouteBody } from './routes.schema.js';

type RouteRow = Prisma.RouteGetPayload<{ include: { _count: { select: { stops: true } } } }>;

export interface RouteDTO {
  code: string;
  name: string;
  type: string;
  stops: number;
  length: number;
  frequencyMinutes: number;
  buses: number;
  state: string;
}

function toRouteDTO(r: RouteRow): RouteDTO {
  return {
    code: r.code,
    name: r.name,
    type: routeTypeToDisplay[r.type],
    stops: r._count.stops,
    length: Number(r.lengthKm),
    frequencyMinutes: r.frequencyMinutes,
    buses: r.busesAssigned,
    state: routeStateToDisplay[r.state],
  };
}

function buildWhere(query: ListRoutesQuery): Prisma.RouteWhereInput {
  const where: Prisma.RouteWhereInput = {};
  if (query.state) where.state = routeStateFromDisplay[query.state as keyof typeof routeStateFromDisplay];
  if (query.type) where.type = routeTypeFromDisplay[query.type as keyof typeof routeTypeFromDisplay];
  return where;
}

export async function listRoutes(query: ListRoutesQuery) {
  const pagination: Pagination = paginationQuerySchema.parse(query);
  const where = buildWhere(query);

  const [rows, total] = await Promise.all([
    prisma.route.findMany({
      where,
      include: { _count: { select: { stops: true } } },
      orderBy: { code: 'asc' },
      ...toSkipTake(pagination),
    }),
    prisma.route.count({ where }),
  ]);

  return paginated(rows.map(toRouteDTO), total, pagination);
}

export interface RoutesSummary {
  total: number;
  active: number;
  review: number;
  suspended: number;
}

export async function getRoutesSummary(): Promise<RoutesSummary> {
  const grouped = await prisma.route.groupBy({ by: ['state'], _count: { _all: true } });
  const countOf = (state: keyof typeof routeStateToDisplay): number =>
    grouped.find((g) => g.state === state)?._count._all ?? 0;

  return {
    total: grouped.reduce((acc, g) => acc + g._count._all, 0),
    active: countOf('Activa'),
    review: countOf('EnRevision'),
    suspended: countOf('Suspendida'),
  };
}

export interface StopDTO {
  id: string;
  name: string;
  order: number;
  lat: number | null;
  lng: number | null;
}

type StopRow = { id: string; name: string; order: number; lat: unknown; lng: unknown };

function toStopDTO(s: StopRow): StopDTO {
  return {
    id: s.id,
    name: s.name,
    order: s.order,
    lat: s.lat != null ? Number(s.lat) : null,
    lng: s.lng != null ? Number(s.lng) : null,
  };
}

export interface RouteDetailDTO extends Omit<RouteDTO, 'stops'> {
  stopsCount: number;
  stops: StopDTO[];
}

export async function getRoute(code: string): Promise<RouteDetailDTO> {
  const route = await prisma.route.findUnique({
    where: { code },
    include: {
      _count: { select: { stops: true } },
      stops: { orderBy: { order: 'asc' } },
    },
  });
  if (!route) throw AppError.notFound(`Ruta no encontrada: ${code}`);

  return {
    code: route.code,
    name: route.name,
    type: routeTypeToDisplay[route.type],
    stopsCount: route._count.stops,
    length: Number(route.lengthKm),
    frequencyMinutes: route.frequencyMinutes,
    buses: route.busesAssigned,
    state: routeStateToDisplay[route.state],
    stops: route.stops.map(toStopDTO),
  };
}

export async function getRouteStops(code: string): Promise<StopDTO[]> {
  const route = await prisma.route.findUnique({ where: { code }, select: { code: true } });
  if (!route) throw AppError.notFound(`Ruta no encontrada: ${code}`);
  const stops = await prisma.stop.findMany({ where: { routeCode: code }, orderBy: { order: 'asc' } });
  return stops.map(toStopDTO);
}

export async function createRoute(body: CreateRouteBody): Promise<RouteDTO> {
  const created = await prisma.route.create({
    data: {
      code: body.code,
      name: body.name,
      type: routeTypeFromDisplay[body.type as keyof typeof routeTypeFromDisplay],
      lengthKm: body.length,
      frequencyMinutes: body.frequencyMinutes,
      busesAssigned: body.buses,
      state: routeStateFromDisplay[body.state as keyof typeof routeStateFromDisplay],
    },
    include: { _count: { select: { stops: true } } },
  });
  return toRouteDTO(created);
}

export async function updateRoute(code: string, body: UpdateRouteBody): Promise<RouteDTO> {
  const data: Prisma.RouteUpdateInput = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.length !== undefined) data.lengthKm = body.length;
  if (body.frequencyMinutes !== undefined) data.frequencyMinutes = body.frequencyMinutes;
  if (body.buses !== undefined) data.busesAssigned = body.buses;
  if (body.type !== undefined) {
    data.type = routeTypeFromDisplay[body.type as keyof typeof routeTypeFromDisplay];
  }
  if (body.state !== undefined) {
    data.state = routeStateFromDisplay[body.state as keyof typeof routeStateFromDisplay];
  }

  const updated = await prisma.route.update({
    where: { code },
    data,
    include: { _count: { select: { stops: true } } },
  });
  return toRouteDTO(updated);
}

export async function deleteRoute(code: string): Promise<void> {
  await prisma.route.delete({ where: { code } });
}
