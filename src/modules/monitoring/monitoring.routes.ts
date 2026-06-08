import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { unitIdParamSchema } from './monitoring.schema.js';
import { getUnitStatusHandler, listUnitsHandler } from './monitoring.controller.js';

export const monitoringRouter: Router = Router();

monitoringRouter.get('/units', asyncHandler(listUnitsHandler));
monitoringRouter.get(
  '/units/:id',
  validate({ params: unitIdParamSchema }),
  asyncHandler(getUnitStatusHandler),
);
