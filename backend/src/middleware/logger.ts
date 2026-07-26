import { Request, Response, NextFunction } from 'express';
import { getCorrelationId } from '@requestkit/correlation-id';
import { logger } from '../utils/logger';
import { sanitizeHeaders, sanitizeValue } from '../utils/logSanitizer';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  let responseBody: unknown;

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = ((body: unknown) => {
    responseBody = body;
    return originalJson(body as any);
  }) as Response['json'];

  res.send = ((body?: unknown) => {
    responseBody = body;
    return originalSend(body as any);
  }) as Response['send'];

  logger.info('api_in', {
    method: req.method,
    path: req.originalUrl,
    params: sanitizeValue(req.params),
    query: sanitizeValue(req.query),
    headers: sanitizeHeaders(req.headers),
    body: sanitizeValue(req.body),
    correlationId: getCorrelationId()
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('api_out', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      response: sanitizeValue(responseBody),
      correlationId: getCorrelationId()
    });
  });
  next();
}
