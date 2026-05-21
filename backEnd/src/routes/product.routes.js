import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  getProductsStats,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/stats", getProductsStats);
router.get("/:id", getProductById);
router.post("/", createProduct);

export default router;
