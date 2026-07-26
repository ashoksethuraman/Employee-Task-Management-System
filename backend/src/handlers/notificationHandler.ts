import { eventBus } from '../services/eventBusService';
import prisma from '../utils/prisma';

export function setupNotificationHandler() {
  eventBus.subscribe('task.created', async (event) => {
    console.log('\n🔔 [Handler] Creating notification...');

    try {
      const notification = await prisma.notification.create({
        data: {
          userId: event.assigneeId,
          type: 'TASK_ASSIGNED',
          message: `You have been assigned task: "${event.title}"`,
          taskId: event.taskId,
          read: false
        }
      });

      console.log(`✓ Notification created for user ${event.assigneeId}`);

      // ✨ Send real-time notification via Socket.io
      const io = (global as any).io;
      if (io) {
        io.of('/notifications')
          .to(`user_${event.assigneeId}`)
          .emit('notification', {
            id: notification.id,
            type: notification.type,
            message: notification.message,
            taskId: notification.taskId,
            createdAt: notification.createdAt
          });

        console.log(`✓ Real-time notification sent to user ${event.assigneeId}`);
      }
    } catch (error) {
      console.error('❌ Error creating notification:', error);
    }
  });
}
