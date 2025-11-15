import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/admin.js";
import {
  createStylerCloth,
  getMyStylerClothes,
  getStylerClothById,
  updateStylerCloth,
  deleteStylerCloth,
  getAllStylerClothesPublic
} from "../controllers/stylerClothesController.js";

const router = express.Router();

// Public route to get all styler clothes
router.get("/all", getAllStylerClothesPublic);

router.get("/mine", verifyToken, verifyRole("styler"), getMyStylerClothes);
router.post("/", verifyToken, verifyRole("styler"), createStylerCloth);
router.get("/:id", verifyToken, verifyRole("styler"), getStylerClothById);
router.put("/:id", verifyToken, verifyRole("styler"), updateStylerCloth);
router.delete("/:id", verifyToken, verifyRole(["styler", "admin"]), deleteStylerCloth);

export default router;
