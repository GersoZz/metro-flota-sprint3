import { z } from 'zod';

// Body del endpoint de simulacion de escenarios (RF-10).
// routeCode identifica la ruta para tomar su longitud por defecto.
// lengthKm y avgSpeedKmh son opcionales y sobrescriben los valores de la ruta.
export const simulateScenarioSchema = z.object({
  routeCode: z.string().trim().min(1),
  buses: z.number().int().positive(),
  targetHeadwayMin: z.number().positive().optional(),
  lengthKm: z.number().positive().optional(),
  avgSpeedKmh: z.number().positive().optional(),
});

export type SimulateScenarioBody = z.infer<typeof simulateScenarioSchema>;
