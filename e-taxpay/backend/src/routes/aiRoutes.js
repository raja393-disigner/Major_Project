import express from 'express';
import { getAIInsights } from '../controllers/aiController.js';
import { getAIChatResponse } from '../controllers/aiChatController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/insights', requireAuth, requireAdmin, getAIInsights);
router.post('/chat', requireAuth, getAIChatResponse);

export default router;
