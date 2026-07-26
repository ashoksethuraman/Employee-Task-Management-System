import prisma from '../utils/prisma';
import { TaskStatus } from '@prisma/client';

async function getDefaultProject() {
  let project = await prisma.project.findFirst({ where: { name: 'Employee Management' } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Employee Management',
        description: 'Default project for seeded tasks',
      },
    });
  }
  return project;
}

export async function getTasksForUser(userId: number, role: string) {
  const filter = role === 'ADMIN' ? {} : { assigneeId: userId };
  return prisma.task.findMany({
    where: filter,
    include: { assignee: true, creator: true, comments: true, project: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createTask(title: string, description: string, assigneeId: number, creatorId: number, projectId?: number) {
  const project = projectId ? await prisma.project.findUnique({ where: { id: projectId } }) : await getDefaultProject();
  const connectProject = project ? { connect: { id: project.id } } : { connect: { id: (await getDefaultProject()).id } };

  return prisma.task.create({
    data: {
      title,
      description,
      assignee: { connect: { id: assigneeId } },
      creator: { connect: { id: creatorId } },
      project: connectProject,
    },
    include: { assignee: true, creator: true, comments: true, project: true },
  });
}

export async function getTaskById(taskId: number) {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: { assignee: true, creator: true, project: true, comments: { include: { user: true } } },
  });
}

export async function updateTask(taskId: number, values: Partial<{ title: string; description: string; status: TaskStatus; assigneeId: number; projectId: number }>) {
  const data: any = { ...values };
  if (values.assigneeId !== undefined) {
    data.assignee = { connect: { id: values.assigneeId } };
    delete data.assigneeId;
  }
  if (values.projectId !== undefined) {
    data.project = { connect: { id: values.projectId } };
    delete data.projectId;
  }

  return prisma.task.update({
    where: { id: taskId },
    data,
    include: { assignee: true, creator: true, project: true, comments: true },
  });
}

export async function deleteTask(taskId: number) {
  await prisma.task.delete({ where: { id: taskId } });
}
