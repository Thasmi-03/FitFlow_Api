import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ["user", "stylist", "admin", "partner"], 
    default: "user" 
  }
}, { 
  timestamps: true 
});

UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

UserSchema.set("toJSON", { virtuals: true });

export const User = mongoose.model("User", UserSchema);
