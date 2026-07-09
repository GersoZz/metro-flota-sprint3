import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { availabilityQuerySchema, dashboardAlertsQuerySchema } from './dashboard.schema.js';
import {
  availabilityHandler,
  dashboardAlertsHandler,
  kpisHandler,
  adherenceHandler,
  routeComplianceHandler,
} from './dashboard.controller.js';

export const dashboardRouter: Router = Router();

dashboardRouter.get('/kpis', asyncHandler(kpisHandler));
dashboardRouter.get(
  '/availability',
  validate({ query: availabilityQuerySchema }),
  asyncHandler(availabilityHandler),
);
dashboardRouter.get('/route-compliance', asyncHandler(routeComplianceHandler));
dashboardRouter.get('/adherence', asyncHandler(adherenceHandler));
dashboardRouter.get(
  '/alerts',
  validate({ query: dashboardAlertsQuerySchema }),
  asyncHandler(dashboardAlertsHandler),
);
