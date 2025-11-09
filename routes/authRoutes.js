import express from "express";
import {
  register,
  login,
  approveUser,
  getPendingUsers,
  getProfile,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes - require authentication
router.get("/profile", authenticate, getProfile);

// Admin only routes - require authentication and admin role
router.get("/pending", authenticate, requireAdmin, getPendingUsers);
router.put("/approve/:userId", authenticate, requireAdmin, approveUser);

export default router;

