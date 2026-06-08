import { prisma } from '../../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';
import {
  paginationQuerySchema,
  paginated,
  toSkipTake,
  type Pagination,
} from '../../lib/pagination.js';
import { AppError } from '../../lib/AppError.js';
import type { ListAlertsQuery } from './alerts.schema.js';

type AlertRow = Prisma.AlertGetPayload<object>;

export interface AlertDTO {
  id: string;
  title: string;
  text: string;
  tone: string;
  vehicleId: string | null;
  routeCode: string | null;
  createdAt: string;
  acknowledgedAt: string | null;
}

function toAlertDTO(a: AlertRow): AlertDTO {
  return {
    id: a.id,
    title: a.title,
    text: a.text,
    tone: a.tone,
    vehicleId: a.vehicleId,
    routeCode: a.routeCode,
    createdAt: a.createdAt.toISOString(),
    acknowledgedAt: a.acknowledgedAt ? a.acknowledgedAt.toISOString() : null,
  };
}

function buildWhere(query: ListAlertsQuery): Prisma.AlertWhereInput {
  const where: Prisma.AlertWhereInput = {};
  if (query.tone) where.tone = query.tone;
  if (query.acknowledged === 'true') where.acknowledgedAt = { not: null };
  if (query.acknowledged === 'false') where.acknowledgedAt = null;
  return where;
}

export async function listAlerts(query: ListAlertsQuery) {
  const pagination: Pagination = paginationQuerySchema.parse(query);
  const where = buildWhere(query);

  const [rows, total] = await Promise.all([
    prisma.alert.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(pagination) }),
    prisma.alert.count({ where }),
  ]);

  return paginated(rows.map(toAlertDTO), total, pagination);
}

export async function acknowledgeAlert(id: string): Promise<AlertDTO> {
  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert) throw AppError.notFound(`Alerta no encontrada: ${id}`);
  if (alert.acknowledgedAt) return toAlertDTO(alert);

  const updated = await prisma.alert.update({
    where: { id },
    data: { acknowledgedAt: new Date() },
  });
  return toAlertDTO(updated);
}
