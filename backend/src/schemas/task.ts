import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  assigneeId: z.number().int().positive('Assignee is required'),
  projectId: z.number().int().positive().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional(),
  assigneeId: z.number().int().positive().optional(),
  projectId: z.number().int().positive().optional(),
});
