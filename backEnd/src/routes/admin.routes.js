import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  getAllOrders,
  getOrderDetailsForAdmin,
  reviewPayment,
  updateOrderStatus,
  createCategoryByAdmin,
  updateCategoryByAdmin,
  deleteCategoryByAdmin,
  createProductByAdmin,
  updateProductByAdmin,
  deleteProductByAdmin,
  getAllProductsForAdmin,
  toggleProductStatusByAdmin,
} from "../controllers/admin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "..", "..", "uploads", "products");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const uploadProductImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("نوع الصورة غير مسموح"));
    }

    cb(null, true);
  },
});

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get("/orders", getAllOrders);
router.get("/orders/:orderId", getOrderDetailsForAdmin);
router.patch("/orders/:orderId/status", updateOrderStatus);
router.patch("/payments/:paymentId/review", reviewPayment);

router.post("/categories", createCategoryByAdmin);
router.put("/categories/:categoryId", updateCategoryByAdmin);
router.delete("/categories/:categoryId", deleteCategoryByAdmin);

router.get("/products", getAllProductsForAdmin);
router.post(
  "/products/upload-image",
  (req, res, next) => {
    uploadProductImage.single("image")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message || "فشل رفع الصورة",
        });
      }
      return next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع صورة",
      });
    }

    return res.status(201).json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      data: {
        image_url: `/uploads/products/${req.file.filename}`,
      },
    });
  },
);
router.post("/products", createProductByAdmin);
router.put("/products/:productId", updateProductByAdmin);
router.patch("/products/:productId/toggle-status", toggleProductStatusByAdmin);
router.delete("/products/:productId", deleteProductByAdmin);

export default router;
