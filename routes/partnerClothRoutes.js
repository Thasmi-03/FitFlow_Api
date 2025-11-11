// server/Api/routes/clothesRoutes.js
import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/admin.js";
import {
  createCloth,
  getPublicCloths,
  getMyCloths,
  getClothById,
  updateCloth,
  deleteCloth,
  getSuggestions
} from "../controllers/partnerClothController.js";

const router = express.Router();

router.get("/public", getPublicCloths);
router.get("/mine", verifyToken, getMyCloths);
router.get("/suggestions", verifyToken, getSuggestions);

router.post("/", verifyToken, verifyRole(["partner", "styler"]), createCloth);
router.get("/:id", verifyToken, getClothById);
router.put("/:id", verifyToken, verifyRole(["admin", "partner", "styler"]), updateCloth);
router.delete("/:id", verifyToken, verifyRole(["admin", "partner", "styler"]), deleteCloth);

export default router;
