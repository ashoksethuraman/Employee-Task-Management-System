import { loginSchema, registerSchema } from '../src/schemas/auth';
import { createCommentSchema } from '../src/schemas/comment';
import { createProjectSchema } from '../src/schemas/project';
import { createTaskSchema, updateTaskSchema } from '../src/schemas/task';

describe('auth schemas', () => {
  it('accepts valid register payload', () => {
    const result = registerSchema.safeParse({
      name: 'Admin User',
      email: 'admin@company.com',
      password: 'Admin@123',
      confirmPassword: 'Admin@123',
      role: 'ADMIN'
    });

    expect(result.success).toBe(true);
  });

  it('rejects register payload when passwords do not match', () => {
    const result = registerSchema.safeParse({
      name: 'Admin User',
      email: 'admin@company.com',
      password: 'Admin@123',
      confirmPassword: 'Wrong@123'
    });

    expect(result.success).toBe(false);
  });

  it('validates login payload', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'secret1' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'secret1' }).success).toBe(false);
  });
});

describe('task schemas', () => {
  it('accepts valid create task payload', () => {
    const result = createTaskSchema.safeParse({
      title: 'Build tests',
      description: 'Write integration and unit tests',
      assigneeId: 2,
      projectId: 1
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid create task payload', () => {
    const result = createTaskSchema.safeParse({
      title: 'No',
      description: 'bad',
      assigneeId: -10
    });

    expect(result.success).toBe(false);
  });

  it('accepts partial update task payload', () => {
    const result = updateTaskSchema.safeParse({ status: 'DONE' });
    expect(result.success).toBe(true);
  });
});

describe('project and comment schemas', () => {
  it('accepts valid project payload', () => {
    expect(createProjectSchema.safeParse({ name: 'Platform Revamp', description: 'Q3 initiative' }).success).toBe(true);
  });

  it('rejects short project name', () => {
    expect(createProjectSchema.safeParse({ name: 'AB' }).success).toBe(false);
  });

  it('accepts valid comment payload', () => {
    expect(createCommentSchema.safeParse({ taskId: 1, body: 'Looks good' }).success).toBe(true);
  });

  it('rejects invalid comment payload', () => {
    expect(createCommentSchema.safeParse({ taskId: 0, body: 'x' }).success).toBe(false);
  });
});
