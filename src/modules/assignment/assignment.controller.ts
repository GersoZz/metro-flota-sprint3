import type { Request, Response } from 'express';
import { assignVehicleToRoute, detectConflicts } from './assignment.service.js';
import type { AssignBody } from './assignment.schema.js';

export async function assignHandler(req: Request, res: Response): Promise<void> {
  const body = req.valid!.body as AssignBody;
  res.status(201).json(await assignVehicleToRoute(body));
}

export async function conflictsHandler(_req: Request, res: Response): Promise<void> {
  res.json(await detectConflicts());
}
