import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment
} from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/admin.js";

const router = express.Router();

// Create payment: styler or partner
router.post("/", verifyToken, verifyRole(["styler", "partner"]), createPayment);

// Reads (admin can read all; others may be filtered in controller if needed)
router.get("/", verifyToken, verifyRole(["admin", "styler", "partner"]), getAllPayments);
router.get("/:id", verifyToken, verifyRole(["admin", "styler", "partner"]), getPaymentById);

// Update/Delete: allow admin, styler, partner (controller should enforce ownership)
router.put("/:id", verifyToken, verifyRole(["admin", "styler", "partner"]), updatePayment);
router.delete("/:id", verifyToken, verifyRole(["admin", "styler", "partner"]), deletePayment);

export default router;
