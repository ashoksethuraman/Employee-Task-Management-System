import express from 'express';
import request from 'supertest';

jest.mock('../src/middleware/auth', () => ({
  requireAuth: (_req: any, _res: any, next: any) => next(),
  requireRole: (_roles: string[]) => (_req: any, _res: any, next: any) => next()
}));

jest.mock('../src/middleware/validate', () => ({
  validateBody: () => (_req: any, _res: any, next: any) => next(),
  validateParams: () => (_req: any, _res: any, next: any) => next()
}));

jest.mock('../src/controllers/authController', () => ({
  register: jest.fn((_req: any, res: any) => res.status(201).json({ ok: true, endpoint: 'auth/register' })),
  login: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true, endpoint: 'auth/login' }))
}));

jest.mock('../src/controllers/taskController', () => ({
  listTasks: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true, endpoint: 'tasks/list' })),
  createNewTask: jest.fn((_req: any, res: any) => res.status(201).json({ ok: true, endpoint: 'tasks/create' })),
  getTask: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true, endpoint: 'tasks/get' })),
  updateExistingTask: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true, endpoint: 'tasks/update' })),
  removeTask: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true, endpoint: 'tasks/remove' }))
}));

jest.mock('../src/controllers/userController', () => ({
  listUsers: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true, endpoint: 'users/list' })),
  getUser: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true, endpoint: 'users/get' })),
  changeUserRole: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true, endpoint: 'users/change-role' }))
}));

jest.mock('../src/controllers/projectController', () => ({
  listProjects: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true, endpoint: 'projects/list' })),
  createNewProject: jest.fn((_req: any, res: any) => res.status(201).json({ ok: true, endpoint: 'projects/create' }))
}));

jest.mock('../src/controllers/commentController', () => ({
  createComment: jest.fn((_req: any, res: any) => res.status(201).json({ ok: true, endpoint: 'comments/create' })),
  listComments: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true, endpoint: 'comments/list' }))
}));

jest.mock('../src/controllers/dashboardController', () => ({
  getDashboardSummary: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true, endpoint: 'dashboard/summary' }))
}));

import authRoutes from '../src/routes/auth';
import taskRoutes from '../src/routes/task';
import userRoutes from '../src/routes/user';
import projectRoutes from '../src/routes/project';
import commentRoutes from '../src/routes/comment';
import dashboardRoutes from '../src/routes/dashboard';

import * as authController from '../src/controllers/authController';
import * as taskController from '../src/controllers/taskController';
import * as userController from '../src/controllers/userController';
import * as projectController from '../src/controllers/projectController';
import * as commentController from '../src/controllers/commentController';
import * as dashboardController from '../src/controllers/dashboardController';

describe('API route integration (Supertest)', () => {
  const app = express();
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  it('POST /api/auth/register', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(201);
    expect((authController.register as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/login', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(200);
    expect((authController.login as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('GET /api/tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect((taskController.listTasks as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('POST /api/tasks', async () => {
    const res = await request(app).post('/api/tasks').send({});
    expect(res.status).toBe(201);
    expect((taskController.createNewTask as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('GET /api/tasks/:id', async () => {
    const res = await request(app).get('/api/tasks/1');
    expect(res.status).toBe(200);
    expect((taskController.getTask as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('PUT /api/tasks/:id', async () => {
    const res = await request(app).put('/api/tasks/1').send({ status: 'DONE' });
    expect(res.status).toBe(200);
    expect((taskController.updateExistingTask as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('DELETE /api/tasks/:id', async () => {
    const res = await request(app).delete('/api/tasks/1');
    expect(res.status).toBe(200);
    expect((taskController.removeTask as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('GET /api/users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect((userController.listUsers as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('GET /api/users/:id', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.status).toBe(200);
    expect((userController.getUser as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('PUT /api/users/:id/role', async () => {
    const res = await request(app).put('/api/users/1/role').send({ role: 'ADMIN' });
    expect(res.status).toBe(200);
    expect((userController.changeUserRole as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('GET /api/projects', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect((projectController.listProjects as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('POST /api/projects', async () => {
    const res = await request(app).post('/api/projects').send({});
    expect(res.status).toBe(201);
    expect((projectController.createNewProject as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('POST /api/comments', async () => {
    const res = await request(app).post('/api/comments').send({});
    expect(res.status).toBe(201);
    expect((commentController.createComment as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('GET /api/comments/:taskId', async () => {
    const res = await request(app).get('/api/comments/1');
    expect(res.status).toBe(200);
    expect((commentController.listComments as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('GET /api/dashboard/summary', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(200);
    expect((dashboardController.getDashboardSummary as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });
});
