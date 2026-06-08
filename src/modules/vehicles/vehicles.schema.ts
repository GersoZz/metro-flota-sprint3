import { z } from 'zod';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { vehicleStateDisplays, vehicleTypeDisplays } from '../../lib/domainEnums.js';

export const listVehiclesQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  state: z.enum(vehicleStateDisplays as [string, ...string[]]).optional(),
  type: z.enum(vehicleTypeDisplays as [string, ...string[]]).optional(),
  consortium: z.string().trim().min(1).optional(),
});

export type ListVehiclesQuery = z.infer<typeof listVehiclesQuerySchema>;
