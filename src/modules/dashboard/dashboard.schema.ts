import { z } from 'zod';

export const availabilityQuerySchema = z.object({
  range: z.enum(['week', 'month']).default('week'),
});
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

export const dashboardAlertsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(3),
});
export type DashboardAlertsQuery = z.infer<typeof dashboardAlertsQuerySchema>;
