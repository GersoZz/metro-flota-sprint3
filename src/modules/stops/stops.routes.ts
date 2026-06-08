import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { stopIdParamSchema, updateStopSchema } from './stops.schema.js';
import { deleteStopHandler, updateStopHandler } from './stops.controller.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { WRITE_ROLES } from '../../lib/rbac.js';

export const stopsRouter: Router = Router();

stopsRouter.patch(
  '/:id',
  requireRole(...WRITE_ROLES),
  validate({ params: stopIdParamSchema, body: updateStopSchema }),
  asyncHandler(updateStopHandler),
);

stopsRouter.delete(
  '/:id',
  requireRole(...WRITE_ROLES),
  validate({ params: stopIdParamSchema }),
  asyncHandler(deleteStopHandler),
);
