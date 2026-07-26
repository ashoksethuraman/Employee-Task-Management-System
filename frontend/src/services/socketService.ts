import io, { Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  private notificationSocket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private connectedToken: string | null = null;

  connect(token: string): void {
    if (this.notificationSocket?.connected && this.connectedToken === token) {
      return;
    }

    if (this.notificationSocket) {
      this.notificationSocket.disconnect();
      this.notificationSocket = null;
    }

    console.log('🔌 Connecting to WebSocket...');

    this.notificationSocket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      reconnection: true
    });
    this.connectedToken = token;

    this.notificationSocket.on('notification', (data) => {
      console.log('🔔 Notification received:', data);
      this.emit('notification', data);
    });

    this.notificationSocket.on('connect', () => {
      console.log('✓ Connected to WebSocket');
    });

    this.notificationSocket.on('disconnect', () => {
      console.log('✓ Disconnected from WebSocket');
    });
  }

  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => {
      this.off(event, callback);
    };
  }

  off(event: string, callback: Function): void {
    const handlers = this.listeners.get(event);
    if (!handlers) {
      return;
    }

    this.listeners.set(
      event,
      handlers.filter((handler) => handler !== callback)
    );
  }

  private emit(event: string, data: any): void {
    const handlers = this.listeners.get(event) || [];
    for (const handler of handlers) {
      handler(data);
    }
  }

  disconnect(): void {
    this.notificationSocket?.disconnect();
    this.notificationSocket = null;
    this.connectedToken = null;
  }
}

export const socketService = new SocketService();
