import prisma from '../utils/prisma';
import { AppError } from '../middleware/appError';
import { Prisma } from '@prisma/client';

export async function getProjects() {
  return prisma.project.findMany({ orderBy: { name: 'asc' } });
}

export async function createProject(name: string, description?: string) {
  try {
    return await prisma.project.create({
      data: {
        name,
        description,
      },
    });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError('Project name must be unique', 400);
    }
    throw err;
  }
}
