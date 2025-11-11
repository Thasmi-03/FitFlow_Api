import { PartnerCloth } from "../models/partnerClothes.js";
import mongoose from "mongoose";

// Helper to check ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// -----------------------------
// Public: get all public styler clothes
export const getPublicStylerClothes = async (req, res) => {
  try {
    const clothes = await Cloth.find({ ownerType: "styler", visibility: "public" }).sort({ createdAt: -1 });
    res.status(200).json(clothes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch public styler clothes", error: err.message });
  }
};

// -----------------------------
// Styler: get logged-in styler's clothes
export const getMyStylerClothes = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const clothes = await PartnerCloth.find({ ownerType: "styler", ownerId: userId }).sort({ createdAt: -1 });
    res.status(200).json(clothes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your clothes", error: err.message });
  }
};

// -----------------------------
// Get a single styler cloth by ID
export const getStylerClothById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid cloth ID" });

    const cloth = await Cloth.findById(id);
    if (!cloth) return res.status(404).json({ message: "Cloth not found" });

    // Only allow owner or admin to see private items
    if (cloth.visibility === "private") {
      const user = req.user;
      const isOwner = user && String(user._id) === String(cloth.ownerId);
      const isAdmin = user && user.role === "admin";
      if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json(cloth);
  } catch (err) {
    res.status(500).json({ message: "Failed to get cloth", error: err.message });
  }
};

// -----------------------------
// Create new styler cloth
export const createStylerCloth = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "styler") return res.status(403).json({ message: "Styler role required" });

    const { name, image, color, category, price, visibility } = req.body;
    if (!name || !image || !color || !category)
      return res.status(400).json({ message: "Missing required fields" });

    const cloth = new Cloth({
      name,
      image,
      color,
      category,
      price: price || 0,
      ownerType: "styler",
      ownerId: user._id,
      visibility: visibility || "private",
    });

    await cloth.save();
    res.status(201).json(cloth);
  } catch (err) {
    res.status(500).json({ message: "Failed to create cloth", error: err.message });
  }
};

// -----------------------------
// Update styler cloth
export const updateStylerCloth = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid cloth ID" });

    const cloth = await Cloth.findById(id);
    if (!cloth) return res.status(404).json({ message: "Cloth not found" });

    const user = req.user;
    const isOwner = user && String(user._id) === String(cloth.ownerId);
    const isAdmin = user && user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    const fields = ["name", "image", "color", "category", "price", "visibility"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) cloth[f] = req.body[f];
    });

    await cloth.save();
    res.status(200).json(cloth);
  } catch (err) {
    res.status(500).json({ message: "Failed to update cloth", error: err.message });
  }
};

// -----------------------------
// Delete styler cloth
export const deleteStylerCloth = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid cloth ID" });

    const cloth = await Cloth.findById(id);
    if (!cloth) return res.status(404).json({ message: "Cloth not found" });

    const user = req.user;
    const isOwner = user && String(user._id) === String(cloth.ownerId);
    const isAdmin = user && user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    await cloth.deleteOne();
    res.status(200).json({ message: "Cloth deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete cloth", error: err.message });
  }
};
