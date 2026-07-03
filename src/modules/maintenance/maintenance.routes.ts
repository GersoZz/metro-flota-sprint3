import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { WRITE_ROLES } from '../../lib/rbac.js';
import {
  createMaintenanceSchema,
  listMaintenanceQuerySchema,
  maintenanceIdParamSchema,
  updateMaintenanceSchema,
} from './maintenance.schema.js';
import {
  createMaintenanceHandler,
  deleteMaintenanceHandler,
  getMaintenanceHandler,
  listMaintenanceHandler,
  updateMaintenanceHandler,
} from './maintenance.controller.js';

export const maintenanceRouter: Router = Router();

maintenanceRouter.get(
  '/',
  validate({ query: listMaintenanceQuerySchema }),
  asyncHandler(listMaintenanceHandler),
);

maintenanceRouter.get(
  '/:id',
  validate({ params: maintenanceIdParamSchema }),
  asyncHandler(getMaintenanceHandler),
);

maintenanceRouter.post(
  '/',
  requireRole(...WRITE_ROLES),
  validate({ body: createMaintenanceSchema }),
  asyncHandler(createMaintenanceHandler),
);

maintenanceRouter.patch(
  '/:id',
  requireRole(...WRITE_ROLES),
  validate({ params: maintenanceIdParamSchema, body: updateMaintenanceSchema }),
  asyncHandler(updateMaintenanceHandler),
);

maintenanceRouter.delete(
  '/:id',
  requireRole(...WRITE_ROLES),
  validate({ params: maintenanceIdParamSchema }),
  asyncHandler(deleteMaintenanceHandler),
);
