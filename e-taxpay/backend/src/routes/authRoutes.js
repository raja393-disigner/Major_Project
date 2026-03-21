import express from 'express';
import { loginUser, registerUser, loginAdmin, setupAdmin } from '../controllers/authController.js';

const router = express.Router();

// Public routes for logging in
router.post('/login/user', loginUser);
router.post('/register', registerUser);
router.post('/login/admin', loginAdmin);
router.get('/setup-admin', setupAdmin);

export default router;
