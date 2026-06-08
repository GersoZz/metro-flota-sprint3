import { z } from 'zod';

const coord = z.number().min(-180).max(180);

export const stopIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const createStopSchema = z.object({
  name: z.string().trim().min(1),
  order: z.number().int().min(1).optional(),
  lat: coord.nullable().optional(),
  lng: coord.nullable().optional(),
});

export const updateStopSchema = z
  .object({
    name: z.string().trim().min(1),
    order: z.number().int().min(1),
    lat: coord.nullable(),
    lng: coord.nullable(),
  })
  .partial();

export type CreateStopBody = z.infer<typeof createStopSchema>;
export type UpdateStopBody = z.infer<typeof updateStopSchema>;
