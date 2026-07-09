import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import {
  dailyReportQuerySchema,
  monthlyReportQuerySchema,
  recurringFailuresQuerySchema,
} from './reports.schema.js';
import {
  dailyReportHandler,
  monthlyReportHandler,
  recurringFailuresHandler,
} from './reports.controller.js';

export const reportsRouter: Router = Router();

// RF-22: reporte diario de operacion. Acepta ?date=YYYY-MM-DD y ?format=csv.
reportsRouter.get(
  '/daily',
  validate({ query: dailyReportQuerySchema }),
  asyncHandler(dailyReportHandler),
);

// RF-23: reporte mensual de mantenimiento. Acepta ?month=YYYY-MM y ?format=csv.
reportsRouter.get(
  '/monthly',
  validate({ query: monthlyReportQuerySchema }),
  asyncHandler(monthlyReportHandler),
);

// RF-21: reporte de fallas recurrentes. Acepta ?format=csv.
reportsRouter.get(
  '/recurring-failures',
  validate({ query: recurringFailuresQuerySchema }),
  asyncHandler(recurringFailuresHandler),
);
