import mongoose from "mongoose";
const { Schema } = mongoose;

const WeatherSchema = new Schema({
  locationKey: { type: String, required: true, index: true },
  provider: { type: String, default: "openweathermap" },
  data: { type: Object },
  temperatureC: { type: Number },
  condition: { type: String },
  humidity: { type: Number },
  windSpeed: { type: Number },
  fetchedAt: { type: Date, default: Date.now, index: true },
  expiresAt: { type: Date }
});

WeatherSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const WeatherCache = mongoose.model("WeatherCache", WeatherSchema);
