import mongoose from "mongoose";
const { Schema } = mongoose;

const StylerSchema = new Schema({
  userRef: { type: Schema.Types.ObjectId, ref: "User" },
  name: { type: String, trim: true },
  bio: { type: String },
  portfolioImages: [{ type: String }],
  ratingAvg: { type: Number, min: 0, max: 5, default: 0 },
  presets: [{
    title: { type: String },
    clothesRefs: [{ type: Schema.Types.ObjectId, ref: "Clothes" }],
    description: { type: String },
    suitableFor: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

StylerSchema.index({ userRef: 1 });

export const Styler = mongoose.model("Styler", StylerSchema);
