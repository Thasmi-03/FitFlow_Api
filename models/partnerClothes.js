import mongoose from "mongoose";
const { Schema } = mongoose;

const PartnerClothSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    color: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, default: 0 },
    ownerType: { type: String, enum: ["partner"], default: "partner" },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    visibility: { type: String, enum: ["public"], default: "public" },
  },
  { timestamps: true }
);

PartnerClothSchema.index({ ownerId: 1, category: 1 });

export const PartnerCloth = mongoose.model("PartnerCloth", PartnerClothSchema);
