jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('@ashok92/correlation-id', () => ({
  getCorrelationId: jest.fn(() => 'corr-test-123')
}));

import { requestLogger } from '../src/middleware/logger';
import { logger } from '../src/utils/logger';

describe('requestLogger', () => {
  it('logs sanitized api_in and api_out payloads', () => {
    const req: any = {
      method: 'GET',
      originalUrl: '/api/tasks',
      params: { id: '1' },
      query: { search: 'design' },
      headers: {
        authorization: 'Bearer super-secret-token',
        'x-request-source': 'jest'
      },
      body: {
        email: 'user@example.com',
        password: 'plain-password',
        profile: {
          apiKey: 'my-api-key'
        }
      }
    };

    let finishHandler: Function | undefined;

    const res: any = {
      statusCode: 200,
      json: jest.fn().mockImplementation(function (payload: unknown) {
        return payload;
      }),
      send: jest.fn().mockImplementation(function (payload: unknown) {
        return payload;
      }),
      on: jest.fn((event: string, cb: Function) => {
        if (event === 'finish') {
          finishHandler = cb;
        }
      })
    };
    const next = jest.fn();

    requestLogger(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(typeof finishHandler).toBe('function');

    res.json({
      ok: true,
      accessToken: 'response-token',
      user: {
        id: 1,
        password: 'response-password'
      }
    });

    finishHandler?.();

    expect(logger.info).toHaveBeenCalledWith(
      'api_in',
      expect.objectContaining({
        method: 'GET',
        path: '/api/tasks',
        correlationId: 'corr-test-123',
        headers: expect.objectContaining({
          authorization: '[REDACTED]',
          'x-request-source': 'jest'
        }),
        body: expect.objectContaining({
          email: 'user@example.com',
          password: '[REDACTED]',
          profile: expect.objectContaining({
            apiKey: '[REDACTED]'
          })
        })
      })
    );

    expect(logger.info).toHaveBeenCalledWith(
      'api_out',
      expect.objectContaining({
        method: 'GET',
        path: '/api/tasks',
        statusCode: 200,
        correlationId: 'corr-test-123',
        response: expect.objectContaining({
          ok: true,
          accessToken: '[REDACTED]',
          user: expect.objectContaining({
            id: 1,
            password: '[REDACTED]'
          })
        })
      })
    );
  });

  it('redacts secrets when response is a JSON string', () => {
    const req: any = {
      method: 'GET',
      originalUrl: '/api/tasks',
      params: {},
      query: {},
      headers: {},
      body: {}
    };

    let finishHandler: Function | undefined;

    const res: any = {
      statusCode: 200,
      json: jest.fn().mockImplementation(function (payload: unknown) {
        return payload;
      }),
      send: jest.fn().mockImplementation(function (payload: unknown) {
        return payload;
      }),
      on: jest.fn((event: string, cb: Function) => {
        if (event === 'finish') {
          finishHandler = cb;
        }
      })
    };

    const next = jest.fn();

    requestLogger(req, res, next);

    res.send(
      JSON.stringify({
        assignee: {
          id: 5,
          password: 'hashed-password'
        },
        token: 'secret-token'
      })
    );

    finishHandler?.();

    expect(logger.info).toHaveBeenCalledWith(
      'api_out',
      expect.objectContaining({
        response: expect.objectContaining({
          assignee: expect.objectContaining({
            id: 5,
            password: '[REDACTED]'
          }),
          token: '[REDACTED]'
        })
      })
    );
  });
});
