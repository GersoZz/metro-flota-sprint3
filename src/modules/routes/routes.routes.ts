import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { listRoutesQuerySchema } from './routes.schema.js';
import { listRoutesHandler, routesSummaryHandler } from './routes.controller.js';

export const routesRouter: Router = Router();

routesRouter.get('/summary', asyncHandler(routesSummaryHandler));

routesRouter.get('/', validate({ query: listRoutesQuerySchema }), asyncHandler(listRoutesHandler));
