import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { exportGtfsHandler } from './gtfs.controller.js';

export const gtfsRouter: Router = Router();

gtfsRouter.get('/export', asyncHandler(exportGtfsHandler));
