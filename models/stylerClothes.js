import mongoose from "mongoose";
import Styler from "./styler.js"; // Styler model
const { Schema } = mongoose;

const StylerClothesSchema = new Schema(
  {
    styler: {
      type: Schema.Types.ObjectId,
      ref: Styler,
      required: true,
      index: true,
    },
    images: {
      type: [String],
      required: true,
      validate: [arr => arr.length > 0, "At least one image is required"],
    },
    itemName: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["top", "bottom", "dress", "outerwear", "shoes", "accessory", "other"],
    },
    brand: { type: String },
    color: { type: [String], default: [] },
    material: { type: String },
    size: { type: String },
    season: {
      type: [String],
      enum: ["spring", "summer", "autumn", "winter", "all"],
      default: ["all"],
    },
    occasionTags: { type: [String], default: [] },
    purchasedAt: { type: Date },
    usageCount: { type: Number, default: 0 },
    wearable: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },

    // Private to the Styler
    visibility: { type: String, enum: ["private"], default: "private" },
  },
  { timestamps: true }
);

StylerClothesSchema.index({ styler: 1, category: 1 });

export const StylerClothes = mongoose.model("StylerClothes", StylerClothesSchema);
