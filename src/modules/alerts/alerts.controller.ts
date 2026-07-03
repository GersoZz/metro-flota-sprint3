import type { Request, Response } from 'express';
import { acknowledgeAlert, listAlerts, unacknowledgeAlert } from './alerts.service.js';
import type { ListAlertsQuery } from './alerts.schema.js';

export async function listAlertsHandler(req: Request, res: Response): Promise<void> {
  const query = req.valid!.query as ListAlertsQuery;
  res.json(await listAlerts(query));
}

export async function acknowledgeAlertHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  res.json(await acknowledgeAlert(id));
}

export async function unacknowledgeAlertHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.valid!.params as { id: string };
  res.json(await unacknowledgeAlert(id));
}
