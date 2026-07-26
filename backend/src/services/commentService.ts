import prisma from '../utils/prisma';

export async function addComment(taskId: number, userId: number, body: string) {
  return prisma.comment.create({
    data: { taskId, userId, body },
    include: { user: true, task: true },
  });
}

export async function getCommentsForTask(taskId: number) {
  return prisma.comment.findMany({
    where: { taskId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
}
