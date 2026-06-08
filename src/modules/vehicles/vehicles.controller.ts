import type { Request, Response } from 'express';
import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
} from './vehicles.service.js';
import type {
  CreateVehicleBody,
  ListVehiclesQuery,
  UpdateVehicleBody,
} from './vehicles.schema.js';

export async function listVehiclesHandler(req: Request, res: Response): Promise<void> {
  const query = req.valid!.query as ListVehiclesQuery;
  res.json(await listVehicles(query));
}

export async function getVehicleHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  res.json(await getVehicle(id));
}

export async function createVehicleHandler(req: Request, res: Response): Promise<void> {
  const body = req.valid!.body as CreateVehicleBody;
  res.status(201).json(await createVehicle(body));
}

export async function updateVehicleHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  const body = req.valid!.body as UpdateVehicleBody;
  res.json(await updateVehicle(id, body));
}

export async function deleteVehicleHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  await deleteVehicle(id);
  res.status(204).end();
}
