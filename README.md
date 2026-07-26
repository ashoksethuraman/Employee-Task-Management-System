# Employee Task Management Platform

Enterprise-grade full-stack task management platform with role-based access, real-time notifications, project tracking, analytics, and production-ready TypeScript architecture.

## Overview

This repository contains a complete web platform for managing users, projects, and tasks across Admin, Manager, and Employee roles.

Core characteristics:
- Type-safe backend and frontend with TypeScript
- JWT authentication and role-based authorization
- MySQL + Prisma for transactional data
- Socket.io real-time notifications
- Redux Toolkit state management
- Structured backend architecture (routes/controllers/services/middleware)
- Docker-ready deployment stack

## Key Features Included

- Authentication and authorization
- Role hierarchy: ADMIN, MANAGER, EMPLOYEE
- Secure employee-first onboarding flow
- Task lifecycle: create, assign, update, delete, status tracking
- Project management: create/list projects
- Task comments for collaboration
- Dashboard and analytics summary endpoints
- Real-time notifications for task assignment events
- Notification bell + toast notifications in frontend
- Protected frontend routes with auth-aware navigation
- Automatic DB bootstrap and seed data on backend start

## Technology Stack

Backend:
- Node.js + Express
- TypeScript
- Prisma ORM
- MySQL
- JWT (jsonwebtoken)
- Zod validation
- Socket.io

Frontend:
- React + Vite
- TypeScript
- Redux Toolkit + React Redux
- React Router
- Axios
- Socket.io Client
- Tailwind CSS

Infrastructure:
- Docker Compose (MySQL + backend + frontend)
- Nginx frontend container in deployment mode

## Repository Structure

```text
Employee-Task-Management-System/
  backend/                # API service
  frontend/               # React application
  documents/              # Curated engineering documentation
  docker-compose.yml      # Deployment stack
  .env.example            # Environment template for compose
  README.md               # Primary project guide
```

Documentation retained in root documents folder:
- documents/API_DOCUMENTATION.md
- documents/BACKEND_DOCUMENTATION.md
- documents/ARCHITECTURE_EXPLAINED.md
- documents/ENTERPRISE_ARCHITECTURE_PLAN.md
- documents/TESTING_GUIDE.md

## Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+
- Docker Desktop (optional, for containerized deployment)

Note: Redis is currently optional and not required by runtime code.

## Local Development Setup

### 1. Backend Setup

```powershell
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL="mysql://root:root@127.0.0.1:3306/employee_management"
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="24h"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

If your DB password contains `@`, encode it as `%40` in `DATABASE_URL`.

Start backend:

```powershell
npm run dev
```

Backend runs on:
- http://localhost:5000

### 2. Frontend Setup

Open a second terminal:

```powershell
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

Start frontend:

```powershell
npm run dev
```

Frontend runs on:
- http://localhost:5173

## Docker Deployment

Use when you want containerized runtime.

```powershell
docker compose up -d --build
```

Exposed services:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MySQL: localhost:3306

Shutdown:

```powershell
docker compose down
```

## Seeded Users (Auto-created)

On first backend startup, initial users and sample tasks are seeded automatically:

- admin@company.com / Admin@123
- manager@company.com / Manager@123
- employee@company.com / Employee@123

## User Registration and Role Management Flow

The application now follows a secure role bootstrap model:

1. Any new user can self-register from the public registration page.
2. Every self-registered account is created as `EMPLOYEE`.
3. Existing `ADMIN` users can open the Users page and promote users to `MANAGER` or `ADMIN`.
4. The first admin account must exist already, either from the seeded startup data or by manual bootstrap in the database for a fresh environment.

This prevents public self-registration as an elevated role.

## API Surface

Primary API groups:
- /api/auth
- /api/tasks
- /api/projects
- /api/comments
- /api/users
- /api/dashboard

For complete endpoint contract, request/response schema, and status codes, see:
- documents/API_DOCUMENTATION.md

## How to Use the Application

1. Register or log in.
2. New accounts start as Employee automatically.
3. An Admin can review users in the User Directory and promote them to Manager / HR or Admin.
4. Navigate to Dashboard for role-aware metrics.
5. Create projects (Admin/Manager).
6. Create and assign tasks (Admin/Manager).
7. Update task status and details.
8. Add comments on tasks for collaboration.
9. Watch real-time notifications arrive in-app when events occur.
10. Use Users and Analytics pages for team visibility.

## Production/Engineering Notes

- Backend is organized by clear concerns:
  - routes -> controllers -> services
  - middleware for auth/logging/error handling
- Input validation is enforced via Zod schemas.
- Prisma schema is source of truth for data model.
- Socket auth is enforced before namespace connection.
- Compose and env templates include commented Redis blocks for future enablement.

## Verification Commands

Backend build:

```powershell
cd backend
npm run build
```

Frontend build:

```powershell
cd frontend
npm run build
```

## Test Coverage and Reports

Backend coverage run:

```powershell
cd backend
npm run test:coverage
```

This command is CI-safe and exits successfully even when tests are not added yet.

Backend coverage outputs:
- Console summary table after run
- HTML report: backend/coverage/lcov-report/index.html
- JSON summary: backend/coverage/coverage-summary.json

Open HTML report on Windows:

```powershell
cd backend
start .\coverage\lcov-report\index.html
```

Frontend coverage run:

```powershell
cd frontend
npm run test:coverage
```

Frontend coverage outputs:
- Console summary table after run
- HTML report: frontend/coverage/index.html
- JSON summary: frontend/coverage/coverage-summary.json

Open frontend HTML report on Windows:

```powershell
cd frontend
start .\coverage\index.html
```

## Current Project Status

- Backend build: passing
- Frontend build: passing
- Redis runtime dependency: removed (future optional)
- Self-registration is locked to Employee and admin promotion flow is implemented
- Root documentation: consolidated to `documents/`

## Support Docs

- documents/BACKEND_DOCUMENTATION.md
- documents/ARCHITECTURE_EXPLAINED.md
- documents/ENTERPRISE_ARCHITECTURE_PLAN.md
- documents/TESTING_GUIDE.md
