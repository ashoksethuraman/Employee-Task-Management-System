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

  it('does not reconnect when already connected with same token', async () => {
    const handlers: Record<string, (data?: any) => void> = {};
    const fakeSocket = {
      connected: true,
      on: vi.fn((event: string, cb: (data?: any) => void) => {
        handlers[event] = cb;
      }),
      disconnect: vi.fn()
    };

    ioMock.mockReturnValue(fakeSocket);
    const { socketService } = await import('../services/socketService');

    socketService.connect('same-token');
    socketService.connect('same-token');

    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(fakeSocket.disconnect).not.toHaveBeenCalled();
  });

  it('disconnects previous socket when connecting with a different token', async () => {
    const handlers1: Record<string, (data?: any) => void> = {};
    const handlers2: Record<string, (data?: any) => void> = {};

    const firstSocket = {
      connected: true,
      on: vi.fn((event: string, cb: (data?: any) => void) => {
        handlers1[event] = cb;
      }),
      disconnect: vi.fn()
    };

    const secondSocket = {
      connected: true,
      on: vi.fn((event: string, cb: (data?: any) => void) => {
        handlers2[event] = cb;
      }),
      disconnect: vi.fn()
    };

    ioMock
      .mockReturnValueOnce(firstSocket)
      .mockReturnValueOnce(secondSocket);

    const { socketService } = await import('../services/socketService');

    socketService.connect('first-token');
    socketService.connect('second-token');

    expect(firstSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(ioMock).toHaveBeenCalledTimes(2);
  });

  it('unsubscribe returned by on removes listener', async () => {
    const handlers: Record<string, (data?: any) => void> = {};
    const fakeSocket = {
      connected: true,
      on: vi.fn((event: string, cb: (data?: any) => void) => {
        handlers[event] = cb;
      }),
      disconnect: vi.fn()
    };

    ioMock.mockReturnValue(fakeSocket);
    const { socketService } = await import('../services/socketService');

    const callback = vi.fn();
    const unsubscribe = socketService.on('notification', callback);
    unsubscribe();

    socketService.connect('token-1');
    handlers.notification({ message: 'will not be delivered' });

    expect(callback).not.toHaveBeenCalled();
  });

  it('off is safe when event has no handlers', async () => {
    const { socketService } = await import('../services/socketService');

    expect(() => socketService.off('unknown-event', vi.fn())).not.toThrow();
  });
});
