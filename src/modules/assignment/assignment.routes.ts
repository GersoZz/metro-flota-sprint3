import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { WRITE_ROLES } from '../../lib/rbac.js';
import { assignSchema } from './assignment.schema.js';
import { assignHandler, conflictsHandler } from './assignment.controller.js';

export const assignmentRouter: Router = Router();

assignmentRouter.get('/conflicts', asyncHandler(conflictsHandler));

assignmentRouter.post(
  '/',
  requireRole(...WRITE_ROLES),
  validate({ body: assignSchema }),
  asyncHandler(assignHandler),
);
