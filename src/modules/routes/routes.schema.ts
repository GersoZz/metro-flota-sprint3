import { z } from 'zod';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { routeStateDisplays, routeTypeDisplays } from '../../lib/domainEnums.js';

export const listRoutesQuerySchema = paginationQuerySchema.extend({
  state: z.enum(routeStateDisplays as [string, ...string[]]).optional(),
  type: z.enum(routeTypeDisplays as [string, ...string[]]).optional(),
});

export type ListRoutesQuery = z.infer<typeof listRoutesQuerySchema>;

const typeEnum = z.enum(routeTypeDisplays as [string, ...string[]]);
const stateEnum = z.enum(routeStateDisplays as [string, ...string[]]);

export const routeCodeParamSchema = z.object({
  code: z.string().trim().min(1),
});

export const createRouteSchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  type: typeEnum,
  length: z.number().positive(),
  frequencyMinutes: z.number().int().positive(),
  buses: z.number().int().nonnegative().default(0),
  state: stateEnum.default('Activa'),
});

export const updateRouteSchema = z
  .object({
    name: z.string().trim().min(1),
    type: typeEnum,
    length: z.number().positive(),
    frequencyMinutes: z.number().int().positive(),
    buses: z.number().int().nonnegative(),
    state: stateEnum,
  })
  .partial();

export type CreateRouteBody = z.infer<typeof createRouteSchema>;
export type UpdateRouteBody = z.infer<typeof updateRouteSchema>;
