import express from "express";
import { 
  getAllClothes, 
  getClothesById, 
  createClothes, 
  updateClothes, 
  deleteClothes 
} from "../controllers/clothesController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/admin.js";

const router = express.Router();

// Public reads
router.get("/", getAllClothes);      
router.get("/:id", getClothesById);

// Create/Update/Delete protected
router.post("/", verifyToken, verifyRole(["partner", "styler"]), createClothes);
router.put("/:id", verifyToken, verifyRole(["partner", "styler"]), updateClothes);
router.delete("/:id", verifyToken, verifyRole(["admin", "partner", "styler"]), deleteClothes);

export default router;
