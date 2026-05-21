import express from "express";
import {
  submitPaymentProof,
  getPaymentInstructions,
} from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/instructions/:provider", getPaymentInstructions);
router.post("/submit", protect, submitPaymentProof);

export default router;
