# Employee Task Management System - API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Database:** MySQL 8.0  
**ORM:** Prisma 5.x  
**Authentication:** JWT Bearer Token

---

## 📋 Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Task Management Endpoints](#task-management-endpoints)
3. [User Management Endpoints](#user-management-endpoints)
4. [Project Management Endpoints](#project-management-endpoints)
5. [Comment Endpoints](#comment-endpoints)
6. [Dashboard Endpoints](#dashboard-endpoints)
7. [WebSocket Events](#websocket-events)
8. [Error Handling](#error-handling)
9. [Authentication & Authorization](#authentication--authorization)

---

## 🔐 Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "EMPLOYEE"
}
```

**Parameters:**
- `name` (string, required): User's full name, 2-100 characters
- `email` (string, required): Valid email address, must be unique
- `password` (string, required): Minimum 8 characters
- `role` (enum: ADMIN, MANAGER, EMPLOYEE): User's role

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "EMPLOYEE",
  "createdAt": "2026-07-25T10:30:00Z"
}
```

**Errors:**
- `400 Bad Request`: Validation failed (invalid email, weak password)
- `409 Conflict`: Email already registered

---

### POST /api/auth/login
Authenticate and get JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE"
  }
}
```

**Token Details:**
- Expires in: 24 hours
- Signature: HMAC SHA-256
- Claims: `id`, `email`, `role`, `iat`, `exp`

**Errors:**
- `400 Bad Request`: Invalid credentials
- `401 Unauthorized`: Email or password incorrect

---

## 📝 Task Management Endpoints

### GET /api/tasks
List tasks (filtered by role and user).

**Authentication:** Required (Bearer token)  
**Query Parameters:**
- `status` (optional): PENDING, IN_PROGRESS, DONE
- `sortBy` (optional): createdAt, title

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Design database schema",
    "description": "Create ER diagram for MySQL",
    "status": "IN_PROGRESS",
    "assignee": {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "EMPLOYEE"
    },
    "creator": {
      "id": 1,
      "name": "John Doe",
      "role": "MANAGER"
    },
    "project": {
      "id": 1,
      "name": "Project Alpha"
    },
    "createdAt": "2026-07-25T10:00:00Z",
    "updatedAt": "2026-07-25T14:30:00Z"
  }
]
```

**Role-Based Filtering:**
- **ADMIN**: See all tasks
- **MANAGER**: See tasks created by them + team member tasks
- **EMPLOYEE**: See only assigned tasks

**Errors:**
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions

---

### POST /api/tasks
Create a new task (ADMIN, MANAGER only).

**Authentication:** Required (Bearer token)  
**Authorization:** ADMIN, MANAGER  

**Request:**
```json
{
  "title": "Implement login page",
  "description": "Create React login component with validation",
  "assigneeId": 2,
  "projectId": 1
}
```

**Parameters:**
- `title` (string, required): 1-255 characters
- `description` (string, required): Task details
- `assigneeId` (integer, required): Valid user ID
- `projectId` (integer, required): Valid project ID

**Response:** `201 Created`
```json
{
  "id": 5,
  "title": "Implement login page",
  "description": "Create React login component with validation",
  "status": "PENDING",
  "assigneeId": 2,
  "creatorId": 1,
  "projectId": 1,
  "createdAt": "2026-07-25T15:00:00Z",
  "updatedAt": "2026-07-25T15:00:00Z"
}
```

**Side Effects:**
- Publishes `task.created` event to event bus
- Triggers notification to assignee via WebSocket

**Errors:**
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN or MANAGER
- `404 Not Found`: Invalid assigneeId or projectId

---

### GET /api/tasks/:id
Get task details including comments.

**Authentication:** Required  

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Design database schema",
  "description": "Create ER diagram for MySQL",
  "status": "IN_PROGRESS",
  "assignee": { "id": 2, "name": "Jane Smith" },
  "creator": { "id": 1, "name": "John Doe" },
  "project": { "id": 1, "name": "Project Alpha" },
  "comments": [
    {
      "id": 1,
      "body": "Great progress!",
      "user": { "id": 1, "name": "John Doe" },
      "createdAt": "2026-07-25T12:00:00Z"
    }
  ],
  "createdAt": "2026-07-25T10:00:00Z"
}
```

**Errors:**
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Task not found

---

### PUT /api/tasks/:id
Update task (creator, assignee, or ADMIN).

**Authentication:** Required  
**Authorization:** Task creator, assignee, or ADMIN  

**Request:**
```json
{
  "title": "Updated title",
  "status": "DONE"
}
```

**Updateable Fields:**
- `title`, `description`, `status`
- `status` values: PENDING, IN_PROGRESS, DONE

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Updated title",
  "status": "DONE",
  "updatedAt": "2026-07-25T16:00:00Z"
}
```

**Errors:**
- `400 Bad Request`: Invalid status value
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Task not found

---

### DELETE /api/tasks/:id
Delete a task (ADMIN, MANAGER only).

**Authentication:** Required  
**Authorization:** ADMIN, MANAGER  

**Response:** `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

**Cascade Effects:**
- Deletes all associated comments
- Deletes all associated notifications

**Errors:**
- `403 Forbidden`: Not authorized
- `404 Not Found`: Task not found

---

## 👥 User Management Endpoints

### GET /api/users
List all users (ADMIN, MANAGER only).

**Authentication:** Required  
**Authorization:** ADMIN, MANAGER  

**Query Parameters:**
- `role` (optional): ADMIN, MANAGER, EMPLOYEE

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "MANAGER",
    "createdAt": "2026-07-25T09:00:00Z"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "EMPLOYEE",
    "createdAt": "2026-07-25T10:00:00Z"
  }
]
```

**Errors:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not ADMIN or MANAGER

---

### GET /api/users/:id
Get user details (ADMIN, MANAGER only).

**Authentication:** Required  
**Authorization:** ADMIN, MANAGER  

**Response:** `200 OK`
```json
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "EMPLOYEE",
  "createdAt": "2026-07-25T10:00:00Z"
}
```

**Errors:**
- `404 Not Found`: User not found
- `403 Forbidden`: Insufficient permissions

---

## 📁 Project Management Endpoints

### GET /api/projects
List all projects.

**Authentication:** Required  

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Project Alpha",
    "description": "Internal task management system",
    "createdAt": "2026-07-24T10:00:00Z"
  }
]
```

---

### POST /api/projects
Create a new project (ADMIN, MANAGER only).

**Authentication:** Required  
**Authorization:** ADMIN, MANAGER  

**Request:**
```json
{
  "name": "Project Beta",
  "description": "Mobile app development"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "name": "Project Beta",
  "description": "Mobile app development",
  "createdAt": "2026-07-25T15:00:00Z"
}
```

**Errors:**
- `400 Bad Request`: Project name already exists
- `403 Forbidden`: Not ADMIN or MANAGER

---

## 💬 Comment Endpoints

### POST /api/comments
Add a comment to a task.

**Authentication:** Required  

**Request:**
```json
{
  "body": "Great progress! Please add unit tests."
}
```

**Query Parameters:**
- `taskId` (required): Task to comment on

**Response:** `201 Created`
```json
{
  "id": 2,
  "body": "Great progress! Please add unit tests.",
  "taskId": 1,
  "user": {
    "id": 1,
    "name": "John Doe"
  },
  "createdAt": "2026-07-25T16:00:00Z"
}
```

**Errors:**
- `400 Bad Request`: Empty comment or invalid taskId
- `404 Not Found`: Task not found

---

### GET /api/comments/:taskId
List comments on a task.

**Authentication:** Required  

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "body": "Starting implementation",
    "user": { "id": 2, "name": "Jane Smith" },
    "createdAt": "2026-07-25T12:00:00Z"
  },
  {
    "id": 2,
    "body": "Great progress!",
    "user": { "id": 1, "name": "John Doe" },
    "createdAt": "2026-07-25T16:00:00Z"
  }
]
```

---

## 📊 Dashboard Endpoints

### GET /api/dashboard/summary
Get role-specific dashboard summary.

**Authentication:** Required  

**Response:** `200 OK`
```json
{
  "role": "MANAGER",
  "totalTasks": 15,
  "tasksAssigned": 8,
  "tasksInProgress": 3,
  "tasksCompleted": 5,
  "teamSize": 5,
  "recentTasks": [
    {
      "id": 1,
      "title": "Design API",
      "status": "IN_PROGRESS",
      "assignee": { "id": 2, "name": "Jane Smith" }
    }
  ]
}
```

**Role-Based Response:**
- **ADMIN**: All tasks, all users, all projects
- **MANAGER**: Team tasks, team users, owned projects
- **EMPLOYEE**: Own tasks only, completed tasks count

---

## 🔔 WebSocket Events

### Connection & Authentication
```javascript
// Client connects to notification namespace
const socket = io('http://localhost:5000/notifications', {
  auth: { token: 'jwt_token_here' }
});

// Automatically joins room: user_${userId}
```

### Event: notification
**Emitted by:** Backend when task is assigned, commented on, etc.  
**Payload:**
```json
{
  "id": 1,
  "type": "TASK_ASSIGNED",
  "message": "You have been assigned task: Create Login Page",
  "taskId": 5,
  "createdAt": "2026-07-25T15:30:00Z"
}
```

### Event: disconnect
Automatically emitted when user disconnects or token expires.

---

## 🛡️ Authentication & Authorization

### JWT Token Structure
```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: {
  "id": 1,
  "email": "john@example.com",
  "role": "MANAGER",
  "iat": 1721898600,
  "exp": 1721985000
}
Signature: HMAC-SHA256(secret)
```

### Bearer Token Usage
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access Control Matrix

| Endpoint | ADMIN | MANAGER | EMPLOYEE |
|----------|-------|---------|----------|
| POST /tasks | ✅ | ✅ | ❌ |
| GET /tasks | ✅ All | ✅ Team | ✅ Own |
| PUT /tasks/:id | ✅ | ✅ Own | ✅ Assigned |
| DELETE /tasks | ✅ | ✅ | ❌ |
| GET /users | ✅ | ✅ | ❌ |
| POST /projects | ✅ | ✅ | ❌ |

---

## ⚠️ Error Handling

### Standard Error Response
All errors return appropriate HTTP status codes with JSON payload:

```json
{
  "error": "Validation Error",
  "message": "Invalid email format",
  "statusCode": 400,
  "timestamp": "2026-07-25T15:30:00Z"
}
```

### Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing/invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

### Common Error Scenarios

**Invalid Token:**
```json
{
  "error": "AuthError",
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

**Insufficient Permissions:**
```json
{
  "error": "AuthorizationError",
  "message": "User role EMPLOYEE cannot perform this action",
  "statusCode": 403
}
```

**Validation Failed:**
```json
{
  "error": "ValidationError",
  "message": "Invalid email format",
  "statusCode": 400
}
```

---

## 📌 Request/Response Examples

### Example 1: Complete Task Creation Flow

**1. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "Password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": { "id": 1, "role": "MANAGER" }
}
```

**2. Create Task:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement testing",
    "description": "Add Jest tests for all API endpoints",
    "assigneeId": 2,
    "projectId": 1
  }'
```

**Response:**
```json
{
  "id": 5,
  "title": "Implement testing",
  "status": "PENDING",
  "createdAt": "2026-07-25T15:00:00Z"
}
```

**Side Effect:**
- ✨ WebSocket notification sent to user 2
- 🔔 Notification created in database
- 🍞 Toast appears on user 2's screen

---

## 🔧 Rate Limiting & Throttling
Currently not implemented. Recommended for production:
- 100 requests/minute per IP
- 10 requests/second per authenticated user

## 📡 CORS Configuration
```
Allowed Origins: http://localhost:5173 (dev), production domain
Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Content-Type, Authorization
Credentials: true
```

---

**Last Updated:** 2026-07-25  
**Maintenance:** Backend Team
