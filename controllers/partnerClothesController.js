import mongoose from "mongoose";
import { PartnerCloth } from "../models/partnerClothes.js"; // ✅ correct model

// Helper: validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// -----------------------------
// Public: Get all public partner clothes
export const getPublicCloths = async (req, res) => {
  try {
    const clothes = await PartnerCloth.find({ visibility: "public" }).sort({ createdAt: -1 });
    res.status(200).json(clothes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch public clothes", error: error.message });
  }
};

// -----------------------------
// Partner: Get clothes owned by logged-in partner
export const getMyCloths = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const clothes = await PartnerCloth.find({ ownerId: userId }).sort({ createdAt: -1 });
    res.status(200).json(clothes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your clothes", error: error.message });
  }
};

// -----------------------------
// Get single cloth by ID
export const getClothById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid cloth ID" });

    const cloth = await PartnerCloth.findById(id);
    if (!cloth) return res.status(404).json({ message: "Cloth not found" });

    // Private clothes: only owner or admin can access
    if (cloth.visibility === "private") {
      const user = req.user;
      const isOwner = user && String(user._id) === String(cloth.ownerId);
      const isAdmin = user && user.role === "admin";
      if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json(cloth);
  } catch (error) {
    res.status(500).json({ message: "Failed to get cloth", error: error.message });
  }
};

// -----------------------------
// Create a new partner cloth
export const createCloth = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "partner") return res.status(403).json({ message: "Partner role required" });

    const { name, image, color, category, price, visibility } = req.body;
    if (!name || !image || !color || !category)
      return res.status(400).json({ message: "Missing required fields" });

    const cloth = new PartnerCloth({
      name,
      image,
      color,
      category,
      price: price || 0,
      ownerId: user._id,
      visibility: visibility || "private",
    });

    await cloth.save();
    res.status(201).json(cloth);
  } catch (error) {
    res.status(500).json({ message: "Failed to create cloth", error: error.message });
  }
};

// -----------------------------
// Update partner cloth
export const updateCloth = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid cloth ID" });

    const cloth = await PartnerCloth.findById(id);
    if (!cloth) return res.status(404).json({ message: "Cloth not found" });

    const user = req.user;
    const isOwner = user && String(user._id) === String(cloth.ownerId);
    const isAdmin = user && user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    const fields = ["name", "image", "color", "category", "price", "visibility"];
    fields.forEach(f => {
      if (req.body[f] !== undefined) cloth[f] = req.body[f];
    });

    await cloth.save();
    res.status(200).json(cloth);
  } catch (error) {
    res.status(500).json({ message: "Failed to update cloth", error: error.message });
  }
};

// -----------------------------
// Delete partner cloth
export const deleteCloth = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid cloth ID" });

    const cloth = await PartnerCloth.findById(id);
    if (!cloth) return res.status(404).json({ message: "Cloth not found" });

    const user = req.user;
    const isOwner = user && String(user._id) === String(cloth.ownerId);
    const isAdmin = user && user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    await cloth.deleteOne();
    res.status(200).json({ message: "Cloth deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete cloth", error: error.message });
  }
};

// -----------------------------
// Suggestions endpoint (optional)
export const getSuggestions = async (req, res) => {
  try {
    const { category, color, limit = 6 } = req.query;

    const filter = { visibility: "public" };
    if (category) filter.category = category;
    if (color) filter.color = color;

    const suggestions = await PartnerCloth.find(filter).limit(Number(limit));
    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch suggestions", error: error.message });
  }
};
