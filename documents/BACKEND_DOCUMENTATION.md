# Backend Architecture & Code Documentation

**Date:** 2026-07-25  
**Technology Stack:** Node.js 18, Express.js, TypeScript, MySQL 8.0, Prisma 5.x

---

## 📐 Architecture Overview

### Layered Architecture Pattern

```
┌─────────────────────────────────────────┐
│         HTTP Layer (Express.js)          │
│  Routes → Middleware → Controllers       │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│   Business Logic Layer (Services)        │
│  Event Bus → Handlers → Notifications   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Data Access Layer (Prisma ORM)       │
│  MySQL Database Queries & Transactions   │
└─────────────────────────────────────────┘
```

### Real-Time Event-Driven Architecture

```
Task Creation (HTTP POST)
        ↓
  [TaskController]
        ↓
  [EventBusService.publish('task.created')]
        ↓
  [NotificationHandler.subscribe()]
        ↓
  [Create Notification in DB]
        ↓
  [Socket.io: emit to user_${assigneeId}]
        ↓
  [Frontend Redux State Update]
        ↓
  [UI: Bell Badge + Toast + List]
```

---

## 🗁️ File Structure

```
backend/src/
├── index.ts                          # Application entry point
│   ├─ Express app setup
│   ├─ Socket.io server configuration
│   ├─ JWT authentication middleware
│   └─ Global error handling
│
├── middleware/                        # Request processing
│   ├─ auth.ts                        # JWT verification & role checks
│   ├─ error.ts                       # Error handling
│   ├─ logger.ts                      # Request logging
│   └─ validate.ts                    # Zod schema validation
│
├── routes/                           # HTTP route definitions
│   ├─ auth.ts                        # Login & register
│   ├─ task.ts                        # Task CRUD
│   ├─ user.ts                        # User list/details
│   ├─ project.ts                     # Project CRUD
│   ├─ dashboard.ts                   # Analytics & summary
│   └─ comment.ts                     # Comment management
│
├── controllers/                      # Request handlers
│   ├─ authController.ts              # Auth business logic
│   ├─ taskController.ts              # Task operations
│   ├─ userController.ts              # User queries
│   ├─ projectController.ts           # Project management
│   ├─ dashboardController.ts         # Analytics
│   └─ commentController.ts           # Comments
│
├── services/                         # Business logic
│   ├─ authService.ts                 # Password hashing, JWT
│   ├─ taskService.ts                 # Task CRUD logic
│   ├─ userService.ts                 # User queries
│   ├─ projectService.ts              # Project operations
│   ├─ dashboardService.ts            # Analytics
│   ├─ commentService.ts              # Comment logic
│   └─ eventBusService.ts             # Event pub/sub
│
├── handlers/                         # Event handlers
│   └─ notificationHandler.ts         # Processes task events
│
├── schemas/                          # Zod validation
│   ├─ auth.ts                        # Login/register schemas
│   ├─ task.ts                        # Task CRUD schemas
│   ├─ project.ts                     # Project schemas
│   └─ comment.ts                     # Comment schemas
│
├── types/                            # TypeScript types
│   └─ auth.ts                        # Auth interfaces
│
└── utils/                            # Helper functions
    ├─ dbSetup.ts                     # Database initialization
    ├─ env.ts                         # Environment loading
    ├─ jwt.ts                         # JWT sign/verify
    └─ prisma.ts                      # Prisma client instance
```

---

## 🔑 Core Concepts & Patterns

### 1. Middleware Chain (Express)

**Order of Execution:**

```
Request
  ↓
CORS Middleware
  ↓
Body Parser (JSON)
  ↓
Request Logger
  ↓
Route Handler
  ├─ requireAuth (JWT verification)
  ├─ requireRole (role-based access)
  ├─ validateBody (Zod schema)
  └─ Controller Logic
  ↓
Error Handler (Global)
  ↓
Response
```

**Key Middleware:**

#### `auth.ts` - JWT Authentication & Authorization
```typescript
// Verifies JWT token in Authorization header
requireAuth: (req, res, next) => {
  1. Extract token from "Bearer {token}"
  2. Verify signature with JWT_SECRET
  3. Decode payload: { id, email, role, iat, exp }
  4. Attach user to req.user
  5. Call next()
}

// Checks if user role is in allowed list
requireRole: (roles: string[]) => (req, res, next) => {
  1. Check if req.user.role in roles
  2. If yes: call next()
  3. If no: return 403 Forbidden
}
```

#### `validate.ts` - Schema Validation
```typescript
// Validates request body against Zod schema
validateBody: (schema: ZodSchema) => (req, res, next) => {
  1. Parse req.body with schema.parse()
  2. If success: call next()
  3. If fail: return 400 with validation errors
}
```

#### `error.ts` - Global Error Handler
```typescript
// Catches all errors and formats response
errorHandler: (err, req, res, next) => {
  1. Log error with context
  2. Determine HTTP status (400, 401, 403, 404, 500)
  3. Format error response
  4. Send to client
}
```

#### `logger.ts` - Request Logging
```typescript
// Logs all requests with details
requestLogger: (req, res, next) => {
  Log: method, path, status, duration, user_id
}
```

---

### 2. Service Layer (Business Logic)

Each service encapsulates business logic for a domain:

#### `authService.ts`
```typescript
async registerUser(name, email, password, role)
  └─ Hash password with bcrypt
  └─ Create user in DB
  └─ Return user without password

async loginUser(email, password)
  └─ Find user by email
  └─ Compare password hash
  └─ Sign JWT token with user data
  └─ Return token + user

async verifyPassword(plaintext, hash)
  └─ Compare plaintext with bcrypt hash
```

#### `taskService.ts`
```typescript
async getTasksForUser(userId, role)
  └─ If ADMIN: return all tasks
  └─ If MANAGER: return created + team tasks
  └─ If EMPLOYEE: return assigned tasks

async createTask(title, description, assigneeId, creatorId, projectId)
  └─ Validate inputs with Prisma
  └─ Create task record
  └─ Return created task

async updateTask(taskId, updates)
  └─ Find task
  └─ Apply updates (title, description, status)
  └─ Save to DB
  └─ Return updated task

async deleteTask(taskId)
  └─ Delete comments (cascade)
  └─ Delete notifications (cascade)
  └─ Delete task
```

#### `userService.ts`
```typescript
async getUsersForManager(managerId)
  └─ Query users managed by this manager
  └─ Exclude password field

async getUserById(userId)
  └─ Find user by ID
  └─ Return user details
```

#### `dashboardService.ts`
```typescript
async getDashboardData(userId, role)
  └─ If ADMIN:
     └─ Return: total_tasks, users, projects, task_distribution
  └─ If MANAGER:
     └─ Return: team_size, task_summary, recent_tasks
  └─ If EMPLOYEE:
     └─ Return: assigned_tasks, completed_tasks, upcoming_tasks
```

---

### 3. Event-Driven Architecture (Event Bus)

#### `eventBusService.ts` - Publisher/Subscriber Pattern

```typescript
class EventBusService {
  private handlers: Map<string, EventHandler[]>
  
  // Publish event to all subscribers
  async publish(eventType: string, data: any) {
    Log event
    Execute all handlers for this event type
  }
  
  // Register handler for event type
  subscribe(eventType: string, handler: EventHandler) {
    Add handler to handlers map
  }
}
```

**Supported Events:**
- `task.created`: Triggered when new task assigned
- `task.updated`: When task status changes
- `task.deleted`: When task removed
- `comment.created`: New comment added
- `user.registered`: New user signup

#### `notificationHandler.ts` - Event Handler

```typescript
setupNotificationHandler() {
  Subscribe to 'task.created' event
  
  On task.created:
    1. Extract taskId, assigneeId, title
    2. Create Notification record in DB
       └─ userId: assigneeId
       └─ type: 'TASK_ASSIGNED'
       └─ message: "You have been assigned: {title}"
       └─ taskId: taskId
       └─ read: false
    3. Emit via Socket.io to room: user_{assigneeId}
    4. Log success
}
```

---

### 4. Socket.io Real-Time Communication

#### Connection Flow

```
Frontend Socket.io Client
  ↓
connect('http://localhost:5000/notifications', {
  auth: { token: 'jwt_token' }
})
  ↓
Backend Socket.io Auth Middleware
  ├─ Extract token from handshake.auth
  ├─ Verify JWT signature
  ├─ Decode user ID and role
  ├─ Attach to socket.data.user
  └─ Accept connection OR reject
  ↓
socket.join(`user_${userId}`)
  ↓
On Backend Event
  └─ io.of('/notifications')
     .to(`user_${userId}`)
     .emit('notification', data)
  ↓
Frontend Listener
  └─ socket.on('notification', (data) => {
       dispatch(addNotification(data))
       toast.success(data.message)
     })
```

#### Socket.io Namespaces

- `/notifications`: Real-time notifications
  - Rooms: `user_${userId}` (one per user)
  - Events: `notification`, `disconnect`

---

## 📊 Database Schema

### Entities & Relationships

```
User (1) ──────────────┬─────────────── (Many) Task (assignee)
                       │
                       ├─────────────── (Many) Task (creator)
                       │
                       ├─────────────── (Many) Comment
                       │
                       └─────────────── (Many) Notification

Task (1) ──────────────┬─────────────── (Many) Comment
                       │
                       ├─────────────── (Many) Notification
                       │
                       └───────────── (1) Project

Project (1) ───────────────────────── (Many) Task
```

### Notification Model

```prisma
model Notification {
  id        Int      @id @default(autoincrement())
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  type      String   // TASK_ASSIGNED, TASK_UPDATED, COMMENT_ADDED
  message   String
  task      Task?    @relation(fields: [taskId], references: [id])
  taskId    Int?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```

**Indexes:**
- `userId`: Fast user notification queries
- `createdAt`: Sort notifications by timestamp

---

## 🔒 Security Practices

### Password Security
```
Plain Password
    ↓
bcrypt.hash() with salt rounds = 10
    ↓
Hash stored in database (plaintext never stored)
    ↓
Login: bcrypt.compare(input, storedHash)
```

### JWT Token Security
```
Token Payload: { id, email, role, iat, exp }
Signature: HMAC-SHA256(header.payload, JWT_SECRET)
Storage: localStorage (frontend)
Transmission: Authorization: Bearer {token}
Expiry: 24 hours (automatic logout)
```

### Input Validation (Zod)

```typescript
// Every endpoint validates input before processing
registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'])
})
```

### Role-Based Access Control

```typescript
// Middleware prevents unauthorized access
router.post('/tasks', 
  requireAuth,                    // Must be logged in
  requireRole(['ADMIN', 'MANAGER']), // Must be manager+
  validateBody(createTaskSchema), // Must pass validation
  createNewTask                   // Then execute
)
```

---

## 🧪 Testing Strategy

### Unit Tests (Services)

```typescript
describe('TaskService', () => {
  describe('createTask', () => {
    test('should create task with valid input', async () => {
      const task = await createTask(...)
      expect(task.id).toBeDefined()
      expect(task.status).toBe('PENDING')
    })
    
    test('should fail with invalid assigneeId', async () => {
      await expect(createTask(..., invalidId, ...))
        .rejects.toThrow('User not found')
    })
  })
})
```

### Integration Tests (API Routes)

```typescript
describe('POST /api/tasks', () => {
  test('should create task with auth token', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title, description, assigneeId, projectId })
      .expect(201)
    
    expect(res.body.id).toBeDefined()
    expect(res.body.status).toBe('PENDING')
  })
})
```

### Coverage Goals
- Services: 80%+ coverage
- Routes: 75%+ coverage
- Controllers: 70%+ coverage
- Overall: 75%+ coverage

---

## 🚀 Performance Optimizations

### Database Queries
- **Indexes:** userId, createdAt in Notification table
- **Relations:** Use Prisma `.include()` to fetch related data efficiently
- **Pagination:** (Future) Implement limit/offset for large datasets

### Caching
- (Future) Redis caching for dashboard summary
- (Future) In-memory cache for user list

### Connection Pooling
- Prisma handles MySQL connection pool automatically
- Default: 10 connections

---

## 📋 Deployment Checklist

- [ ] Environment variables set (.env file)
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] DATABASE_URL points to production MySQL
- [ ] CORS origin updated to frontend domain
- [ ] Node environment set to `production`
- [ ] npm run build successful
- [ ] npm start runs without errors
- [ ] Health check endpoint (/)
- [ ] Logs written to file (not console only)
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Database backups configured

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
on: push to main
  ├─ Checkout code
  ├─ Setup Node.js 18
  ├─ Install dependencies
  ├─ Lint (ESLint)
  ├─ Type check (TypeScript)
  ├─ Unit tests (Jest)
  ├─ Integration tests (API)
  ├─ Build (tsc)
  └─ Deploy to server
```

**Status Checks:**
- ✅ Build: npm run build
- ✅ Test: npm test (coverage > 75%)
- ✅ Lint: npm run lint (no errors)

---

## 📚 Code Examples

### Creating a New API Endpoint

1. **Define Route** (`routes/example.ts`):
```typescript
router.post('/', requireAuth, validateBody(schema), createHandler);
```

2. **Create Controller** (`controllers/exampleController.ts`):
```typescript
export async function createHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { data } = req.body;
    const user = (req as any).user;
    const result = await exampleService.create(data, user.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
```

3. **Implement Service** (`services/exampleService.ts`):
```typescript
export async function create(data: any, userId: number) {
  // Business logic
  const result = await prisma.example.create({
    data: { ...data, userId }
  });
  // Publish event if needed
  await eventBus.publish('example.created', result);
  return result;
}
```

4. **Add Validation** (`schemas/example.ts`):
```typescript
export const createSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional()
});
```

5. **Register Route** (`index.ts`):
```typescript
app.use('/api/example', exampleRoutes);
```

---

## 🆘 Troubleshooting

### Database Connection Issues
```
Error: "connect ECONNREFUSED"
Solution: Check MySQL is running, DATABASE_URL is correct
```

### Token Verification Fails
```
Error: "Invalid token"
Solution: Check JWT_SECRET matches frontend encoding, token not expired
```

### Socket.io Connection Refused
```
Error: "CORS policy"
Solution: Update FRONTEND_URL in .env to match frontend origin
```

---

**Last Updated:** 2026-07-25  
**Maintainer:** Backend Team
