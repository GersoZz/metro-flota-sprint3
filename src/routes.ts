import { Router } from 'express';
import { vehiclesRouter } from './modules/vehicles/vehicles.routes.js';

export const apiRouter: Router = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'MetroFlota API v1', status: 'ok' });
});

apiRouter.use('/vehicles', vehiclesRouter);
