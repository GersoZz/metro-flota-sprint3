import type { Request, Response } from 'express';
import { getRoutesSummary, listRoutes } from './routes.service.js';
import type { ListRoutesQuery } from './routes.schema.js';

export async function listRoutesHandler(req: Request, res: Response): Promise<void> {
  const query = req.valid!.query as ListRoutesQuery;
  res.json(await listRoutes(query));
}

export async function routesSummaryHandler(_req: Request, res: Response): Promise<void> {
  res.json(await getRoutesSummary());
}
