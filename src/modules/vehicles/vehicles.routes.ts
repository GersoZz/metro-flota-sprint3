import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { WRITE_ROLES } from '../../lib/rbac.js';
import {
  createVehicleSchema,
  listVehiclesQuerySchema,
  updateVehicleSchema,
  vehicleIdParamSchema,
} from './vehicles.schema.js';
import {
  createVehicleHandler,
  deleteVehicleHandler,
  getVehicleHandler,
  listVehiclesHandler,
  updateVehicleHandler,
} from './vehicles.controller.js';

export const vehiclesRouter: Router = Router();

vehiclesRouter.get(
  '/',
  validate({ query: listVehiclesQuerySchema }),
  asyncHandler(listVehiclesHandler),
);

vehiclesRouter.post(
  '/',
  requireRole(...WRITE_ROLES),
  validate({ body: createVehicleSchema }),
  asyncHandler(createVehicleHandler),
);

vehiclesRouter.get(
  '/:id',
  validate({ params: vehicleIdParamSchema }),
  asyncHandler(getVehicleHandler),
);

vehiclesRouter.patch(
  '/:id',
  requireRole(...WRITE_ROLES),
  validate({ params: vehicleIdParamSchema, body: updateVehicleSchema }),
  asyncHandler(updateVehicleHandler),
);

vehiclesRouter.delete(
  '/:id',
  requireRole(...WRITE_ROLES),
  validate({ params: vehicleIdParamSchema }),
  asyncHandler(deleteVehicleHandler),
);
