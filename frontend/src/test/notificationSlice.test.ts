import reducer, {
  addNotification,
  removeNotification,
  markAsRead,
  clearAll,
  removeNotificationAuto,
  type NotificationState
} from '../store/slices/notificationSlice';

describe('notificationSlice', () => {
  const baseState: NotificationState = {
    notifications: [],
    unreadCount: 0
  };

  it('adds notification and increments unread count', () => {
    const timerSpy = vi.spyOn(globalThis, 'setTimeout').mockImplementation(() => 0 as any);

    const state = reducer(
      baseState,
      addNotification({
        id: 1,
        type: 'TASK_ASSIGNED',
        message: 'Task assigned',
        read: false,
        createdAt: new Date().toISOString()
      })
    );

    expect(state.notifications).toHaveLength(1);
    expect(state.unreadCount).toBe(1);
    expect(timerSpy).toHaveBeenCalled();

    timerSpy.mockRestore();
  });

  it('removes notification and updates unread count', () => {
    const state: NotificationState = {
      notifications: [
        {
          id: 2,
          type: 'TASK_ASSIGNED',
          message: 'Task assigned',
          read: false,
          createdAt: new Date().toISOString()
        }
      ],
      unreadCount: 1
    };

    const next = reducer(state, removeNotification(2));

    expect(next.notifications).toHaveLength(0);
    expect(next.unreadCount).toBe(0);
  });

  it('marks notification as read', () => {
    const state: NotificationState = {
      notifications: [
        {
          id: 3,
          type: 'TASK_UPDATED',
          message: 'Updated',
          read: false,
          createdAt: new Date().toISOString()
        }
      ],
      unreadCount: 1
    };

    const next = reducer(state, markAsRead(3));

    expect(next.notifications[0].read).toBe(true);
    expect(next.unreadCount).toBe(0);
  });

  it('auto-remove action removes notification', () => {
    const state: NotificationState = {
      notifications: [
        {
          id: 4,
          type: 'TASK_UPDATED',
          message: 'Auto remove',
          read: false,
          createdAt: new Date().toISOString()
        }
      ],
      unreadCount: 1
    };

    const next = reducer(state, removeNotificationAuto(4));

    expect(next.notifications).toHaveLength(0);
    expect(next.unreadCount).toBe(0);
  });

  it('clears all notifications', () => {
    const state: NotificationState = {
      notifications: [
        {
          id: 5,
          type: 'TASK_ASSIGNED',
          message: 'x',
          read: false,
          createdAt: new Date().toISOString()
        }
      ],
      unreadCount: 1
    };

    const next = reducer(state, clearAll());

    expect(next.notifications).toHaveLength(0);
    expect(next.unreadCount).toBe(0);
  });
});
