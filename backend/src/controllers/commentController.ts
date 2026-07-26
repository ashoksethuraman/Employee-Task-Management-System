import { Request, Response, NextFunction } from 'express';
import { addComment, getCommentsForTask } from '../services/commentService';

export async function createComment(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const { taskId, body } = req.body;
    const comment = await addComment(taskId, user.id, body);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
}

export async function listComments(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = Number(req.params.taskId);
    const comments = await getCommentsForTask(taskId);
    res.json(comments);
  } catch (error) {
    next(error);
  }
}
