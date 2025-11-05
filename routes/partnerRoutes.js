import express from "express";
import {
  createPartner,
  getAllPartners,
  getPartnerById,
  updatePartner,
  deletePartner
} from "../controllers/partnerController.js";

const router = express.Router();

router.post("/", createPartner);
router.get("/", getAllPartners);
router.get("/:id", getPartnerById);
router.put("/:id", updatePartner);
router.delete("/:id", deletePartner);

export default router;
