import type { Request, Response } from 'express';
import {
  getUnitPosition,
  getUnitRoute,
  getUnitStatus,
  listUnits,
} from './monitoring.service.js';

export async function listUnitsHandler(_req: Request, res: Response): Promise<void> {
  res.json(await listUnits());
}

export async function getUnitStatusHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  res.json(await getUnitStatus(id));
}

export async function getUnitRouteHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  res.json(await getUnitRoute(id));
}

export async function getUnitPositionHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  res.json(await getUnitPosition(id));
}
