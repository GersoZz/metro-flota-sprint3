import type { Request, Response } from 'express';
import {
  getAvailability,
  getKpis,
  getRecentAlerts,
  getRouteCompliance,
} from './dashboard.service.js';
import type { AvailabilityQuery, DashboardAlertsQuery } from './dashboard.schema.js';

export async function kpisHandler(_req: Request, res: Response): Promise<void> {
  res.json(await getKpis());
}

export async function availabilityHandler(req: Request, res: Response): Promise<void> {
  const query = req.valid!.query as AvailabilityQuery;
  res.json(await getAvailability(query));
}

export async function routeComplianceHandler(_req: Request, res: Response): Promise<void> {
  res.json(await getRouteCompliance());
}

export async function dashboardAlertsHandler(req: Request, res: Response): Promise<void> {
  const query = req.valid!.query as DashboardAlertsQuery;
  res.json(await getRecentAlerts(query));
}
