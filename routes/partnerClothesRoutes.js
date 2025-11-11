// server/Api/routes/partnerClothesRoutes.js
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
} from "../controllers/partnerClothesController.js";



const router = express.Router();

// Public route: list all public partner clothes
router.get("/public", getPublicCloths);

// Authenticated routes: require login
router.get("/mine", verifyToken, getMyCloths);
router.get("/suggestions", verifyToken, getSuggestions);

// CRUD routes for partners (create/update/delete)
router.post("/", verifyToken, verifyRole(["partner"]), createCloth);
router.get("/:id", verifyToken, getClothById);
router.put("/:id", verifyToken, verifyRole(["partner", "admin"]), updateCloth);
router.delete("/:id", verifyToken, verifyRole(["partner", "admin"]), deleteCloth);

export default router;
