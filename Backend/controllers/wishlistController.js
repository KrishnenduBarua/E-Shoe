import { pool } from "../config/database.js";

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlistController = async (req, res, next) => {
  try {
    const [wishlistItems] = await pool.query(
      `SELECT w.*, p.*
       FROM wishlist w
       INNER JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ? AND p.is_active = TRUE
       ORDER BY w.created_at DESC`,
      [req.user.id],
    );

    res.json({
      success: true,
      data: wishlistItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to wishlist
// @route   POST /api/wishlist/add
// @access  Private
export const addToWishlistController = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists
    const [products] = await pool.query(
      "SELECT id FROM products WHERE id = ? AND is_active = TRUE",
      [productId],
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if already in wishlist
    const [existing] = await pool.query(
      "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
      [req.user.id, productId],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Add to wishlist
    await pool.query(
      "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
      [req.user.id, productId],
    );

    res.json({
      success: true,
      message: "Item added to wishlist",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlistController = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const [result] = await pool.query(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      [req.user.id, productId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found in wishlist",
      });
    }

    res.json({
      success: true,
      message: "Item removed from wishlist",
    });
  } catch (error) {
    next(error);
  }
};
