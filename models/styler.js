import mongoose from "mongoose";
const { Schema } = mongoose;

const StylerSchema = new Schema({
  name: { type: String, required: true, trim: true },                     
  bio: { type: String },                                                   
  gender: { type: String, enum: ["male", "female", "other"], default: "other" }, 
  age: { type: Number },                                                   
  country: { type: String },                                               
  skinTone: { type: String },                                              
  mood: { type: String },                                                  
  ratingAvg: { type: Number, min: 0, max: 5, default: 0 },                
  createdAt: { type: Date, default: Date.now }                             
});

export const Styler = mongoose.model("Styler", StylerSchema);
