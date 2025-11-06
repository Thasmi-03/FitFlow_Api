import mongoose from "mongoose";
const { Schema } = mongoose;

const ClothesSchema = new Schema(
  {
    partner: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
  },
  { timestamps: true }
);

ClothesSchema.index({ owner: 1, category: 1 });

export const Clothes = mongoose.model("Clothes", ClothesSchema);
