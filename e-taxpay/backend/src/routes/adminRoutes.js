import express from 'express';
import { getAllUsers, getMetrics, getDashboardStats } from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication AND admin privileges
router.use(requireAuth, requireAdmin);

router.get('/users', getAllUsers);
router.get('/metrics', getMetrics);
router.get('/stats', getDashboardStats);

export default router;
