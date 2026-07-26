# Enterprise-Level Event-Driven Backend Architecture Plan
**Employee Task Management System with Published Node Modules**

**Date:** 2026-07-25  
**Status:** Planning Phase (Design & Architecture)  
**Scope:** Transform current REST API into scalable event-driven system with published npm modules

---

## Executive Summary

This plan outlines a **phased transformation** of the Employee Task Management backend from a traditional REST API into an **enterprise-grade, event-driven system** with:
- ✅ Asynchronous, loosely-coupled microservices
- ✅ Real-time notifications and WebSocket support
- ✅ Published npm modules for task domain logic (FOSS)
- ✅ TDD-first implementation methodology
- ✅ Automated CI/CD pipelines
- ✅ Distributed deployment capabilities (Kubernetes-ready)
- ✅ Serverless-compatible backend patterns

---

## Phase 1: Architecture Redesign (Planning → Implementation)

### 1.1 Event-Driven System Design

#### **Current State (Synchronous REST):**
```
User Request → Express Route → Service → Database → Response
```

#### **Target State (Event-Driven):**
```
User Action (Task Created)
    ↓
Create Command Handler
    ↓
Emit Event (TaskCreated)
    ↓
Event Bus (Message Queue)
    ├→ Notification Service (Send Email)
    ├→ Analytics Service (Log Event)
    ├→ Cache Service (Update Dashboards)
    └→ Real-time Service (WebSocket Push)
    ↓
Acknowledge to User
```

#### **Key Components:**

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Event Bus** | RabbitMQ / Redis / AWS SQS | Pub/Sub messaging infrastructure |
| **Event Store** | MySQL/PostgreSQL Event Log | Immutable event history for audit/replay |
| **Command Handlers** | Custom service layer | Process commands → emit events |
| **Event Listeners** | Worker services | React to domain events |
| **Message Queue** | Bull/BullMQ | Job scheduling & retry logic |
| **Real-time Layer** | Socket.io / WebSockets | Live notifications & updates |

---

### 1.2 Domain Events Mapping

**Core Domain Events for Task Management:**

```typescript
// Task Aggregate Events
- TaskCreated(taskId, title, description, assigneeId, creatorId, projectId)
- TaskAssigned(taskId, assigneeId, previousAssigneeId)
- TaskStatusChanged(taskId, oldStatus, newStatus)
- TaskCompleted(taskId, completedAt, completedBy)
- TaskDeleted(taskId, deletedAt, deletedBy)
- TaskCommentAdded(taskId, commentId, userId, content)

// User Aggregate Events
- UserRegistered(userId, email, name, role)
- UserProfileUpdated(userId, changes)
- UserRoleChanged(userId, oldRole, newRole)

// Project Aggregate Events
- ProjectCreated(projectId, name, ownerId)
- ProjectMemberAdded(projectId, userId)
- ProjectMemberRemoved(projectId, userId)

// Notification Events
- NotificationSent(userId, type, content, metadata)
- NotificationRead(notificationId)
```

---

### 1.3 Published Node Module Structure

**Create separate `task-domain-lib` package** for reusable business logic:

```
packages/
├── task-domain-lib/                    # Published npm module
│   ├── package.json                    # name: @your-org/task-domain
│   ├── README.md
│   ├── src/
│   │   ├── index.ts                    # Public API exports
│   │   ├── events/
│   │   │   ├── TaskCreated.ts
│   │   │   ├── TaskAssigned.ts
│   │   │   ├── TaskStatusChanged.ts
│   │   │   └── index.ts
│   │   ├── commands/
│   │   │   ├── CreateTaskCommand.ts
│   │   │   ├── AssignTaskCommand.ts
│   │   │   ├── UpdateTaskStatusCommand.ts
│   │   │   └── index.ts
│   │   ├── aggregates/
│   │   │   ├── TaskAggregate.ts
│   │   │   ├── UserAggregate.ts
│   │   │   └── index.ts
│   │   ├── value-objects/
│   │   │   ├── TaskId.ts
│   │   │   ├── TaskStatus.ts
│   │   │   ├── UserId.ts
│   │   │   └── index.ts
│   │   ├── repositories/
│   │   │   ├── TaskRepository.interface.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── TaskDomainService.ts
│   │   │   └── index.ts
│   │   └── validators/
│   │       ├── task-validator.ts
│   │       └── index.ts
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── TaskAggregate.test.ts
│   │   │   ├── TaskDomainService.test.ts
│   │   │   └── validators.test.ts
│   │   └── integration/
│   │       └── TaskWorkflow.test.ts
│   ├── dist/                           # Compiled JavaScript
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── .github/workflows/              # Auto-publish on release

├── backend/                            # Main service (consumes task-domain-lib)
│   ├── package.json                    # depends on @your-org/task-domain
│   └── src/
│       └── ... (services that use domain lib)

└── docs/
    ├── api-design.md
    ├── event-flow-diagrams.md
    └── integration-guide.md
```

---

## Phase 2: Technology Stack & Infrastructure

### 2.1 Event Bus Options

#### **Development & Small Deployments:**
- **Redis + Bull/BullMQ**
  - Lightweight, in-memory with persistence
  - Perfect for MVP and single-server deployments
  - Zero infrastructure overhead

#### **Production & Distributed:**
- **RabbitMQ** (Traditional message broker)
  - Highly reliable, AMQP protocol
  - Kubernetes-native
  - Production-grade at scale

- **AWS EventBridge + SQS** (Serverless)
  - Fully managed, auto-scaling
  - Pay-per-event pricing
  - Native AWS integration

- **Apache Kafka** (High-volume events)
  - Distributed streaming platform
  - Event replay capabilities
  - Multi-tenancy support

### 2.2 Tech Stack Summary

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION STACK                     │
├─────────────────────────────────────────────────────────┤
│ Event Bus        │ RabbitMQ or AWS EventBridge          │
│ Message Queue    │ BullMQ + Redis                       │
│ Database         │ MySQL + Event Store (audit log)      │
│ Real-time        │ Socket.io + Redis Adapter            │
│ API Gateway      │ Express.js / Kong (enterprise)       │
│ Deployment       │ Docker + Kubernetes + Helm           │
│ Logging          │ ELK Stack / CloudWatch               │
│ Monitoring       │ Prometheus + Grafana                 │
│ Testing          │ Jest + Supertest + Testcontainers   │
│ CI/CD            │ GitHub Actions / GitLab CI           │
│ NPM Registry     │ npm / GitHub Package Registry        │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 3: Implementation Strategy (Four Sprints)

### **Sprint 1: Foundation & Module Publishing (Weeks 1-2)**

**Goals:**
- Extract domain logic into reusable npm module
- Set up event infrastructure (Redis/RabbitMQ)
- Implement core event emitters
- Publish first version to npm

**Deliverables:**
```
✓ Create packages/task-domain-lib with:
  - Event definitions (TypeScript classes)
  - Command handlers
  - Aggregates (domain models)
  - Value objects
  
✓ Set up GitHub Actions workflow for auto-publishing to npm
  - Semantic versioning
  - Changelog generation
  - Automated testing before publish

✓ Create separate publish/ directory with:
  - build scripts
  - version management
  - registry configuration

✓ Write CONTRIBUTING.md for FOSS guidelines
```

**Key Files to Create:**
- `packages/task-domain-lib/package.json`
- `packages/task-domain-lib/src/events/index.ts`
- `packages/task-domain-lib/src/aggregates/TaskAggregate.ts`
- `.github/workflows/publish-npm-module.yml`
- `packages/task-domain-lib/.npmrc`

**Testing:**
- Unit tests: 80%+ coverage for domain logic
- Integration: Command → Event flows

---

### **Sprint 2: Event-Driven Core (Weeks 3-4)**

**Goals:**
- Implement command-query separation (CQRS pattern)
- Set up event bus integration
- Create event listeners/handlers
- Implement task notification feature

**Deliverables:**
```
✓ Create EventBus abstraction (interface-based):
  - Support multiple implementations (Redis, RabbitMQ, AWS)
  - Event publishing
  - Event subscribing
  - Dead-letter queue handling

✓ Task Domain Event Handlers:
  - TaskCreatedHandler → Emit notification event
  - TaskAssignedHandler → Notify assignee
  - TaskStatusChangedHandler → Update dashboards
  - TaskCommentedHandler → Notify watchers

✓ Notification Service:
  - Email notifications (SendGrid/AWS SES)
  - In-app notifications (WebSocket)
  - Notification preferences
  - Retry logic

✓ Refactor existing controllers to use event bus:
  - Instead of: create task → save → return
  - New: create command → emit event → publish → return
```

**New Directories:**
```
backend/src/
├── events/
│   ├── publishers/
│   │   ├── TaskEventPublisher.ts
│   │   └── NotificationEventPublisher.ts
│   └── handlers/
│       ├── TaskCreatedHandler.ts
│       ├── TaskAssignedHandler.ts
│       ├── NotificationHandler.ts
│       └── index.ts
├── commands/
│   ├── CreateTaskCommand.ts
│   ├── AssignTaskCommand.ts
│   └── index.ts
├── event-bus/
│   ├── EventBus.interface.ts
│   ├── RabbitMQEventBus.ts
│   ├── RedisEventBus.ts
│   └── index.ts
├── notifications/
│   ├── NotificationService.ts
│   ├── strategies/
│   │   ├── EmailNotification.ts
│   │   ├── WebSocketNotification.ts
│   │   └── index.ts
│   └── index.ts
└── event-store/
    ├── EventStore.ts
    ├── EventLog.ts (Prisma model)
    └── index.ts
```

**Testing:**
- Event flow tests: Task creation → notification sent
- Handler unit tests: Each handler isolated
- Integration: Event pub/sub end-to-end

---

### **Sprint 3: Real-Time Capabilities (Weeks 5-6)**

**Goals:**
- Implement WebSocket/Socket.io for real-time updates
- Create live notification dashboard
- Implement presence tracking
- Add real-time task updates

**Deliverables:**
```
✓ Socket.io Integration:
  - Namespace: /notifications
  - Namespace: /tasks
  - Namespace: /dashboard (analytics streaming)

✓ Real-time Features:
  - User A creates task → User B sees it instantly
  - Task status changes → All watchers notified
  - Comment posted → Real-time update
  - User online/offline status

✓ Frontend Socket.io Service:
  - Auto-reconnect logic
  - Event listeners
  - Message queuing on disconnect

✓ Redis Adapter:
  - Multi-server socket broadcasting
  - Scaled deployment support
```

**New Files:**
```
backend/src/
├── websocket/
│   ├── SocketManager.ts
│   ├── namespaces/
│   │   ├── NotificationsNamespace.ts
│   │   ├── TasksNamespace.ts
│   │   └── DashboardNamespace.ts
│   ├── middlewares/
│   │   ├── SocketAuthMiddleware.ts
│   │   └── SocketLoggerMiddleware.ts
│   └── index.ts
├── realtime-adapters/
│   ├── RedisAdapter.ts
│   └── index.ts

frontend/src/
├── services/
│   └── socket.ts (Socket.io client setup)
├── hooks/
│   ├── useRealTimeNotifications.ts
│   ├── useRealTimeTasks.ts
│   └── usePresence.ts
└── pages/
    └── NotificationsPage.tsx
```

**Testing:**
- WebSocket event flow tests
- Multi-client synchronization tests
- Stress test: 1000+ concurrent connections

---

### **Sprint 4: CI/CD, TDD, & Scalability (Weeks 7-8)**

**Goals:**
- Implement comprehensive test suite (>80% coverage)
- Set up CI/CD pipelines
- Prepare for serverless deployment
- Document for horizontal scaling

**Deliverables:**
```
✓ TDD Test Suite:
  - Unit tests: All services, handlers, aggregates
  - Integration tests: Event flows, API endpoints
  - E2E tests: User workflows
  - Coverage reports (80%+ target)

✓ CI/CD Pipelines (GitHub Actions):
  - On PR: Lint → Test → Build → Coverage check
  - On Merge to main: Auto-test → Auto-build
  - On Release Tag: Auto-publish npm module
  - On Release Tag: Auto-build Docker image
  - On Release Tag: Auto-deploy to staging
  - Manual promotion to production

✓ Docker & Container Setup:
  - Dockerfile for backend service
  - docker-compose for local development
  - Kubernetes manifests (deployment, service, ingress)
  - Helm charts for easy deployment

✓ Serverless Compatibility:
  - AWS Lambda handler wrapper
  - Stateless service design
  - Environment-based configuration
  - Cold-start optimization

✓ Production Readiness:
  - Health check endpoints
  - Graceful shutdown
  - Circuit breaker patterns
  - Rate limiting
  - Request tracing (distributed)
  - Structured logging (JSON format)

✓ Documentation:
  - API documentation (OpenAPI/Swagger)
  - Event catalog
  - Deployment guide
  - Scaling guide
  - Contributing guide
  - Architecture Decision Records (ADRs)
```

**New CI/CD Workflows:**
```
.github/workflows/
├── test.yml              # Run on PR
├── coverage.yml          # Code coverage check
├── build.yml             # Build Docker image
├── publish-module.yml    # Publish npm module
├── deploy-staging.yml    # Deploy to staging
├── deploy-prod.yml       # Deploy to production (manual)
└── codeql.yml            # Security scanning
```

**New Infrastructure Files:**
```
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── ingress.yaml
├── helm/
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
└── terraform/
    ├── main.tf
    ├── outputs.tf
    └── variables.tf
```

**Testing Framework:**
```
Test Pyramid:
    ▲
   /|\         E2E Tests (5-10%)
  / | \        Integration Tests (20-30%)
 /  |  \       Unit Tests (60-75%)
/____|____\
```

---

## Phase 4: Deployment Architecture

### 4.1 Local Development Stack

```yaml
Services:
- Backend (Express + Node.js)
- Frontend (React + Vite)
- MySQL (Docker)
- Redis (Event Bus + Cache)
- RabbitMQ (Message Broker - optional)
- Socket.io (Real-time)

Command:
$ docker-compose up -d
```

### 4.2 Staging Deployment

**Infrastructure:**
- **Compute:** Kubernetes cluster (3 nodes)
- **Database:** MySQL RDS (managed)
- **Message Queue:** RabbitMQ cluster (HA)
- **Cache:** Redis cluster (Sentinel mode)
- **Load Balancer:** Nginx/HAProxy
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack

### 4.3 Production Deployment (Multi-Region)

**Architecture:**
```
┌──────────────────────────────────────────────┐
│           Global Load Balancer               │
└─────────────────┬──────────────────────────┘
                  │
         ┌────────┴─────────┐
         ▼                   ▼
    Region 1            Region 2
  Kubernetes       Kubernetes
  Cluster (HA)     Cluster (HA)
    │                  │
    ├─ 3 Backend Pods  │
    ├─ Task Workers    │
    ├─ Notification    │
    │  Workers         │
    └─ Websocket       │
       Servers        ├─ (Same)
                      └─
                      
Database: MySQL Multi-Master Replication
Cache: Redis Cluster (sharded)
Events: Kafka (distributed + replay)
Messaging: RabbitMQ Cluster (federation)
```

---

## Phase 5: Task Notification Flow (Detailed Example)

### 5.1 User Creates & Assigns Task to Assignee

```
STEP 1: User clicks "Create Task"
│
├─ Frontend → POST /api/tasks (command)
│   {
│     "title": "Review PR",
│     "description": "Review feature branch",
│     "assigneeId": 5,
│     "projectId": 2
│   }
│
STEP 2: Backend - TaskController
│
├─ 1. Validate input (Zod schema)
├─ 2. Create Command object:
│    CreateTaskCommand {
│      id: uuid(),
│      title, description, assigneeId, projectId
│    }
├─ 3. Call TaskService.createTask(command)
│
STEP 3: TaskService (Uses Domain Library)
│
├─ 1. Load aggregates from repository
├─ 2. Validate business rules:
│    - Assignee exists
│    - Has permission to assign
├─ 3. Create TaskAggregate
├─ 4. Call aggregate.create(command)
│    → aggregate emits: TaskCreated event
├─ 5. Save to database
├─ 6. Publish event to Event Bus
│    EventBus.publish('task.created', {
│      taskId: 1,
│      title: "Review PR",
│      assigneeId: 5,
│      createdAt: timestamp
│    })
├─ 7. Return response to controller
│
STEP 4: Event Bus (Redis/RabbitMQ)
│
├─ Publishes event to all subscribers
│
STEP 5: Event Handlers (Fire in Parallel)
│
├─ TaskCreatedHandler
│  ├─ Update cache (invalidate dashboard)
│  └─ Log to event store
│
├─ NotificationHandler
│  ├─ Create notification record in DB
│  ├─ Emit 'notification.created' event
│  └─ Publish to notification queue
│
├─ WebSocketHandler (Real-time)
│  └─ Socket.io broadcast to assignee:
│     {
│       "type": "task_assigned",
│       "taskId": 1,
│       "title": "Review PR",
│       "from": "Manager Name"
│     }
│
STEP 6: Notification Service (Worker)
│
├─ Consumes from notification queue
├─ 1. Get user preferences:
│    - Email notifications enabled?
│    - In-app only?
├─ 2. Send via active channels:
│    │
│    ├─ EMAIL: SendGrid API
│    │  Subject: "New task assigned: Review PR"
│    │  Body: Task details + action link
│    │
│    └─ IN-APP: WebSocket push (already sent in Step 5)
│
STEP 7: User Receives Notification
│
├─ Real-time badge on frontend
├─ Browser notification (if enabled)
├─ Email notification (if enabled)
│
STEP 8: User Clicks on Notification
│
├─ Frontend: NotificationRead event
├─ Event Bus → Mark notification as read
├─ Dashboard updates in real-time
│
STEP 9: Response to Initial Request
│
└─ Frontend receives: {
     "taskId": 1,
     "status": "created",
     "eventId": "evt_xxxxx",
     "redirect": "/tasks/1"
   }
```

### 5.2 Data Flow Diagram

```
┌─────────────┐
│   Frontend  │ (React)
│ - Task Form │
└──────┬──────┘
       │ POST /api/tasks
       ▼
┌─────────────────────────────────────────┐
│         Express API Gateway             │
│ - Route: POST /api/tasks                │
│ - Auth Middleware: Validate JWT         │
│ - Validate Zod Schema                   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│       TaskController                    │
│ - Call TaskService.createTask()         │
│ - Handle errors                         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│       TaskService                       │
│ - Use task-domain-lib (@org/task-dom)   │
│ - Create TaskAggregate                  │
│ - Emit event: TaskCreated               │
│ - Save to DB                            │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│       Event Bus (Redis/RabbitMQ)        │
│ Channel: "task.created"                 │
└──────┬──────────────────────────────────┘
       │
   ┌───┼───┬──────────────────┐
   │   │   │                  │
   ▼   ▼   ▼                  ▼
  ┌──────────┐  ┌──────────────┐  ┌──────────────┐
  │ Notif    │  │ Cache        │  │ WebSocket    │
  │ Handler  │  │ Invalidator  │  │ Broadcaster  │
  └────┬─────┘  └──────────────┘  └──────┬───────┘
       │                                   │
       ▼                                   ▼
┌──────────────────┐            ┌──────────────────┐
│ Notification DB  │            │ Socket.io Client │
│ - Persist record │            │ - Live UI update │
│ - Queue for send │            │ - Badge refresh  │
└────┬─────────────┘            └──────────────────┘
     │
     ▼
┌──────────────────────┐
│ Notification Worker  │
│ - Email via SendGrid │
│ - SMS (future)       │
└──────────────────────┘
```

---

## Phase 6: Node Module Publishing & FOSS

### 6.1 NPM Module Structure

**Package: `@your-org/task-domain`**

```
Purpose: Shareable domain logic, events, and validators
Consumers: 
  - Main backend service
  - Mobile backend (future)
  - Third-party integrations
  - Other microservices

Directory: packages/task-domain-lib/

Publishing:
  - Registry: npm public or GitHub Package Registry
  - Versioning: Semantic (MAJOR.MINOR.PATCH)
  - CI: Auto-publish on git tag via GitHub Actions
```

### 6.2 FOSS Contribution Guidelines

```markdown
Create: packages/task-domain-lib/CONTRIBUTING.md

Sections:
1. Fork & Clone
2. Install dev dependencies
3. Run tests: npm test
4. Code style: ESLint + Prettier
5. Commit messages: Conventional Commits
6. PR process
7. Code review requirements
8. License: MIT/Apache 2.0

Add: LICENSE file (MIT)
Add: CODE_OF_CONDUCT.md
Add: SECURITY.md (vulnerability reporting)
```

### 6.3 Publishing Workflow

```yaml
GitHub Actions Workflow (.github/workflows/publish-npm-module.yml):

trigger: git tag (v1.0.0, v1.0.1, etc.)

steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Run linter (ESLint)
  5. Run tests (Jest)
  6. Build TypeScript
  7. Generate changelog (auto from commits)
  8. Publish to npm
  9. Create GitHub release
  10. Notify Slack/Discord
```

---

## Phase 7: TDD Implementation Strategy

### 7.1 Test Structure

```
backend/tests/
├── unit/
│   ├── aggregates/
│   │   ├── TaskAggregate.test.ts          (Domain model tests)
│   │   └── UserAggregate.test.ts
│   ├── services/
│   │   ├── TaskService.test.ts            (Business logic)
│   │   ├── NotificationService.test.ts
│   │   └── DashboardService.test.ts
│   ├── handlers/
│   │   ├── TaskCreatedHandler.test.ts     (Event handlers)
│   │   └── NotificationHandler.test.ts
│   └── validators/
│       ├── task-validator.test.ts         (Input validation)
│       └── comment-validator.test.ts
│
├── integration/
│   ├── events/
│   │   ├── task-creation-flow.test.ts     (Event chain)
│   │   ├── task-assignment-flow.test.ts
│   │   └── notification-flow.test.ts
│   ├── api/
│   │   ├── auth-endpoints.test.ts         (API routes)
│   │   ├── task-endpoints.test.ts
│   │   └── notification-endpoints.test.ts
│   └── websocket/
│       ├── socket-notifications.test.ts   (Real-time)
│       └── socket-task-updates.test.ts
│
├── e2e/
│   ├── user-workflows/
│   │   ├── create-task-workflow.test.ts   (Full user journeys)
│   │   ├── assign-task-workflow.test.ts
│   │   └── notification-journey.test.ts
│   └── fixtures/
│       ├── user-fixtures.ts
│       ├── task-fixtures.ts
│       └── test-database.ts
│
└── coverage/
    └── (Generated by Jest)
```

### 7.2 TDD Example: Task Creation

**Step 1: Write Test First**
```typescript
// tests/unit/aggregates/TaskAggregate.test.ts
describe('TaskAggregate', () => {
  describe('create', () => {
    it('should emit TaskCreated event when valid task is created', () => {
      const command = {
        id: 'task_123',
        title: 'Review PR',
        description: 'Feature branch review',
        assigneeId: 5,
        creatorId: 3,
        projectId: 2
      };

      const aggregate = new TaskAggregate();
      const events = aggregate.create(command);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('TaskCreated');
      expect(events[0].data.taskId).toBe('task_123');
    });

    it('should throw if assignee does not exist', () => {
      const invalidCommand = { ...command, assigneeId: null };
      const aggregate = new TaskAggregate();

      expect(() => aggregate.create(invalidCommand)).toThrow('Assignee is required');
    });
  });
});
```

**Step 2: Implement to Pass Test**
```typescript
// packages/task-domain-lib/src/aggregates/TaskAggregate.ts
export class TaskAggregate {
  create(command: CreateTaskCommand): DomainEvent[] {
    if (!command.assigneeId) {
      throw new Error('Assignee is required');
    }

    const event = new TaskCreated({
      taskId: command.id,
      title: command.title,
      description: command.description,
      assigneeId: command.assigneeId,
      creatorId: command.creatorId,
      projectId: command.projectId
    });

    return [event];
  }
}
```

**Step 3: Test Event Handler**
```typescript
// tests/integration/events/task-creation-flow.test.ts
describe('Task Creation Flow', () => {
  it('should notify assignee when task is created and assigned', async () => {
    const eventBus = new TestEventBus();
    const notificationService = new NotificationService(eventBus);

    eventBus.publish('task.created', {
      taskId: 1,
      title: 'Review PR',
      assigneeId: 5
    });

    await new Promise(resolve => setTimeout(resolve, 100)); // Let async handlers run

    expect(notificationService.notifications).toHaveLength(1);
    expect(notificationService.notifications[0].userId).toBe(5);
  });
});
```

### 7.3 Coverage Requirements

```
Targets:
- Unit Tests: 80%+ line coverage
- Integration Tests: 70%+ path coverage
- E2E Tests: Critical user flows (100%)

Enforcement:
- CI/CD blocks PR if coverage < 80%
- Coverage report uploaded to Codecov
- Coverage badge in README
```

---

## Phase 8: CI/CD Pipeline Structure

### 8.1 GitHub Actions Workflows

```
Workflow Triggers:

ON: Pull Request
  - Run tests
  - Lint code
  - Check coverage
  - Build Docker image (don't push)
  
ON: Push to main
  - Run full test suite
  - Build Docker image
  - Push to staging registry
  - Deploy to staging environment
  - Run smoke tests
  
ON: Git Tag (v*.*.*) Release
  - Run all tests
  - Publish npm module
  - Build Docker image
  - Push to prod registry
  - Create GitHub release
  - Manual approval for prod deploy
```

### 8.2 Pipeline Structure

```yaml
.github/workflows/pull-request.yml:
  ├─ Install dependencies
  ├─ Lint (ESLint)
  ├─ Type check (TypeScript)
  ├─ Unit tests (Jest)
  ├─ Coverage check (80%+ threshold)
  ├─ Build Docker image
  ├─ Security scan (OWASP/Snyk)
  └─ Comment results on PR

.github/workflows/deploy.yml:
  ├─ Build & push Docker (staging)
  ├─ Deploy to K8s (staging)
  ├─ Run smoke tests
  ├─ Wait for manual approval
  └─ Deploy to production (K8s)

.github/workflows/publish-npm.yml:
  ├─ Verify all tests pass
  ├─ Build module
  ├─ Publish to npm
  ├─ Create GitHub release
  └─ Notify Slack
```

---

## Phase 9: Scalability & Performance

### 9.1 Horizontal Scaling Strategy

**Stateless Design:**
```
✓ NO session state in memory
✓ All session state in Redis
✓ Task assignments distributed via message queue
✓ WebSocket servers behind load balancer (sticky sessions)
```

**Scale Backend Services:**
```
Frontend
  │
  └─ Load Balancer (Nginx)
      │
      ├─ Backend Pod 1 (Task API)
      ├─ Backend Pod 2 (Task API)
      ├─ Backend Pod 3 (Task API)
      │
      └─ Shared Services:
         ├─ RabbitMQ Cluster (3 nodes)
         ├─ Redis Cluster (6 nodes)
         ├─ MySQL (Primary + Replicas)
         └─ WebSocket Server Pool
```

**Auto-scaling:**
```
Kubernetes HPA (Horizontal Pod Autoscaler):
  - Target: CPU 70% or 1000 req/sec
  - Min replicas: 3
  - Max replicas: 20
  - Scale up: 30 seconds
  - Scale down: 300 seconds
```

### 9.2 Performance Targets

```
API Response Times (p95):
- Authentication: < 100ms
- Task CRUD: < 200ms
- Dashboard: < 500ms
- Real-time updates: < 100ms latency

Throughput:
- 1000+ concurrent users
- 10,000 events/second
- 50,000+ tasks in system

Database:
- Query p95: < 50ms
- Replication lag: < 100ms
```

### 9.3 Caching Strategy

```
Cache Layers:
1. Browser cache (static assets)
2. Redis cache (session + computed data)
3. MySQL query cache
4. CDN (images, static files)

Cache Invalidation:
- Event-driven: Clear on TaskCreated, TaskUpdated
- TTL-based: Dashboard summary (5 minutes)
- Manual: Admin override
```

---

## Phase 10: Monitoring & Observability

### 10.1 Logging Strategy

```
Structured Logging (JSON format):

{
  "timestamp": "2026-07-25T10:30:00Z",
  "level": "INFO",
  "service": "task-backend",
  "requestId": "req_12345",
  "userId": 5,
  "action": "task.created",
  "taskId": 1,
  "duration_ms": 45,
  "status": "success",
  "metadata": {
    "projectId": 2,
    "assigneeId": 5
  }
}

Forwarded to: ELK Stack / CloudWatch
Searchable by: requestId, userId, action, taskId
```

### 10.2 Metrics & Monitoring

```
Key Metrics:
- API response times (p50, p95, p99)
- Event processing latency
- Queue depth (pending events)
- WebSocket connection count
- Database query performance
- Cache hit ratio
- Error rate by type
- User engagement (DAU, active tasks)

Visualized in Grafana Dashboards:
- System health (CPU, memory, disk)
- API performance
- Event processing
- Business metrics
```

### 10.3 Distributed Tracing

```
Using OpenTelemetry:

Task Creation Trace:
│
├─ API Request (100ms total)
│  ├─ Auth validation (5ms)
│  ├─ Input validation (3ms)
│  ├─ Database write (45ms)
│  └─ Event publish (47ms)
│
├─ Event Processing (25ms)
│  ├─ Notification handler (10ms)
│  └─ Cache invalidation (15ms)
│
└─ WebSocket broadcast (8ms)

View in: Jaeger / DataDog
```

---

## Implementation Roadmap

### Timeline Overview

```
Q3 2026:
  Week 1-2: Sprint 1 (Module & Publishing)
  Week 3-4: Sprint 2 (Event-Driven Core)
  
Q4 2026:
  Week 1-2: Sprint 3 (Real-Time)
  Week 3-4: Sprint 4 (CI/CD & TDD)
  
Ongoing: Monitoring, scaling, optimization
```

### Decision Points

**Before Sprint 2:**
- [ ] Event Bus technology: Redis vs RabbitMQ vs AWS EventBridge?
- [ ] Notification channels: Email only? SMS? Push notifications?
- [ ] Real-time requirement: WebSocket for all features or selective?

**Before Sprint 3:**
- [ ] Socket.io or raw WebSocket?
- [ ] Horizontal scaling requirement?

**Before Sprint 4:**
- [ ] Kubernetes or serverless?
- [ ] Multi-region deployment needed?
- [ ] SLA requirements?

---

## File Structure Checklist

```
Root/
├── ENTERPRISE_ARCHITECTURE_PLAN.md ✓ (This file)
├── backend/
│   ├── src/
│   │   ├── events/
│   │   ├── commands/
│   │   ├── event-bus/
│   │   ├── notifications/
│   │   ├── websocket/
│   │   ├── event-store/
│   │   └── ... (existing)
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── Dockerfile
│   └── docker-compose.yml
├── packages/
│   └── task-domain-lib/
│       ├── src/
│       │   ├── events/
│       │   ├── commands/
│       │   ├── aggregates/
│       │   ├── value-objects/
│       │   ├── repositories/
│       │   ├── services/
│       │   └── validators/
│       ├── tests/
│       ├── package.json
│       ├── README.md
│       └── CONTRIBUTING.md
├── publish/
│   ├── scripts/
│   │   ├── version.js
│   │   └── publish.js
│   └── README.md
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── .github/
│   └── workflows/
│       ├── test.yml
│       ├── publish-npm-module.yml
│       ├── deploy.yml
│       └── codeql.yml
└── docs/
    ├── api-design.md
    ├── event-catalog.md
    ├── deployment-guide.md
    └── architecture-decisions.md
```

---

## Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Code Coverage | 80%+ | Sprint 4 |
| Test Execution Time | < 5 min | Sprint 4 |
| Event Processing Latency | < 100ms | Sprint 2 |
| API Response Time (p95) | < 200ms | Sprint 3 |
| npm Module Downloads | 100+ (first month) | Sprint 1 |
| CI/CD Deployment Time | < 10 min | Sprint 4 |
| System Uptime | 99.9% | Production |
| Real-time Notification Latency | < 1 second | Sprint 3 |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Event ordering | Data inconsistency | Event versioning + sequence numbers |
| Message loss | Lost notifications | Persistent queue + retries |
| WebSocket connection drops | Missed updates | Client-side reconnect logic |
| Database bottleneck | Slow queries | Read replicas + caching |
| npm module compatibility | Breaking changes | Semantic versioning + deprecation notices |
| Deployment failures | Service downtime | Blue-green deployments + rollback |

---

## Next Steps (Immediate)

1. **Review this plan** with team stakeholders
2. **Decide on technology stack:**
   - Event Bus: Redis (fast start) or RabbitMQ (enterprise)?
   - Real-time: Socket.io or raw WebSocket?
   - Deployment: Docker + K8s or serverless?
3. **Create sprint backlog** based on Sprint 1 goals
4. **Set up repository structure:**
   - Create `packages/` directory
   - Create GitHub Actions workflow templates
5. **Define team responsibilities:**
   - Who owns npm module?
   - Who owns real-time layer?
   - Who owns CI/CD?
6. **Establish coding standards:**
   - ESLint configuration
   - Test coverage requirements
   - Commit message conventions

---

## Key References & Resources

- **Domain-Driven Design:** Vaughn Vernon's "Implementing Domain-Driven Design"
- **Event Sourcing:** "Event Sourcing Made Simple" by Jérémie Wenger
- **Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices
- **Event-Driven Architecture:** https://www.nginx.com/blog/introduction-to-microservices/
- **RabbitMQ Guide:** https://www.rabbitmq.com/
- **Socket.io Documentation:** https://socket.io/docs/
- **Kubernetes Best Practices:** https://kubernetes.io/docs/concepts/workloads/

---

**Document Status:** DRAFT - Ready for Review  
**Last Updated:** 2026-07-25  
**Next Review:** After stakeholder feedback  
