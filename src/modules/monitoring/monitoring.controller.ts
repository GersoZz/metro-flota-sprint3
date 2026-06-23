import type { Request, Response } from 'express';
import {
  getUnitPosition,
  getUnitRoute,
  getUnitStatus,
  listUnits,
} from './monitoring.service.js';
import { initSSE, sendEvent } from '../../realtime/sse.js';
import { telemetryBus } from '../../realtime/TelemetryBus.js';
import { SseObserver } from '../../realtime/observers/SseObserver.js';

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

  // Hacemos una suscripción a la telemetría para recibir updates en tiempo real del vehículo
  // Cada vez que se recibe un evento, se envía al cliente SSE.
  const unsubscribe = telemetryBus.subscribe(id, new SseObserver(res));

  req.on('close', () => {
    unsubscribe();
    res.end();
  });
}
