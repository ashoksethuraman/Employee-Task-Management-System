import { EventBusService } from '../src/services/eventBusService';

describe('EventBusService', () => {
  it('invokes subscribed handlers on publish', async () => {
    const bus = new EventBusService();
    const handler = jest.fn();

    bus.subscribe('task.created', handler);
    await bus.publish('task.created', { id: 1 });

    expect(handler).toHaveBeenCalledWith({ id: 1 });
  });

  it('continues when one handler throws', async () => {
    const bus = new EventBusService();
    const bad = jest.fn(() => {
      throw new Error('failure');
    });
    const good = jest.fn();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    bus.subscribe('task.created', bad);
    bus.subscribe('task.created', good);

    await bus.publish('task.created', { id: 2 });

    expect(errorSpy).toHaveBeenCalled();
    expect(good).toHaveBeenCalledWith({ id: 2 });

    errorSpy.mockRestore();
  });

  it('supports async handlers', async () => {
    const bus = new EventBusService();
    const asyncHandler = jest.fn(async () => Promise.resolve());

    bus.subscribe('task.updated', asyncHandler);
    await bus.publish('task.updated', { id: 3 });

    expect(asyncHandler).toHaveBeenCalledTimes(1);
  });
});
