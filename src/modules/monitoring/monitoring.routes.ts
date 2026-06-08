import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authenticateSSE } from '../../realtime/sse.js';
import { unitIdParamSchema } from './monitoring.schema.js';
import {
  getUnitPositionHandler,
  getUnitRouteHandler,
  getUnitStatusHandler,
  listUnitsHandler,
  streamUnitHandler,
} from './monitoring.controller.js';

export const monitoringRouter: Router = Router();

monitoringRouter.get('/units', authenticate, asyncHandler(listUnitsHandler));
monitoringRouter.get(
  '/units/:id',
  authenticate,
  validate({ params: unitIdParamSchema }),
  asyncHandler(getUnitStatusHandler),
);
monitoringRouter.get(
  '/units/:id/route',
  authenticate,
  validate({ params: unitIdParamSchema }),
  asyncHandler(getUnitRouteHandler),
);
monitoringRouter.get(
  '/units/:id/position',
  authenticate,
  validate({ params: unitIdParamSchema }),
  asyncHandler(getUnitPositionHandler),
);
monitoringRouter.get(
  '/units/:id/stream',
  authenticateSSE,
  validate({ params: unitIdParamSchema }),
  asyncHandler(streamUnitHandler),
);
