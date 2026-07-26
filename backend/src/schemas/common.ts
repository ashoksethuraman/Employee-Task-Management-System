import { z } from 'zod';

const positiveIntegerString = z.string().regex(/^\d+$/, 'Must be a positive integer').refine((value) => Number(value) > 0, {
  message: 'Must be greater than zero',
});

export const idParamSchema = z.object({
  id: positiveIntegerString,
});

export const taskIdParamSchema = z.object({
  taskId: positiveIntegerString,
});