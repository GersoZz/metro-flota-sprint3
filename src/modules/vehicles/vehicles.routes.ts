import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { listVehiclesQuerySchema } from './vehicles.schema.js';
import { listVehiclesHandler } from './vehicles.controller.js';

export const vehiclesRouter: Router = Router();

vehiclesRouter.get(
  '/',
  validate({ query: listVehiclesQuerySchema }),
  asyncHandler(listVehiclesHandler),
);
