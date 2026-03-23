import express from "express";
import { loginUser, getNotices } from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// USER LOGIN ROUTE
router.post("/login", loginUser);

// AUTH REQUIRED ROUTES
router.get("/notices", requireAuth, getNotices);

export default router;