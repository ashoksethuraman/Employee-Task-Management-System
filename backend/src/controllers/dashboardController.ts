import { Request, Response, NextFunction } from 'express';
import { getSummary } from '../services/dashboardService';

export async function getDashboardSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const summary = await getSummary(user.id, user.role);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}
