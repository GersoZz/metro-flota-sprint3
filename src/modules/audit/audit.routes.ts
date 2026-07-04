import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { listAuditQuerySchema } from './audit.schema.js';
import { listAuditHandler } from './audit.controller.js';

export const auditRouter: Router = Router();

// Solo el admin puede leer el log de auditoria (RF-29).
auditRouter.get(
  '/',
  requireRole('admin'),
  validate({ query: listAuditQuerySchema }),
  asyncHandler(listAuditHandler),
);
