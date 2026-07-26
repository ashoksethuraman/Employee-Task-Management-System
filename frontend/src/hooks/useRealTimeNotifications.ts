import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useAppDispatch } from '../store/hooks';
import { addNotification, type Notification } from '../store/slices/notificationSlice';
import { socketService } from '../services/socketService';
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
    socketService.on('notification', (notification: Notification) => {
      console.log('📢 Notification event triggered:', notification);
      dispatch(addNotification(notification));
      
      // Show toast
      toast.success(`✨ ${notification.message}`, {
        position: 'top-right',
        duration: 5000
      });
    });

    return () => {
      socketService.disconnect();
    };
  }, [user, dispatch]);
}
