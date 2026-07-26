type EventHandler = (data: any) => Promise<void> | void;

export class EventBusService {
  private handlers: Map<string, EventHandler[]> = new Map();

  async publish(eventType: string, data: any): Promise<void> {
    console.log(`\n📢 [Event] ${eventType}`);
    console.log(JSON.stringify(data, null, 2));

    const handlers = this.handlers.get(eventType) || [];
    for (const handler of handlers) {
      try {
        await Promise.resolve(handler(data));
      } catch (error) {
        console.error(`❌ Handler error:`, error);
      }
    }
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    console.log(`✓ Subscribed to: ${eventType}`);
  }
}

export const eventBus = new EventBusService();
