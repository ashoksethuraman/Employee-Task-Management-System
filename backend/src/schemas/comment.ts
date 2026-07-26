import { z } from 'zod';

export const createCommentSchema = z.object({
  taskId: z.number().int().positive('Task ID is required'),
  body: z.string().min(2, 'Comment body is required'),
});
