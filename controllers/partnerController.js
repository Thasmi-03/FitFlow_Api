import { Partner } from "../models/partner.js"; 

// Get all partners
export const getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find();
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get partner by ID
export const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });
    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new partner
export const createPartner = async (req, res) => {
  try {
    const newPartner = new Partner(req.body);
    const saved = await newPartner.save();
    res.status(201).json({ message: "Partner created", partner: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update partner
export const updatePartner = async (req, res) => {
  try {
    const updated = await Partner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Partner not found" });
    res.status(200).json({ message: "Partner updated", partner: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete partner
export const deletePartner = async (req, res) => {
  try {
    const deleted = await Partner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Partner not found" });
    res.status(200).json({ message: "Partner deleted", partner: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
