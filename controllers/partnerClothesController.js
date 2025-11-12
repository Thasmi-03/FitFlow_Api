import mongoose from "mongoose";
import { PartnerCloth } from "../models/partnerClothes.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getPublicCloths = async (req, res) => {
  try {
    const clothes = await PartnerCloth.find({
      visibility: "public",
      ownerType: "partner",
    }).sort({ createdAt: -1 });

    res.status(200).json(clothes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyCloths = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized to access this resource." });
    }

    const clothes = await PartnerCloth.find({
      ownerId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(clothes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClothById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const cloth = await PartnerCloth.findById(id);

    if (!cloth) {
      return res.status(404).json({ error: "Cloth not found." });
    }

    if (cloth.visibility === "private") {
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
    }

    res.status(200).json(cloth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCloth = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized to access this resource." });
    }

    if (req.user.role !== "partner") {
      return res
        .status(403)
        .json({ error: "Access denied. Partner role required." });
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

    const cloth = new PartnerCloth({
      name,

      color,
      category,
      price: price || 0,
      ownerType: "partner",
      ownerId: req.user._id,
      visibility: "public",
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

export const updateCloth = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const cloth = await PartnerCloth.findById(id);

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

    const updated = await PartnerCloth.findByIdAndUpdate(id, req.body, {
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

export const deleteCloth = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const cloth = await PartnerCloth.findById(id);

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

    await PartnerCloth.findByIdAndDelete(id);
    res.status(200).json({ message: "Cloth deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestions = async (req, res) => {
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

    const { category, color, limit = 10 } = req.query;

    const filter = {
      visibility: "public",
      ownerType: "partner",
    };

    if (category) filter.category = category;
    if (color) filter.color = { $regex: color, $options: "i" };

    const suggestions = await PartnerCloth.find(filter)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
