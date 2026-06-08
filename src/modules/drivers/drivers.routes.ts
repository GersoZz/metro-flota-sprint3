import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { listDrivers } from './drivers.service.js';

export const driversRouter: Router = Router();

driversRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await listDrivers());
  }),
);
