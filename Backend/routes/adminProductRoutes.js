import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} from "../controllers/adminProductController.js";
import { protectAdmin } from "../middleware/adminAuth.js";
import { uploadProductImages } from "../middleware/cloudinary.js";

const router = express.Router();

// All routes are protected
router.use(protectAdmin);

// Product routes
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.post("/products", uploadProductImages, createProduct);
router.put("/products/:id", uploadProductImages, updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
