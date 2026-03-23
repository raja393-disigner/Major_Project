import express from 'express';
import { submitComplaint, getAllComplaints, updateComplaintStatus } from '../controllers/complaintController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/Authenticated - File a complaint
router.post('/', (req, res, next) => {
    // If token is there, try to authenticate to link user, else proceed as guest
    if (req.headers.authorization) {
        return requireAuth(req, res, next);
    }
    next();
}, submitComplaint);

// Admin Routes
router.get('/admin/all', requireAuth, requireAdmin, getAllComplaints);
router.patch('/admin/:id/status', requireAuth, requireAdmin, updateComplaintStatus);

export default router;
