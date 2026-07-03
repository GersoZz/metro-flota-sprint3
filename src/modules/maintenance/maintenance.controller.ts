import type { Request, Response } from 'express';
import {
  createMaintenance,
  deleteMaintenance,
  getMaintenance,
  listMaintenance,
  updateMaintenance,
} from './maintenance.service.js';
import type {
  CreateMaintenanceBody,
  ListMaintenanceQuery,
  UpdateMaintenanceBody,
} from './maintenance.schema.js';

export async function listMaintenanceHandler(req: Request, res: Response): Promise<void> {
  const query = req.valid!.query as ListMaintenanceQuery;
  res.json(await listMaintenance(query));
}

export async function getMaintenanceHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  res.json(await getMaintenance(id));
}

export async function createMaintenanceHandler(req: Request, res: Response): Promise<void> {
  const body = req.valid!.body as CreateMaintenanceBody;
  res.status(201).json(await createMaintenance(body));
}

export async function updateMaintenanceHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  const body = req.valid!.body as UpdateMaintenanceBody;
  res.json(await updateMaintenance(id, body));
}

export async function deleteMaintenanceHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  await deleteMaintenance(id);
  res.status(204).send();
}
