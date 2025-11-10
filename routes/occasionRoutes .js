import express from "express";
import {
  createOccasion,
  getAllOccasions,
  getOccasionById,
  updateOccasion,
  deleteOccasion
} from "../controllers/occasionController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/admin.js";

const router = express.Router();

// Public reads
router.get("/", getAllOccasions);
router.get("/:id", getOccasionById);

// Create: only styler
router.post("/", verifyToken, verifyRole("styler"), createOccasion);

// Update/Delete: allow styler or admin
router.put("/:id", verifyToken, verifyRole(["styler", "admin"]), updateOccasion);
router.delete("/:id", verifyToken, verifyRole(["styler", "admin"]), deleteOccasion);

export default router;
