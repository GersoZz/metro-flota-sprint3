import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { stopIdParamSchema, updateStopSchema } from './stops.schema.js';
import { deleteStopHandler, updateStopHandler } from './stops.controller.js';

export const stopsRouter: Router = Router();

stopsRouter.patch(
  '/:id',
  validate({ params: stopIdParamSchema, body: updateStopSchema }),
  asyncHandler(updateStopHandler),
);

stopsRouter.delete(
  '/:id',
  validate({ params: stopIdParamSchema }),
  asyncHandler(deleteStopHandler),
);
