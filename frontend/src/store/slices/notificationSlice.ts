import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: number;
  type: string;
  message: string;
  taskId?: number;
  read: boolean;
  createdAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;

      // Auto-remove after 5 seconds
      setTimeout(() => {
        notificationSlice.caseReducers.removeNotificationAuto(
          state,
          { payload: action.payload.id } as any
        );
      }, 5000);
    },

    removeNotification(state, action: PayloadAction<number>) {
      const notification = state.notifications.find(n => n.id === action.payload);
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    removeNotificationAuto(state, action: PayloadAction<number>) {
      const notification = state.notifications.find(n => n.id === action.payload);
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAsRead(state, action: PayloadAction<number>) {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    clearAll(state) {
      state.notifications = [];
      state.unreadCount = 0;
    }
  }
});

export const {
  addNotification,
  removeNotification,
  removeNotificationAuto,
  markAsRead,
  clearAll
} = notificationSlice.actions;

export default notificationSlice.reducer;
