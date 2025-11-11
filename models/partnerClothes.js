import mongoose from "mongoose";
const { Schema } = mongoose;

const PartnerClothSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true }, // URL or path
    color: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, default: 0 },

    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    visibility: { type: String, enum: ["public", "private"], default: "private" },
  },
  { timestamps: true }
);

// Index for faster queries by owner and category
PartnerClothSchema.index({ ownerId: 1, category: 1 });

export const PartnerCloth = mongoose.model("PartnerCloth", PartnerClothSchema);
