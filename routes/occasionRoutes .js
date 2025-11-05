import express from "express";
import {
  createOccasion,
  getAllOccasions,
  getOccasionById,
  updateOccasion,
  deleteOccasion
} from "../controllers/occasionController.js";

const router = express.Router();

router.post("/", createOccasion);
router.get("/", getAllOccasions);
router.get("/:id", getOccasionById);
router.put("/:id", updateOccasion);
router.delete("/:id", deleteOccasion);

export default router;
