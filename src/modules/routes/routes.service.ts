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
import type { ListRoutesQuery } from './routes.schema.js';

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
