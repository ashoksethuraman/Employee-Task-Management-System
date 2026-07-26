import { z } from 'zod';
import { AppError } from '../src/middleware/appError';
import { errorHandler, notFound } from '../src/middleware/error';
import { logger } from '../src/utils/logger';

jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

function createRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('notFound', () => {
  it('returns 404 route not found', () => {
    const req: any = {};
    const res = createRes();

    notFound(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Route not found' });
  });
});

describe('errorHandler', () => {
  it('handles zod validation errors as 400', () => {
    const schema = z.object({ name: z.string().min(2) });
    const parsed = schema.safeParse({ name: '' });
    if (parsed.success) {
      throw new Error('Expected zod parse to fail');
    }

    const req: any = {};
    const res = createRes();
    const next = jest.fn();

    errorHandler(parsed.error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Validation failed' })
    );
  });

  it('handles AppError with custom status and message', () => {
    const req: any = {};
    const res = createRes();
    const next = jest.fn();

    errorHandler(new AppError('No access', 403), req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'No access' });
  });

  it('handles unknown errors as 500', () => {
    const req: any = {};
    const res = createRes();
    const next = jest.fn();

    errorHandler(new Error('boom'), req, res, next);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
