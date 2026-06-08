import { z } from 'zod';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { routeStateDisplays, routeTypeDisplays } from '../../lib/domainEnums.js';

export const listRoutesQuerySchema = paginationQuerySchema.extend({
  state: z.enum(routeStateDisplays as [string, ...string[]]).optional(),
  type: z.enum(routeTypeDisplays as [string, ...string[]]).optional(),
});

export type ListRoutesQuery = z.infer<typeof listRoutesQuerySchema>;
