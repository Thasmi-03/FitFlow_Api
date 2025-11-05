import { WeatherCache } from "../models/weather.js";

// Get all weather cache entries
export const getAllWeathers = async (req, res) => {
  try {
    const weathers = await WeatherCache.find();
    res.status(200).json(weathers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get weather by ID
export const getWeatherById = async (req, res) => {
  try {
    const weather = await WeatherCache.findById(req.params.id);
    if (!weather) return res.status(404).json({ error: "Weather entry not found" });
    res.status(200).json(weather);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new weather cache entry
export const createWeather = async (req, res) => {
  try {
    const newWeather = new WeatherCache(req.body);
    const saved = await newWeather.save();
    res.status(201).json({ message: "Weather entry created", weather: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update weather entry
export const updateWeather = async (req, res) => {
  try {
    const updated = await WeatherCache.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Weather entry not found" });
    res.status(200).json({ message: "Weather entry updated", weather: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete weather entry
export const deleteWeather = async (req, res) => {
  try {
    const deleted = await WeatherCache.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Weather entry not found" });
    res.status(200).json({ message: "Weather entry deleted", weather: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
