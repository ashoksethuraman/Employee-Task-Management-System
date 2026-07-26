import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.fn();

vi.mock('axios', () => ({
  default: {
    create: () => ({
      post: postMock,
      defaults: { headers: { common: {} as Record<string, string> } }
    })
  }
}));

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    postMock.mockReset();
    vi.resetModules();
  });

  it('logs in and persists user/token', async () => {
    postMock.mockResolvedValue({
      data: {
        user: { id: 1, name: 'Admin', email: 'admin@company.com', role: 'ADMIN' },
        token: 'jwt-123'
      }
    });

    const { AuthProvider, useAuth } = await import('../hooks/useAuth');

    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('admin@company.com', 'Admin@123');
    });

    expect(result.current.user?.name).toBe('Admin');
    expect(result.current.token).toBe('jwt-123');
    expect(localStorage.getItem('token')).toBe('jwt-123');
  });

  it('registers and logs out', async () => {
    postMock.mockResolvedValue({ data: { ok: true } });

    localStorage.setItem('token', 'existing');
    localStorage.setItem('user', JSON.stringify({ id: 2, name: 'Mgr', email: 'm@c.com', role: 'MANAGER' }));

    const { AuthProvider, useAuth } = await import('../hooks/useAuth');

    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('User', 'user@company.com', 'secret123', 'secret123');
    });

    expect(postMock).toHaveBeenCalledWith('/auth/register', {
      name: 'User',
      email: 'user@company.com',
      password: 'secret123',
      confirmPassword: 'secret123'
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });
});
