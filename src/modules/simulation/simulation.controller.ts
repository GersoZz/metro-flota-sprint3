import type { Request, Response } from 'express';
import { runScenario } from './simulation.service.js';
import type { SimulateScenarioBody } from './simulation.schema.js';

export async function simulateScenarioHandler(req: Request, res: Response): Promise<void> {
  const body = req.valid!.body as SimulateScenarioBody;
  res.json(await runScenario(body));
}
