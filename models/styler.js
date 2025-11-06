import mongoose from "mongoose";
const { Schema } = mongoose;

const StylerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Link to User
  name: { type: String, required: true, trim: true },                     // Styler's name
  bio: { type: String },                                                   // Short bio
  gender: { type: String, enum: ["male", "female", "other"], default: "other" }, // Gender
  age: { type: Number },                                                   // Age
  country: { type: String },                                               // Country
  skinTone: { type: String },                                              // Skin tone
  mood: { type: String },                                                  // Mood/style preference
  ratingAvg: { type: Number, min: 0, max: 5, default: 0 },                // Average rating
  createdAt: { type: Date, default: Date.now }                             // Creation date
});

export const Styler = mongoose.model("Styler", StylerSchema);
