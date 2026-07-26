import express from 'express';
import { requireAuth } from '../middleware/auth';
import { getDashboardSummary } from '../controllers/dashboardController';

const router = express.Router();
router.use(requireAuth);
router.get('/summary', getDashboardSummary);

export default router;
