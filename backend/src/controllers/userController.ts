import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { getUsers, getUserById, updateUserRole } from '../services/userService';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.id);
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function changeUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body as { role: Role };
    const user = await updateUserRole(userId, role);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
