import express from 'express';
import { getAIInsights } from '../controllers/aiController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/insights', requireAuth, requireAdmin, getAIInsights);

export default router;
