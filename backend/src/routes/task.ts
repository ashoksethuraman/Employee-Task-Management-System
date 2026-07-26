import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate';
import { idParamSchema } from '../schemas/common';
import { createTaskSchema, updateTaskSchema } from '../schemas/task';
import { listTasks, createNewTask, getTask, updateExistingTask, removeTask } from '../controllers/taskController';

const router = express.Router();

router.use(requireAuth);
router.get('/', listTasks);
router.post('/', requireRole(['ADMIN', 'MANAGER']), validateBody(createTaskSchema), createNewTask);
router.get('/:id', validateParams(idParamSchema), getTask);
router.put('/:id', validateParams(idParamSchema), requireRole(['ADMIN', 'MANAGER', 'EMPLOYEE']), validateBody(updateTaskSchema), updateExistingTask);
router.delete('/:id', validateParams(idParamSchema), requireRole(['ADMIN', 'MANAGER']), removeTask);

export default router;
