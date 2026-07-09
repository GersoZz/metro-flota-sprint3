import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';
import { simulateScenario as computeScenario } from './simulationMath.js';
import type { ScenarioResult } from './simulationMath.js';
import type { SimulateScenarioBody } from './simulation.schema.js';

// Velocidad promedio por defecto de un bus urbano cuando no se envia en el body.
const DEFAULT_AVG_SPEED_KMH = 20;

export interface ScenarioDTO extends ScenarioResult {
  routeCode: string;
  buses: number;
  lengthKm: number;
  avgSpeedKmh: number;
  targetHeadwayMin: number | null;
}

// Corre la simulacion de un escenario para una ruta existente.
// Toma la longitud de la ruta salvo que el body la sobrescriba.
export async function runScenario(body: SimulateScenarioBody): Promise<ScenarioDTO> {
  const route = await prisma.route.findUnique({
    where: { code: body.routeCode },
    select: { lengthKm: true },
  });
  if (!route) throw AppError.notFound(`Ruta no encontrada: ${body.routeCode}`);

  const lengthKm = body.lengthKm ?? Number(route.lengthKm);
  const avgSpeedKmh = body.avgSpeedKmh ?? DEFAULT_AVG_SPEED_KMH;

  const result = computeScenario({
    lengthKm,
    avgSpeedKmh,
    buses: body.buses,
    targetHeadwayMin: body.targetHeadwayMin,
  });

  return {
    routeCode: body.routeCode,
    buses: body.buses,
    lengthKm,
    avgSpeedKmh,
    targetHeadwayMin: body.targetHeadwayMin ?? null,
    ...result,
  };
}
