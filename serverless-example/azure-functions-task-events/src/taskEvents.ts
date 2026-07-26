import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

interface TaskEventPayload {
  taskId: number;
  eventType: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_COMPLETED';
  actorId: number;
  timestamp?: string;
}

export async function taskEventsHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const body = await request.json().catch(() => null) as TaskEventPayload | null;

  if (!body) {
    return {
      status: 400,
      jsonBody: { message: 'Request body is required' }
    };
  }

  if (!body.taskId || !body.eventType || !body.actorId) {
    return {
      status: 400,
      jsonBody: { message: 'taskId, eventType, actorId are required' }
    };
  }

  const normalizedEvent = {
    ...body,
    timestamp: body.timestamp ?? new Date().toISOString()
  };

  context.log('Task event accepted', normalizedEvent);

  return {
    status: 202,
    jsonBody: {
      message: 'Task event accepted',
      event: normalizedEvent
    }
  };
}

app.http('task-events', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'task-events',
  handler: taskEventsHandler
});
