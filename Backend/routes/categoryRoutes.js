import express from "express";
import {
  getAllCategoriesController,
  getCategoryByIdController,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getAllCategoriesController);
router.get("/:id", getCategoryByIdController);

export default router;
