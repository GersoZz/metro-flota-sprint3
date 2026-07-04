import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { PLANNING_ROLES } from '../../lib/rbac.js';
import { simulateScenarioSchema } from './simulation.schema.js';
import { simulateScenarioHandler } from './simulation.controller.js';

export const simulationRouter: Router = Router();

// POST /simulation/scenario: calcula headway y espera promedio para un escenario.
// Es planificacion, asi que lo restringimos a los roles de planificacion.
simulationRouter.post(
  '/scenario',
  requireRole(...PLANNING_ROLES),
  validate({ body: simulateScenarioSchema }),
  asyncHandler(simulateScenarioHandler),
);
