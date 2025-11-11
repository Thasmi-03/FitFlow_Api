import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Partner from "../models/partner.js";
import { Clothes } from "../models/cloth.js";

// Helper: generate JWT token
const generateToken = (partner) => {
  return jwt.sign(
    { _id: partner._id, role: "partner" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Register a new partner (pending admin approval)
export const registerPartner = async (req, res) => {
  try {
    const { name, email, password, shopLink } = req.body;

    if (!name || !email || !password || !shopLink) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existing = await Partner.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const partner = new Partner({
      name,
      email,
      password: hashedPassword,
      shopLink,
      isApproved: false, // must be approved by admin
    });

    await partner.save();
    return res.status(201).json({ message: "Partner registered. Waiting for admin approval." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Login partner (only after admin approval)
export const loginPartner = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password." });

    const partner = await Partner.findOne({ email });
    if (!partner) return res.status(404).json({ error: "Partner not found." });

    if (!partner.isApproved) {
      return res.status(403).json({ error: "Partner not approved by admin yet." });
    }

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials." });

    const token = generateToken(partner);
    return res.status(200).json({ message: "Login successful", token, partner });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Partner adds cloth
export const addCloth = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "partner") {
      return res.status(403).json({ error: "Access denied. Partner role required." });
    }

    const { name, image, color, category, price } = req.body;

    if (!name) return res.status(400).json({ error: "Missing required field: name." });
    if (!image) return res.status(400).json({ error: "Missing required field: image." });
    if (!color) return res.status(400).json({ error: "Missing required field: color." });
    if (!category) return res.status(400).json({ error: "Missing required field: category." });

    const cloth = new Clothes({
      name,
      image,
      color,
      category,
      price: price || 0,
      ownerType: "partner",
      ownerId: req.user._id,
      visibility: "public",
    });

    const saved = await cloth.save();
    return res.status(201).json({ message: "Cloth added successfully", cloth: saved });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all approved partners (public route)
export const getAllPartners = async (_req, res) => {
  try {
    const partners = await Partner.find({ isApproved: true }).select("-password").sort({ createdAt: -1 });
    return res.status(200).json(partners);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Admin can approve partner
export const approvePartner = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID format." });

    const partner = await Partner.findById(id);
    if (!partner) return res.status(404).json({ error: "Partner not found." });

    partner.isApproved = true;
    await partner.save();

    return res.status(200).json({ message: "Partner approved successfully", partner });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
