/**
 * Script to create an initial admin user
 * Run with: node scripts/seedAdmin.js
 * 
 * This creates an admin user that is automatically approved
 * so you can log in and approve other users
 */

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { User } from "../models/user.js";
import "../models/index.js";

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database");

    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin@123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log("Admin user already exists!");
      
      // Update existing admin to be approved
      if (!existingAdmin.isApproved) {
        existingAdmin.isApproved = true;
        await existingAdmin.save();
        console.log("✓ Admin user has been approved");
      } else {
        console.log("Admin user is already approved");
      }
      
      // Update password if needed
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log("✓ Admin password has been updated");
      
      process.exit(0);
    }

    // Create new admin user
    const admin = new User({
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      isApproved: true, // Auto-approve the first admin
    });

    await admin.save();
    console.log("✓ Admin user created successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("\nYou can now log in with these credentials.");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createAdmin();

