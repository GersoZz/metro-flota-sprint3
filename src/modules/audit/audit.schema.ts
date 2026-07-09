import { z } from 'zod';
import { paginationQuerySchema } from '../../lib/pagination.js';

// Filtros para consultar el log de auditoria (RF-29).
export const listAuditQuerySchema = paginationQuerySchema.extend({
  userId: z.string().trim().min(1).optional(),
  entity: z.string().trim().min(1).optional(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE']).optional(),
});

export type ListAuditQuery = z.infer<typeof listAuditQuerySchema>;
