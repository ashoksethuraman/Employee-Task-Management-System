import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('api service interceptor', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('adds bearer token when available', async () => {
    localStorage.setItem('token', 'abc123');
    const mod = await import('../services/api');
    const api = mod.default as any;

    const interceptor = api.interceptors.request.handlers[0].fulfilled;
    const config = interceptor({ headers: {} });

    expect(config.headers.Authorization).toBe('Bearer abc123');
  });

  it('leaves headers unchanged when token missing', async () => {
    const mod = await import('../services/api');
    const api = mod.default as any;

    const interceptor = api.interceptors.request.handlers[0].fulfilled;
    const config = interceptor({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });
});
