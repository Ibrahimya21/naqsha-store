import express from "express";
import {
  getStoreSettings,
  updateStoreSettings,
} from "../controllers/settings.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get("/", getStoreSettings);
router.patch("/", updateStoreSettings);

export default router;
