import express from "express";
import {
  getWishlistController,
  addToWishlistController,
  removeFromWishlistController,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

router.get("/", getWishlistController);
router.post("/add", addToWishlistController);
router.delete("/:productId", removeFromWishlistController);

export default router;
