import mongoose from "mongoose";
const { Schema } = mongoose;

const ClothSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true }, // URL or path
    color: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, default: 0 },

    ownerType: { type: String, enum: ["partner", "styler"], required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    visibility: { type: String, enum: ["public", "private"], required: true },
  },
  { timestamps: true }
);

ClothSchema.index({ ownerType: 1, ownerId: 1, category: 1 });

export const Cloth = mongoose.model("Cloth", ClothSchema);
