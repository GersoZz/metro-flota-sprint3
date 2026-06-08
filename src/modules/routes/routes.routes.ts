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

export const routesRouter: Router = Router();

routesRouter.get('/summary', asyncHandler(routesSummaryHandler));

routesRouter.get('/', validate({ query: listRoutesQuerySchema }), asyncHandler(listRoutesHandler));

routesRouter.post('/', validate({ body: createRouteSchema }), asyncHandler(createRouteHandler));

routesRouter.get('/:code', validate({ params: routeCodeParamSchema }), asyncHandler(getRouteHandler));
routesRouter.get(
  '/:code/stops',
  validate({ params: routeCodeParamSchema }),
  asyncHandler(getRouteStopsHandler),
);
routesRouter.patch(
  '/:code',
  validate({ params: routeCodeParamSchema, body: updateRouteSchema }),
  asyncHandler(updateRouteHandler),
);
routesRouter.delete(
  '/:code',
  validate({ params: routeCodeParamSchema }),
  asyncHandler(deleteRouteHandler),
);
