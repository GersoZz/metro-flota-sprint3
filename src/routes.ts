import { Router } from 'express';
import { vehiclesRouter } from './modules/vehicles/vehicles.routes.js';
import { routesRouter } from './modules/routes/routes.routes.js';
import { stopsRouter } from './modules/stops/stops.routes.js';
import { consortiumsRouter } from './modules/consortiums/consortiums.routes.js';
import { driversRouter } from './modules/drivers/drivers.routes.js';
import { alertsRouter } from './modules/alerts/alerts.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { monitoringRouter } from './modules/monitoring/monitoring.routes.js';
import { authenticate } from './middlewares/authenticate.js';

export const apiRouter: Router = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'MetroFlota API v1', status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/vehicles', authenticate, vehiclesRouter);
apiRouter.use('/routes', authenticate, routesRouter);
apiRouter.use('/stops', authenticate, stopsRouter);
apiRouter.use('/consortiums', authenticate, consortiumsRouter);
apiRouter.use('/drivers', authenticate, driversRouter);
apiRouter.use('/alerts', authenticate, alertsRouter);
apiRouter.use('/dashboard', authenticate, dashboardRouter);
apiRouter.use('/monitoring', monitoringRouter);
