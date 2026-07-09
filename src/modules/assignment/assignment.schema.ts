import { z } from 'zod';

// Cuerpo del POST /assignment: asignar un vehiculo a una ruta (RF-08).
export const assignSchema = z.object({
  vehicleId: z.string().trim().min(1),
  routeCode: z.string().trim().min(1),
});

export type AssignBody = z.infer<typeof assignSchema>;
