import { beforeEach, describe, expect, it, vi } from 'vitest';

const ioMock = vi.fn();

vi.mock('socket.io-client', () => ({
  default: ioMock
}));

describe('socketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('connects and dispatches notification listeners', async () => {
    const handlers: Record<string, (data?: any) => void> = {};
    const fakeSocket = {
      on: vi.fn((event: string, cb: (data?: any) => void) => {
        handlers[event] = cb;
      }),
      disconnect: vi.fn()
    };

    ioMock.mockReturnValue(fakeSocket);

    const { socketService } = await import('../services/socketService');
    const callback = vi.fn();

    socketService.on('notification', callback);
    const callback2 = vi.fn();
    socketService.on('notification', callback2);
    socketService.connect('jwt-token');

    expect(ioMock).toHaveBeenCalledWith('http://localhost:5000/notifications', {
      auth: { token: 'jwt-token' },
      reconnection: true
    });

    handlers.notification({ message: 'new' });
    expect(callback).toHaveBeenCalledWith({ message: 'new' });
    expect(callback2).toHaveBeenCalledWith({ message: 'new' });

    socketService.disconnect();
    expect(fakeSocket.disconnect).toHaveBeenCalledTimes(1);
  });

  it('disconnect is safe before any connect call', async () => {
    const { socketService } = await import('../services/socketService');

    expect(() => socketService.disconnect()).not.toThrow();
  });
});
