import type { Request, Response } from 'express';
import { listAuditLogs } from './audit.service.js';
import type { ListAuditQuery } from './audit.schema.js';

export async function listAuditHandler(req: Request, res: Response): Promise<void> {
  const query = req.valid!.query as ListAuditQuery;
  res.json(await listAuditLogs(query));
}
