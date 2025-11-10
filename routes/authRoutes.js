import express from "express";
import {
  register,
  login,
  getProfile,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes - require authentication
router.get("/profile", authenticate, getProfile);

export default router;

