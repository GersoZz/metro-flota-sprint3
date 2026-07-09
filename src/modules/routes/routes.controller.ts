import type { Request, Response } from 'express';
import { AppError } from '../../lib/AppError.js';
import {
  createRoute,
  deleteRoute,
  getRoute,
  getRouteStops,
  getRoutesSummary,
  listRouteVersions,
  listRoutes,
  updateRoute,
  updateRouteImage,
} from './routes.service.js';
import type { CreateRouteBody, ListRoutesQuery, UpdateRouteBody } from './routes.schema.js';

export async function listRoutesHandler(req: Request, res: Response): Promise<void> {
  const query = req.valid!.query as ListRoutesQuery;
  res.json(await listRoutes(query));
}

export async function routesSummaryHandler(_req: Request, res: Response): Promise<void> {
  res.json(await getRoutesSummary());
}

export async function getRouteHandler(req: Request, res: Response): Promise<void> {
  const { code } = req.valid!.params as { code: string };
  res.json(await getRoute(code));
}

export async function getRouteStopsHandler(req: Request, res: Response): Promise<void> {
  const { code } = req.valid!.params as { code: string };
  res.json(await getRouteStops(code));
}

export async function getRouteVersionsHandler(req: Request, res: Response): Promise<void> {
  const { code } = req.valid!.params as { code: string };
  res.json(await listRouteVersions(code));
}

export async function createRouteHandler(req: Request, res: Response): Promise<void> {
  const body = req.valid!.body as CreateRouteBody;
  res.status(201).json(await createRoute(body));
}

export async function updateRouteHandler(req: Request, res: Response): Promise<void> {
  const { code } = req.valid!.params as { code: string };
  const body = req.valid!.body as UpdateRouteBody;
  res.json(await updateRoute(code, body));
}

export async function deleteRouteHandler(req: Request, res: Response): Promise<void> {
  const { code } = req.valid!.params as { code: string };
  await deleteRoute(code);
  res.status(204).end();
}

export async function updateRouteImageHandler(req: Request, res: Response): Promise<void> {
  const { code } = req.valid!.params as { code: string };
  if (!req.file) throw AppError.badRequest('Falta el archivo de imagen (campo "image")');
  res.json(await updateRouteImage(code, req.file.buffer));
}
