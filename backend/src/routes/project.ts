import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createProjectSchema } from '../schemas/project';
import { listProjects, createNewProject } from '../controllers/projectController';

const router = express.Router();

router.use(requireAuth);
router.get('/', listProjects);
router.post('/', requireRole(['ADMIN', 'MANAGER']), validateBody(createProjectSchema), createNewProject);

export default router;
