import { pool } from "../config/database.js";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategoriesController = async (req, res, next) => {
  try {
    const [categories] = await pool.query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
       WHERE c.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.display_order ASC, c.name ASC`,
    );

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [categories] = await pool.query(
      "SELECT * FROM categories WHERE id = ? AND is_active = TRUE",
      [id],
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: categories[0],
    });
  } catch (error) {
    next(error);
  }
};
