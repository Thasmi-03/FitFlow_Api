import mongoose from "mongoose";
const { Schema } = mongoose;

const ClothesSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  images: [{ type: String, required: true }],
  itemName: { type: String, trim: true },
  category: { type: String, required: true, enum: ["top", "bottom", "dress", "outerwear", "shoes", "accessory", "other"] },
  subCategory: { type: String },
  brand: { type: String },
  color: [{ type: String }],
  material: { type: String },
  size: { type: String },
  season: [{ type: String, enum: ["spring", "summer", "autumn", "winter", "all"] }],
  occasionTags: [{ type: String }],
  purchasedAt: { type: Date },
  usageCount: { type: Number, default: 0 },
  lastWornAt: { type: Date },
  wearable: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

ClothesSchema.index({ owner: 1, category: 1 });

export const Clothes = mongoose.model("Clothes", ClothesSchema);
