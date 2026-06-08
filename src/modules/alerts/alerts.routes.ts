import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { alertIdParamSchema, listAlertsQuerySchema } from './alerts.schema.js';
import { acknowledgeAlertHandler, listAlertsHandler } from './alerts.controller.js';

export const alertsRouter: Router = Router();

alertsRouter.get('/', validate({ query: listAlertsQuerySchema }), asyncHandler(listAlertsHandler));

alertsRouter.patch(
  '/:id/acknowledge',
  validate({ params: alertIdParamSchema }),
  asyncHandler(acknowledgeAlertHandler),
);
