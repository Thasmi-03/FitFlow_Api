import express from "express";
import {
  createWeather,
  getAllWeathers,
  getWeatherById,
  updateWeather,
  deleteWeather
} from "../controllers/weatherController.js";

const router = express.Router();

router.post("/", createWeather);
router.get("/", getAllWeathers);
router.get("/:id", getWeatherById);
router.put("/:id", updateWeather);
router.delete("/:id", deleteWeather);

export default router;
