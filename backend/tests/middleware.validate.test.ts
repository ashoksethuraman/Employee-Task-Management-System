import { z } from 'zod';
import { validateBody, validateParams } from '../src/middleware/validate';

describe('validateBody', () => {
  it('parses valid body and calls next', () => {
    const schema = z.object({ name: z.string() });
    const middleware = validateBody(schema);

    const req: any = { body: { name: 'Alice' } };
    const res: any = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(req.body).toEqual({ name: 'Alice' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('forwards parse errors to next', () => {
    const schema = z.object({ age: z.number().int().positive() });
    const middleware = validateBody(schema);

    const req: any = { body: { age: -1 } };
    const res: any = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeDefined();
  });
});

describe('validateParams', () => {
  it('parses valid params and calls next', () => {
    const schema = z.object({ id: z.string().regex(/^\d+$/) });
    const middleware = validateParams(schema);

    const req: any = { params: { id: '12' } };
    const res: any = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(req.params).toEqual({ id: '12' });
    expect(next).toHaveBeenCalledWith();
  });

  it('forwards param parse errors to next', () => {
    const schema = z.object({ id: z.string().regex(/^\d+$/) });
    const middleware = validateParams(schema);

    const req: any = { params: { id: 'abc' } };
    const res: any = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeDefined();
  });
});
