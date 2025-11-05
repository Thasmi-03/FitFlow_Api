import { Styler } from "../models/styler.js";

// Get all stylers
export const getAllStylers = async (req, res) => {
  try {
    const stylers = await Styler.find().populate("userRef").populate("presets.clothesRefs");
    res.status(200).json(stylers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single styler by ID
export const getStylerById = async (req, res) => {
  try {
    const styler = await Styler.findById(req.params.id)
      .populate("userRef")
      .populate("presets.clothesRefs");
    if (!styler) return res.status(404).json({ error: "Styler not found" });
    res.status(200).json(styler);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new styler
export const createStyler = async (req, res) => {
  try {
    const newStyler = new Styler(req.body);
    const saved = await newStyler.save();
    res.status(201).json({ message: "Styler created", styler: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a styler
export const updateStyler = async (req, res) => {
  try {
    const updated = await Styler.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Styler not found" });
    res.status(200).json({ message: "Styler updated", styler: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a styler
export const deleteStyler = async (req, res) => {
  try {
    const deleted = await Styler.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Styler not found" });
    res.status(200).json({ message: "Styler deleted", styler: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
