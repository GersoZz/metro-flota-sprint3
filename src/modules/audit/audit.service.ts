import { prisma } from '../../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';
import {
  paginationQuerySchema,
  paginated,
  toSkipTake,
  type Pagination,
} from '../../lib/pagination.js';
import type { ListAuditQuery } from './audit.schema.js';

type AuditLogRow = Prisma.AuditLogGetPayload<object>;

export interface AuditLogDTO {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  detail: string | null;
  userId: string | null;
  createdAt: string;
}

function toDTO(row: AuditLogRow): AuditLogDTO {
  return {
    id: row.id,
    action: row.action,
    entity: row.entity,
    entityId: row.entityId,
    detail: row.detail,
    userId: row.userId,
    createdAt: row.createdAt.toISOString(),
  };
}

function buildWhere(query: ListAuditQuery): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};
  if (query.userId) where.userId = query.userId;
  if (query.entity) where.entity = query.entity;
  if (query.action) where.action = query.action;
  return where;
}

export async function listAuditLogs(query: ListAuditQuery) {
  const pagination: Pagination = paginationQuerySchema.parse(query);
  const where = buildWhere(query);

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...toSkipTake(pagination),
    }),
    prisma.auditLog.count({ where }),
  ]);

  return paginated(rows.map(toDTO), total, pagination);
}
