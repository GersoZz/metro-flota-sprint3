import { z } from 'zod';

export const unitIdParamSchema = z.object({
  id: z.string().trim().min(1),
});
