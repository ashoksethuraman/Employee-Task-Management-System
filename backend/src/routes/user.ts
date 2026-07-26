import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { listUsers, getUser, changeUserRole } from '../controllers/userController';
import { validateBody, validateParams } from '../middleware/validate';
import { idParamSchema } from '../schemas/common';
import { updateUserRoleSchema } from '../schemas/user';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['ADMIN', 'MANAGER']));
router.get('/', listUsers);
router.get('/:id', validateParams(idParamSchema), getUser);
router.put('/:id/role', validateParams(idParamSchema), requireRole(['ADMIN']), validateBody(updateUserRoleSchema), changeUserRole);

export default router;
