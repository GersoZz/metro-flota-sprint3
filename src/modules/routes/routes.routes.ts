import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import {
  createRouteSchema,
  listRoutesQuerySchema,
  routeCodeParamSchema,
  updateRouteSchema,
} from './routes.schema.js';
import {
  createRouteHandler,
  deleteRouteHandler,
  getRouteHandler,
  getRouteStopsHandler,
  listRoutesHandler,
  routesSummaryHandler,
  updateRouteHandler,
} from './routes.controller.js';
import { createStopSchema } from '../stops/stops.schema.js';
import { createStopHandler } from '../stops/stops.controller.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { WRITE_ROLES } from '../../lib/rbac.js';

export const routesRouter: Router = Router();

routesRouter.get('/summary', asyncHandler(routesSummaryHandler));

routesRouter.get('/', validate({ query: listRoutesQuerySchema }), asyncHandler(listRoutesHandler));

routesRouter.post(
  '/',
  requireRole(...WRITE_ROLES),
  validate({ body: createRouteSchema }),
  asyncHandler(createRouteHandler),
);

routesRouter.get('/:code', validate({ params: routeCodeParamSchema }), asyncHandler(getRouteHandler));
routesRouter.get(
  '/:code/stops',
  validate({ params: routeCodeParamSchema }),
  asyncHandler(getRouteStopsHandler),
);
routesRouter.post(
  '/:code/stops',
  requireRole(...WRITE_ROLES),
  validate({ params: routeCodeParamSchema, body: createStopSchema }),
  asyncHandler(createStopHandler),
);
routesRouter.patch(
  '/:code',
  requireRole(...WRITE_ROLES),
  validate({ params: routeCodeParamSchema, body: updateRouteSchema }),
  asyncHandler(updateRouteHandler),
);
routesRouter.delete(
  '/:code',
  requireRole(...WRITE_ROLES),
  validate({ params: routeCodeParamSchema }),
  asyncHandler(deleteRouteHandler),
);
