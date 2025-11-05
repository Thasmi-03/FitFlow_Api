import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  accountId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, trim: true },
  gender: { type: String, enum: ["male", "female", "other", "prefer_not_say"], default: "prefer_not_say" },
  dob: { type: Date },
  country: { type: String },
  timezone: { type: String },
  preferences: {
    style: { type: String },
    preferredColors: [{ type: String }],
    moodPreferences: [{ type: String }],
    skinTone: { type: String },
    receiveNotifications: { type: Boolean, default: true }
  },
  role: { type: String, enum: ["user", "stylist", "admin", "partner"], default: "user" },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  wardrobeComplete: { type: Boolean, default: false }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

UserSchema.virtual("displayName").get(function() { return this.name; });

export const User = mongoose.model("User", UserSchema);
