import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { listConsortiums } from './consortiums.service.js';

export const consortiumsRouter: Router = Router();

consortiumsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await listConsortiums());
  }),
);
