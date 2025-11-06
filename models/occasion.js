import mongoose from "mongoose";
const { Schema } = mongoose;

const OccasionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    enum: ["wedding", "party", "meeting", "casual", "formal", "festival", "other"], 
    default: "other" 
  },
  location: {
    venue: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number }
  },
  date: { type: Date, required: true },
  startTime: { type: String },
  endTime: { type: String },
  dressCode: { type: String, trim: true },
  clothesList: [{ type: Schema.Types.ObjectId, ref: "Clothes" }],
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

OccasionSchema.index({ user: 1, date: 1, type: 1 });

export const Occasion = mongoose.model("Occasion", OccasionSchema);
