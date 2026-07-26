import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useAppDispatch } from '../store/hooks';
import { addNotification, type Notification } from '../store/slices/notificationSlice';
import { socketService } from '../services/socketService';
import { TASK_DATA_REFRESH_EVENT, type TaskDataRefreshDetail } from '../constants/realtimeEvents';
import toast from 'react-hot-toast';

export function useRealTimeNotifications() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user) return;

    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    if (!token) return;

    console.log('🔌 Setting up real-time notifications for user:', user.id);

    // Connect to Socket.io
    socketService.connect(token);

    // Listen for notifications
    const unsubscribe = socketService.on('notification', (notification: Notification) => {
      console.log('📢 Notification event triggered:', notification);
      dispatch(addNotification(notification));

      if (notification.type.startsWith('TASK_')) {
        const detail: TaskDataRefreshDetail = {
          taskId: notification.taskId,
          reason: 'notification',
          notificationType: notification.type,
        };
        window.dispatchEvent(new CustomEvent(TASK_DATA_REFRESH_EVENT, { detail }));
      }
      
      // Show toast
      toast.success(`✨ ${notification.message}`, {
        position: 'top-right',
        duration: 5000
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      socketService.disconnect();
    };
  }, [user, dispatch]);
}
