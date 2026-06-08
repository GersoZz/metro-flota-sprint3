import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { alertIdParamSchema, listAlertsQuerySchema } from './alerts.schema.js';
import { acknowledgeAlertHandler, listAlertsHandler } from './alerts.controller.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { ACK_ROLES } from '../../lib/rbac.js';

export const alertsRouter: Router = Router();

alertsRouter.get('/', validate({ query: listAlertsQuerySchema }), asyncHandler(listAlertsHandler));

alertsRouter.patch(
  '/:id/acknowledge',
  requireRole(...ACK_ROLES),
  validate({ params: alertIdParamSchema }),
  asyncHandler(acknowledgeAlertHandler),
);
