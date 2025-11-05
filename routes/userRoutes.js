import express from "express";
import {
  createClothes,
  getAllClothes,
  getClothesById,
  updateClothes,
  deleteClothes
} from "../controllers/clothesController.js";

const router = express.Router();

router.post("/", createClothes);
router.get("/", getAllClothes);
router.get("/:id", getClothesById);
router.put("/:id", updateClothes);
router.delete("/:id", deleteClothes);

export default router;
