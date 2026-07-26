import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name is required'),
  description: z.string().optional(),
});
