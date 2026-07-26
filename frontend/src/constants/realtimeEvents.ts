export const TASK_DATA_REFRESH_EVENT = 'task-data:refresh';

export interface TaskDataRefreshDetail {
  taskId?: number;
  reason: 'notification';
  notificationType?: string;
}