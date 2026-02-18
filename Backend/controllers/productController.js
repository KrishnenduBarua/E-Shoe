import { pool } from "../config/database.js";

// Helper function to fix malformed Cloudinary URLs
const fixImageUrl = (url) => {
  if (!url) return url;

  const urlStr = String(url).trim();

  // Check if it's a Cloudinary URL
  if (urlStr.includes("cloudinary.com") || urlStr.includes("res.cloudinary")) {
    // Fix malformed protocols
    let fixed = urlStr
      .replace(/^https\/\//, "https://")
      .replace(/^http\/\//, "http://")
      .replace(/^\/\//, "https://");

    // Ensure it has a protocol
    if (!fixed.match(/^https?:\/\//)) {
      fixed = `https://${fixed}`;
    }

    return fixed;
  }

  return urlStr;
};

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getAllProductsController = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = "featured",
      minPrice,
      maxPrice,
      search,
    } = req.query;

    // Debug logging
    console.log("=== Product Search Debug ===");
    console.log("Query params:", req.query);
    console.log("Search term:", search);

    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*
      FROM products p
      WHERE p.is_active = TRUE
    `;
    const params = [];

    // Apply filters
    if (minPrice) {
      query += " AND p.price >= ?";
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += " AND p.price <= ?";
      params.push(parseFloat(maxPrice));
    }

    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        query += " ORDER BY p.price ASC";
        break;
      case "price-high":
        query += " ORDER BY p.price DESC";
        break;
      case "newest":
        query += " ORDER BY p.created_at DESC";
        break;
      case "rating":
        query += " ORDER BY p.rating DESC";
        break;
      case "featured":
      default:
        query += " ORDER BY p.is_featured DESC, p.created_at DESC";
        break;
    }

    // Pagination
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    // Debug: Log the final query and params
    console.log("Final SQL query:", query);
    console.log("Query params:", params);

    const [products] = await pool.query(query, params);

    // Parse JSON fields for each product
    products.forEach((product) => {
      if (product.sizes) {
        product.sizes = JSON.parse(product.sizes);
      }
      if (product.colors) {
        product.colors = JSON.parse(product.colors);
      }
      if (product.additional_images) {
        product.images = JSON.parse(product.additional_images);
        // Fix malformed URLs in images array
        product.images = product.images.map(fixImageUrl);
      }
      // Fix main image URL
      if (product.image_url) {
        product.image_url = fixImageUrl(product.image_url);
      }
      // Set main image if not already set
      if (!product.image && product.image_url) {
        product.image = product.image_url;
      }
    });

    // Get total count
    let countQuery =
      "SELECT COUNT(*) as total FROM products p WHERE p.is_active = TRUE";
    const countParams = [];

    if (minPrice) {
      countQuery += " AND p.price >= ?";
      countParams.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      countQuery += " AND p.price <= ?";
      countParams.push(parseFloat(maxPrice));
    }
    if (search) {
      countQuery +=
        " AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)";
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      `SELECT p.*
       FROM products p
       WHERE p.id = ? AND p.is_active = TRUE`,
      [id],
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = products[0];

    // Parse JSON fields
    if (product.sizes) {
      product.sizes = JSON.parse(product.sizes);
    }
    if (product.colors) {
      product.colors = JSON.parse(product.colors);
    }
    if (product.additional_images) {
      product.images = JSON.parse(product.additional_images);
      // Fix malformed URLs in images array
      product.images = product.images.map(fixImageUrl);
    }
    // Fix main image URL
    if (product.image_url) {
      product.image_url = fixImageUrl(product.image_url);
    }
    // Set main image if not already set
    if (!product.image && product.image_url) {
      product.image = product.image_url;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProductsController = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const offset = (page - 1) * limit;
    const searchTerm = `%${q}%`;

    const [products] = await pool.query(
      `SELECT p.*
       FROM products p
       WHERE p.is_active = TRUE 
       AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)
       ORDER BY p.is_featured DESC, p.created_at DESC
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, searchTerm, parseInt(limit), offset],
    );

    // Parse JSON fields for each product
    products.forEach((product) => {
      if (product.sizes) {
        product.sizes = JSON.parse(product.sizes);
      }
      if (product.colors) {
        product.colors = JSON.parse(product.colors);
      }
      if (product.additional_images) {
        product.images = JSON.parse(product.additional_images);
        // Fix malformed URLs in images array
        product.images = product.images.map(fixImageUrl);
      }
      // Fix main image URL
      if (product.image_url) {
        product.image_url = fixImageUrl(product.image_url);
      }
      // Set main image if not already set
      if (!product.image && product.image_url) {
        product.image = product.image_url;
      }
    });

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM products p
       WHERE p.is_active = TRUE 
       AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)`,
      [searchTerm, searchTerm, searchTerm],
    );
    const total = countResult[0].total;

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
