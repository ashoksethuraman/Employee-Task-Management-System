import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/auth';
import taskRoutes from './routes/task';
import userRoutes from './routes/user';
import projectRoutes from './routes/project';
import dashboardRoutes from './routes/dashboard';
import commentRoutes from './routes/comment';
import { errorHandler, notFound } from './middleware/error';
import { requestLogger } from './middleware/logger';
import { ensureDatabase } from './utils/dbSetup';
import { loadEnv } from './utils/env';
import { setupNotificationHandler } from './handlers/notificationHandler';
import { verifyJWT } from './utils/jwt';
import { correlationMiddleware, getCorrelationId } from '@ashok92/correlation-id';
import { logger } from './utils/logger';
import { setupApiDocs } from './utils/apiDocs';

loadEnv();

const app = express();
const httpServer = http.createServer(app);

// Socket.io setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Store io instance globally for use in handlers
(global as any).io = io;

function getUserIdFromToken(token: string): number | null {
  try {
    const decoded = verifyJWT(token) as any;
    if (decoded && typeof decoded === 'object' && typeof decoded.id === 'number') {
      return decoded.id;
    }
    if (decoded && typeof decoded === 'object' && decoded.id != null) {
      const parsed = Number(decoded.id);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  } catch {
    return null;
  }
}

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  const userId = getUserIdFromToken(token);
  if (userId == null) {
    return next(new Error('Invalid token'));
  }

  socket.data.user = { id: userId };
  next();
});

const notificationsNamespace = io.of('/notifications');

notificationsNamespace.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  const userId = getUserIdFromToken(token);
  if (userId == null) {
    return next(new Error('Invalid token'));
  }

  socket.data.user = { id: userId };
  next();
});

// Socket.io connection
notificationsNamespace.on('connection', (socket) => {
  const userId = socket.data.user?.id;
  if (userId == null) {
    socket.disconnect(true);
    return;
  }

  logger.info('socket_connected', {
    userId,
    namespace: '/notifications',
    correlationId: getCorrelationId()
  });

  // Join user's personal room
  socket.join(`user_${userId}`);

  socket.on('disconnect', () => {
    logger.info('socket_disconnected', {
      userId,
      namespace: '/notifications',
      correlationId: getCorrelationId()
    });
  });
});

// Express middleware
app.use(cors());
app.use(express.json());
app.use(correlationMiddleware());
app.use(requestLogger);
setupApiDocs(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/comments', commentRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Setup event handlers
setupNotificationHandler();

const port = process.env.PORT || 5000;

async function start() {
  try {
    await ensureDatabase();
    httpServer.listen(port, () => {
      logger.info('server_started', {
        port,
        websocket: true,
        notifications: true
      });
    });
  } catch (error) {
    logger.error('server_start_failed', { error });
    process.exit(1);
  }
}

start();
