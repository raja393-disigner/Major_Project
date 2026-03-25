import express from 'express';
import { createUpdate, getUpdates, deleteUpdate } from '../controllers/govUpdateController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly reachable by authenticated users
router.get('/', requireAuth, getUpdates);

// Admin-only routes
router.post('/', requireAuth, requireAdmin, createUpdate);
router.delete('/:id', requireAuth, requireAdmin, deleteUpdate);

export default router;
