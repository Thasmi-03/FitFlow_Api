import { Payment } from "../models/payment.js";
import mongoose from "mongoose";

export const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.user) filter.userId = req.query.user;
    if (req.query.status) filter.status = req.query.status;

    const total = await Payment.countDocuments(filter);

    const payments = await Payment.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("userId");

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const payment = await Payment.findById(req.params.id).populate("userId");

    if (!payment) return res.status(404).json({ error: "Payment not found" });

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new payment
export const createPayment = async (req, res) => {
  try {
    const newPayment = new Payment(req.body);
    const savedPayment = await newPayment.save();
    const populatedPayment = await savedPayment.populate("userId");

    res.status(201).json({ message: "Payment created", payment: populatedPayment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update payment by ID
export const updatePayment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("userId");

    if (!updatedPayment) return res.status(404).json({ error: "Payment not found" });

    res.status(200).json({ message: "Payment updated", payment: updatedPayment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete payment by ID
export const deletePayment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);

    if (!deletedPayment) return res.status(404).json({ error: "Payment not found" });

    res.status(200).json({ message: "Payment deleted", payment: deletedPayment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
