import { Router } from 'express';
import { vehiclesRouter } from './modules/vehicles/vehicles.routes.js';
import { routesRouter } from './modules/routes/routes.routes.js';
import { stopsRouter } from './modules/stops/stops.routes.js';
import { consortiumsRouter } from './modules/consortiums/consortiums.routes.js';
import { driversRouter } from './modules/drivers/drivers.routes.js';

export const apiRouter: Router = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'MetroFlota API v1', status: 'ok' });
});

apiRouter.use('/vehicles', vehiclesRouter);
apiRouter.use('/routes', routesRouter);
apiRouter.use('/stops', stopsRouter);
apiRouter.use('/consortiums', consortiumsRouter);
apiRouter.use('/drivers', driversRouter);
