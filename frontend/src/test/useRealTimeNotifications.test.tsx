import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRealTimeNotifications } from '../hooks/useRealTimeNotifications';

const {
  connectMock,
  onMock,
  disconnectMock,
  dispatchMock,
  toastSuccessMock,
  useAuthMock
} = vi.hoisted(() => ({
  connectMock: vi.fn(),
  onMock: vi.fn(),
  disconnectMock: vi.fn(),
  dispatchMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  useAuthMock: vi.fn()
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => useAuthMock()
}));

vi.mock('../store/hooks', () => ({
  useAppDispatch: () => dispatchMock
}));

vi.mock('../services/socketService', () => ({
  socketService: {
    connect: connectMock,
    on: onMock,
    disconnect: disconnectMock
  }
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccessMock
  }
}));

describe('useRealTimeNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('does nothing without user', () => {
    useAuthMock.mockReturnValue({ user: null });

    renderHook(() => useRealTimeNotifications());

    expect(connectMock).not.toHaveBeenCalled();
    expect(onMock).not.toHaveBeenCalled();
  });

  it('does nothing when user exists but token is missing', () => {
    useAuthMock.mockReturnValue({ user: { id: 9 } });

    renderHook(() => useRealTimeNotifications());

    expect(connectMock).not.toHaveBeenCalled();
    expect(onMock).not.toHaveBeenCalled();
  });

  it('connects, listens, dispatches and toasts on notification', () => {
    useAuthMock.mockReturnValue({ user: { id: 7 } });
    localStorage.setItem('token', 'jwt-token');

    renderHook(() => useRealTimeNotifications());

    expect(connectMock).toHaveBeenCalledWith('jwt-token');
    expect(onMock).toHaveBeenCalledWith('notification', expect.any(Function));

    const notification = {
      id: 1,
      type: 'TASK_ASSIGNED',
      message: 'New task',
      read: false,
      createdAt: new Date().toISOString()
    };

    const callback = onMock.mock.calls[0][1];
    callback(notification);

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'notifications/addNotification',
        payload: notification
      })
    );

    expect(toastSuccessMock).toHaveBeenCalledWith('✨ New task', {
      position: 'top-right',
      duration: 5000
    });
  });
});
