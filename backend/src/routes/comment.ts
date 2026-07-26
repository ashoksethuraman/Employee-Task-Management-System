import express from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate';
import { createCommentSchema } from '../schemas/comment';
import { taskIdParamSchema } from '../schemas/common';
import { createComment, listComments } from '../controllers/commentController';

const router = express.Router();
router.use(requireAuth);
router.post('/', validateBody(createCommentSchema), createComment);
router.get('/:taskId', validateParams(taskIdParamSchema), listComments);

export default router;
