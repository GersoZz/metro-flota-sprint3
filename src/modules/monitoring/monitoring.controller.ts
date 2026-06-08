import type { Request, Response } from 'express';
import {
  getUnitPosition,
  getUnitRoute,
  getUnitStatus,
  listUnits,
} from './monitoring.service.js';
import { initSSE, sendEvent } from '../../realtime/sse.js';
import { env } from '../../config/env.js';

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

export async function streamUnitHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };

  const initial = await getUnitStatus(id);

  initSSE(res);
  sendEvent(res, initial);

  const interval = setInterval(() => {
    getUnitStatus(id)
      .then((status) => sendEvent(res, status))
      .catch(() => {});
  }, env.TELEMETRY_SIM_INTERVAL_MS);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
}
