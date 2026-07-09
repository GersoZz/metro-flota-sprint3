import { z } from 'zod';
import { paginationQuerySchema } from '../../lib/pagination.js';

const maintenanceType = z.enum(['Preventivo', 'Correctivo']);
// EnCurso es el nombre interno del enum en Prisma (la columna guarda "En Curso").
const maintenanceStatus = z.enum(['Programado', 'EnCurso', 'Completado']);

export const listMaintenanceQuerySchema = paginationQuerySchema.extend({
  vehicleId: z.string().trim().min(1).optional(),
  type: maintenanceType.optional(),
  status: maintenanceStatus.optional(),
});

export type ListMaintenanceQuery = z.infer<typeof listMaintenanceQuerySchema>;

// Datos para programar o registrar un mantenimiento.
export const createMaintenanceSchema = z.object({
  vehicleId: z.string().trim().min(1),
  type: maintenanceType,
  description: z.string().trim().min(1),
  thresholdKm: z.number().int().positive().optional(),
  scheduledDate: z.string().date().optional(),
  executedDate: z.string().date().optional(),
  components: z.string().trim().optional(),
  costEstimate: z.number().nonnegative().optional(),
  hours: z.number().nonnegative().optional(),
  technician: z.string().trim().optional(),
});

export type CreateMaintenanceBody = z.infer<typeof createMaintenanceSchema>;

export const updateMaintenanceSchema = createMaintenanceSchema
  .partial()
  .extend({ status: maintenanceStatus.optional() });

export type UpdateMaintenanceBody = z.infer<typeof updateMaintenanceSchema>;

export const maintenanceIdParamSchema = z.object({
  id: z.string().trim().min(1),
});
