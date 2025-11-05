import express from "express";
import { 
  getAllClothes, 
  getClothesById, 
  createClothes, 
  updateClothes, 
  deleteClothes 
} from "../controllers/clothesController.js";

const router = express.Router();

router.get("/", getAllClothes);
router.get("/:id", getClothesById);
router.post("/", createClothes);
router.put("/:id", updateClothes);
router.delete("/:id", deleteClothes);

export default router;
