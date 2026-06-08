import type { Request, Response } from 'express';
import { getUnitStatus, listUnits } from './monitoring.service.js';

export async function listUnitsHandler(_req: Request, res: Response): Promise<void> {
  res.json(await listUnits());
}

export async function getUnitStatusHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  res.json(await getUnitStatus(id));
}
