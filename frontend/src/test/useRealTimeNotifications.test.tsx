import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRealTimeNotifications } from '../hooks/useRealTimeNotifications';
import { TASK_DATA_REFRESH_EVENT } from '../constants/realtimeEvents';

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
    const unsubscribeMock = vi.fn();
    onMock.mockReturnValue(unsubscribeMock);

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    const { unmount } = renderHook(() => useRealTimeNotifications());

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

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TASK_DATA_REFRESH_EVENT,
      })
    );

    unmount();
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    expect(disconnectMock).toHaveBeenCalledTimes(1);

    dispatchEventSpy.mockRestore();
  });

  it('does not dispatch task refresh event for non-task notification types', () => {
    useAuthMock.mockReturnValue({ user: { id: 7 } });
    localStorage.setItem('token', 'jwt-token');
    onMock.mockReturnValue(vi.fn());

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    renderHook(() => useRealTimeNotifications());

    const callback = onMock.mock.calls[0][1];
    callback({
      id: 2,
      type: 'SYSTEM_ALERT',
      message: 'System message',
      read: false,
      createdAt: new Date().toISOString()
    });

    expect(dispatchEventSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: TASK_DATA_REFRESH_EVENT,
      })
    );

    dispatchEventSpy.mockRestore();
  });

  it('cleanup still disconnects when on returns no unsubscribe function', () => {
    useAuthMock.mockReturnValue({ user: { id: 11 } });
    localStorage.setItem('token', 'jwt-token');
    onMock.mockReturnValue(undefined);

    const { unmount } = renderHook(() => useRealTimeNotifications());
    unmount();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });
});
