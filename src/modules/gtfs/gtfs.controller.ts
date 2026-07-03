import type { Request, Response } from 'express';
import { exportGtfsFeed } from './gtfs.service.js';

// Devuelve el feed GTFS como JSON, con cada archivo del feed en su propio campo.
export async function exportGtfsHandler(_req: Request, res: Response): Promise<void> {
  res.json(await exportGtfsFeed());
}
