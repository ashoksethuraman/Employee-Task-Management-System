import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from './appError';
import { getCorrelationId } from '@ashok92/correlation-id';
import { logger } from '../utils/logger';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', errors: err.errors });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  logger.error('unhandled_error', {
    path: req.originalUrl,
    method: req.method,
    correlationId: getCorrelationId(),
    error: err
  });
  res.status(500).json({ message: 'Internal server error' });
}
