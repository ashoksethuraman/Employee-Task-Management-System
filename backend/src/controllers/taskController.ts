import { Request, Response, NextFunction } from 'express';
import { getTasksForUser, createTask, getTaskById, updateTask, deleteTask } from '../services/taskService';
import { eventBus } from '../services/eventBusService';

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const tasks = await getTasksForUser(user.id, user.role);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function createNewTask(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const { title, description, assigneeId, projectId } = req.body;
    const task = await createTask(title, description, assigneeId, user.id, projectId);
    
    // 📢 Publish task.created event
    await eventBus.publish('task.created', {
      taskId: task.id,
      title: task.title,
      assigneeId: task.assigneeId,
      creatorId: user.id,
      creatorName: user.name
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = Number(req.params.id);
    const task = await getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateExistingTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = Number(req.params.id);
    const user = (req as any).user;
    const data = req.body;
    const task = await getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (user.role === 'EMPLOYEE' && task.assigneeId !== user.id) {
      return res.status(403).json({ message: 'Forbidden: cannot edit this task' });
    }

    const updated = await updateTask(taskId, data);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function removeTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = Number(req.params.id);
    await deleteTask(taskId);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
}
