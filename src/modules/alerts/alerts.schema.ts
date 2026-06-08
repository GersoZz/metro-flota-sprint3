import { z } from 'zod';
import { paginationQuerySchema } from '../../lib/pagination.js';

export const listAlertsQuerySchema = paginationQuerySchema.extend({
  tone: z.enum(['danger', 'warning']).optional(),
  acknowledged: z.enum(['true', 'false']).optional(),
});

export type ListAlertsQuery = z.infer<typeof listAlertsQuerySchema>;

export const alertIdParamSchema = z.object({
  id: z.string().trim().min(1),
});
