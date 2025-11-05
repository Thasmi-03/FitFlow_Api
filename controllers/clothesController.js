import { Clothes } from "../models/clothes.js";

// Get all clothes
export const getAllClothes = async (req, res) => {
  try {
    const clothes = await Clothes.find();
    res.status(200).json(clothes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get clothes by ID
export const getClothesById = async (req, res) => {
  try {
    const clothes = await Clothes.findById(req.params.id);
    if (!clothes) return res.status(404).json({ error: "Clothes not found" });
    res.status(200).json(clothes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create clothes
export const createClothes = async (req, res) => {
  try {
    const newClothes = new Clothes(req.body);
    const saved = await newClothes.save();
    res.status(201).json({ message: "Clothes created", clothes: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update clothes
export const updateClothes = async (req, res) => {
  try {
    const updated = await Clothes.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Clothes not found" });
    res.status(200).json({ message: "Clothes updated", clothes: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete clothes
export const deleteClothes = async (req, res) => {
  try {
    const deleted = await Clothes.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Clothes not found" });
    res.status(200).json({ message: "Clothes deleted", clothes: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
