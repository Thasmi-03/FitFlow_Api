import { Payment } from "../models/payment.js"; 

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("user");
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("user");
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new payment
export const createPayment = async (req, res) => {
  try {
    const newPayment = new Payment(req.body);
    const saved = await newPayment.save();
    res.status(201).json({ message: "Payment created", payment: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a payment
export const updatePayment = async (req, res) => {
  try {
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Payment not found" });
    res.status(200).json({ message: "Payment updated", payment: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a payment
export const deletePayment = async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Payment not found" });
    res.status(200).json({ message: "Payment deleted", payment: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
