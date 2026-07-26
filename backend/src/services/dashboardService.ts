import prisma from '../utils/prisma';

export async function getSummary(userId: number, role: string) {
  if (role === 'EMPLOYEE') {
    const taskCounts = await prisma.task.groupBy({
      by: ['status'],
      where: { assigneeId: userId },
      _count: { id: true },
    });

    return {
      tasks: taskCounts.reduce((acc, item) => ({ ...acc, [item.status]: item._count.id }), {} as Record<string, number>),
      users: {},
    };
  }

  const taskCounts = await prisma.task.groupBy({
    by: ['status'],
    _count: { id: true },
  });
  const userCounts = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true },
  });

  return {
    tasks: taskCounts.reduce((acc, item) => ({ ...acc, [item.status]: item._count.id }), {} as Record<string, number>),
    users: userCounts.reduce((acc, item) => ({ ...acc, [item.role]: item._count.id }), {} as Record<string, number>),
  };
}
