import express from "express";
import {
  getAllProductsController,
  getProductByIdController,
  searchProductsController,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProductsController);
router.get("/search", searchProductsController);
router.get("/:id", getProductByIdController);

export default router;
