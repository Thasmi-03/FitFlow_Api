import mongoose from "mongoose";
import { StylerClothes } from "../models/stylerClothes.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getMyStylerClothes = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized to access this resource." });
    }

    const clothes = await StylerClothes.find({
      ownerType: "styler",
      ownerId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(clothes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStylerClothById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const cloth = await StylerClothes.findById(id);

    if (!cloth) {
      return res.status(404).json({ error: "Cloth not found." });
    }

    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized to access this resource." });
    }

    const isOwner = String(cloth.ownerId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Unauthorized to access this resource." });
    }

    res.status(200).json(cloth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createStylerCloth = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized to access this resource." });
    }

    if (req.user.role !== "styler") {
      return res
        .status(403)
        .json({ error: "Access denied. Styler role required." });
    }

    const { name, color, category, price } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Missing required field: name." });
    }

    if (!color) {
      return res.status(400).json({ error: "Missing required field: color." });
    }
    if (!category) {
      return res
        .status(400)
        .json({ error: "Missing required field: category." });
    }

    const cloth = new StylerClothes({
      name,
      color,
      category,
      price: price || 0,
      ownerType: "styler",
      ownerId: req.user._id,
      visibility: "private",
    });

    const saved = await cloth.save();
    res.status(201).json({ message: "Cloth created", cloth: saved });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => {
        const message = e.message;
        if (message.includes("is required")) {
          return message.replace(/Path `(.+)` is required\./, "$1 is required");
        }
        return message;
      });
      return res.status(400).json({ error: errors.join(", ") });
    }
    res.status(500).json({ error: error.message });
  }
};

export const updateStylerCloth = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const cloth = await StylerClothes.findById(id);

    if (!cloth) {
      return res.status(404).json({ error: "Cloth not found." });
    }

    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized to access this resource." });
    }

    const isOwner = String(cloth.ownerId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Unauthorized to access this resource." });
    }

    const updated = await StylerClothes.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Cloth updated", cloth: updated });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => {
        const message = e.message;
        if (message.includes("is required")) {
          return message.replace(/Path `(.+)` is required\./, "$1 is required");
        }
        return message;
      });
      return res.status(400).json({ error: errors.join(", ") });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteStylerCloth = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const cloth = await StylerClothes.findById(id);

    if (!cloth) {
      return res.status(404).json({ error: "Cloth not found." });
    }

    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized to access this resource." });
    }

    const isOwner = String(cloth.ownerId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Unauthorized to access this resource." });
    }

    await StylerClothes.findByIdAndDelete(id);
    res.status(200).json({ message: "Cloth deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public route to get all styler clothes with all fields
export const getAllStylerClothesPublic = async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1;
    
    const clothes = await StylerClothes.find({})
      .sort({ createdAt: -1 })
      .populate("ownerId", "-password")
      .lean();
    
    // Always return JSON for API requests
    res.status(200).json({
      total: clothes.length,
      data: clothes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};