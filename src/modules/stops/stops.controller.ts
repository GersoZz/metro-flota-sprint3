import type { Request, Response } from 'express';
import { createStop, deleteStop, updateStop } from './stops.service.js';
import type { CreateStopBody, UpdateStopBody } from './stops.schema.js';

export async function createStopHandler(req: Request, res: Response): Promise<void> {
  const { code } = req.valid!.params as { code: string };
  const body = req.valid!.body as CreateStopBody;
  res.status(201).json(await createStop(code, body));
}

export async function updateStopHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  const body = req.valid!.body as UpdateStopBody;
  res.json(await updateStop(id, body));
}

export async function deleteStopHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  await deleteStop(id);
  res.status(204).end();
}
