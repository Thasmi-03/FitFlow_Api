import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/user.js";

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const email = "admin@gmail.com";
    const password = "admin@123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      email,
      password: hashedPassword,
      role: "admin",
      isApproved: true, // must be approved
    });

    await admin.save();
    console.log("Admin created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
