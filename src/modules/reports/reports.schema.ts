import { z } from 'zod';

// Formato de salida de los reportes: JSON por defecto o CSV (RF-26).
const formatSchema = z.enum(['json', 'csv']).default('json');

// Reporte diario de operacion (RF-22). La fecha es opcional y por defecto
// se toma el dia de hoy. Se espera formato YYYY-MM-DD.
export const dailyReportQuerySchema = z.object({
  date: z.string().date().optional(),
  format: formatSchema,
});
export type DailyReportQuery = z.infer<typeof dailyReportQuerySchema>;

// Reporte mensual de mantenimiento (RF-23). El mes es opcional y por defecto
// se toma el mes actual. Se espera formato YYYY-MM.
export const monthlyReportQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'El mes debe tener formato YYYY-MM')
    .optional(),
  format: formatSchema,
});
export type MonthlyReportQuery = z.infer<typeof monthlyReportQuerySchema>;

// Reporte de fallas recurrentes (RF-21). Solo cuenta mantenimientos
// correctivos. Acepta formato de salida.
export const recurringFailuresQuerySchema = z.object({
  format: formatSchema,
});
export type RecurringFailuresQuery = z.infer<typeof recurringFailuresQuerySchema>;
