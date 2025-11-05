import { Occasion } from "../models/occasion.js"; 

// Get all occasions
export const getAllOccasions = async (req, res) => {
  try {
    const occasions = await Occasion.find().populate("user").populate("suggestedOutfits").populate("clothesList");
    res.status(200).json(occasions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get occasion by ID
export const getOccasionById = async (req, res) => {
  try {
    const occasion = await Occasion.findById(req.params.id)
      .populate("user")
      .populate("suggestedOutfits")
      .populate("clothesList");
    if (!occasion) return res.status(404).json({ error: "Occasion not found" });
    res.status(200).json(occasion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new occasion
export const createOccasion = async (req, res) => {
  try {
    const newOccasion = new Occasion(req.body);
    const saved = await newOccasion.save();
    res.status(201).json({ message: "Occasion created", occasion: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update occasion
export const updateOccasion = async (req, res) => {
  try {
    const updated = await Occasion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Occasion not found" });
    res.status(200).json({ message: "Occasion updated", occasion: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete occasion
export const deleteOccasion = async (req, res) => {
  try {
    const deleted = await Occasion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Occasion not found" });
    res.status(200).json({ message: "Occasion deleted", occasion: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
