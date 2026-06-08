import type { Request, Response } from 'express';
import { listVehicles } from './vehicles.service.js';
import type { ListVehiclesQuery } from './vehicles.schema.js';

export async function listVehiclesHandler(req: Request, res: Response): Promise<void> {
  const query = req.valid!.query as ListVehiclesQuery;
  res.json(await listVehicles(query));
}
