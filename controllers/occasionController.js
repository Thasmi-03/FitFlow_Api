import "../models/user.js";
import { Occasion } from "../models/occasion.js";
import mongoose from "mongoose";

export const getAllOccasions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.user) filter.userId = req.query.user;
    if (req.query.type) filter.type = req.query.type;

    const total = await Occasion.countDocuments(filter);

    const occasions = await Occasion.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 })
      .populate("userId")
      .populate("clothesList");

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: occasions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOccasionById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const occasion = await Occasion.findById(req.params.id)
      .populate("userId")
      .populate("clothesList");

    if (!occasion) return res.status(404).json({ error: "Occasion not found" });

    res.status(200).json(occasion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createOccasion = async (req, res) => {
  try {
    const newOccasion = new Occasion(req.body);
    const saved = await newOccasion.save();
    const populated = await saved.populate("userId").populate("clothesList");

    res.status(201).json({ message: "Occasion created", occasion: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOccasion = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const updated = await Occasion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("userId").populate("clothesList");

    if (!updated) return res.status(404).json({ error: "Occasion not found" });

    res.status(200).json({ message: "Occasion updated", occasion: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOccasion = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const deleted = await Occasion.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ error: "Occasion not found" });

    res.status(200).json({ message: "Occasion deleted", occasion: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
