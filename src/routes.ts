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
import { gtfsRouter } from './modules/gtfs/gtfs.routes.js';
import { maintenanceRouter } from './modules/maintenance/maintenance.routes.js';
import { assignmentRouter } from './modules/assignment/assignment.routes.js';
import { simulationRouter } from './modules/simulation/simulation.routes.js';
import { reportsRouter } from './modules/reports/reports.routes.js';
import { auditRouter } from './modules/audit/audit.routes.js';
import { authenticate } from './middlewares/authenticate.js';
import { auditLog } from './middlewares/auditLog.js';

export const apiRouter: Router = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'MetroFlota API v1', status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/vehicles', authenticate, auditLog, vehiclesRouter);
apiRouter.use('/routes', authenticate, auditLog, routesRouter);
apiRouter.use('/stops', authenticate, auditLog, stopsRouter);
apiRouter.use('/consortiums', authenticate, consortiumsRouter);
apiRouter.use('/drivers', authenticate, driversRouter);
apiRouter.use('/alerts', authenticate, auditLog, alertsRouter);
apiRouter.use('/dashboard', authenticate, dashboardRouter);
apiRouter.use('/monitoring', monitoringRouter);
apiRouter.use('/gtfs', authenticate, gtfsRouter);
apiRouter.use('/maintenance', authenticate, auditLog, maintenanceRouter);
apiRouter.use('/assignment', authenticate, auditLog, assignmentRouter);
apiRouter.use('/simulation', authenticate, simulationRouter);
apiRouter.use('/reports', authenticate, reportsRouter);
apiRouter.use('/audit', authenticate, auditRouter);
