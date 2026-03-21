import express from "express";
import { loginUser } from "../controllers/userController.js";

const router = express.Router();

// USER LOGIN ROUTE
router.post("/login", loginUser);

export default router;