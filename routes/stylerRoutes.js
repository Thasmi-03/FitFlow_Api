import express from "express";
import {
  createStyler,
  getAllStylers,
  getStylerById,
  updateStyler,
  deleteStyler
} from "../controllers/stylerController.js";

const router = express.Router();

router.post("/", createStyler);
router.get("/", getAllStylers);
router.get("/:id", getStylerById);
router.put("/:id", updateStyler);
router.delete("/:id", deleteStyler);

export default router;
