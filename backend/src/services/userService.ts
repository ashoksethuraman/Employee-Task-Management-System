import { Role } from '@prisma/client';
import { AppError } from '../middleware/appError';
import prisma from '../utils/prisma';

export async function getUsers() {
  return prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({ select: { id: true, name: true, email: true, role: true, createdAt: true }, where: { id } });
}

export async function updateUserRole(id: number, role: Role) {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  if (existingUser.role === Role.ADMIN && role !== Role.ADMIN) {
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
    if (adminCount <= 1) {
      throw new AppError('At least one admin account must remain', 400);
    }
  }

  return prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}
