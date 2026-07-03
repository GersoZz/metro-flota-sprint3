import { z } from 'zod';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { vehicleStateDisplays, vehicleTypeDisplays } from '../../lib/domainEnums.js';

export const listVehiclesQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  state: z.enum(vehicleStateDisplays as [string, ...string[]]).optional(),
  type: z.enum(vehicleTypeDisplays as [string, ...string[]]).optional(),
  consortium: z.string().trim().min(1).optional(),
  route: z.string().trim().min(1).optional(),
});

export type ListVehiclesQuery = z.infer<typeof listVehiclesQuerySchema>;

const typeEnum = z.enum(vehicleTypeDisplays as [string, ...string[]]);
const stateEnum = z.enum(vehicleStateDisplays as [string, ...string[]]);

export const vehicleIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const createVehicleSchema = z.object({
  id: z.string().trim().min(1),
  plate: z.string().trim().min(1),
  type: typeEnum,
  consortium: z.string().trim().min(1),
  km: z.number().int().nonnegative().default(0),
  state: stateEnum.default('Operativo'),
  lastInspectionDate: z.coerce.date(),
  currentRouteCode: z.string().trim().min(1).nullable().optional(),
});

export const updateVehicleSchema = z
  .object({
    plate: z.string().trim().min(1),
    type: typeEnum,
    consortium: z.string().trim().min(1),
    km: z.number().int().nonnegative(),
    state: stateEnum,
    lastInspectionDate: z.coerce.date(),
    currentRouteCode: z.string().trim().min(1).nullable(),
  })
  .partial();

export type CreateVehicleBody = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleBody = z.infer<typeof updateVehicleSchema>;
