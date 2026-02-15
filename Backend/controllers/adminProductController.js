import { pool } from "../config/database.js";
import { deleteUploadedFiles, getImageUrl } from "../middleware/cloudinary.js";

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private (Admin)
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      categoryId,
      brand,
      sizes,
      colors,
      stock,
      isFeatured,
      is_active,
    } = req.body;

    if (!name || !price) {
      // Delete uploaded files if validation fails
      if (req.files) deleteUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Name and price are required",
      });
    }

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => getImageUrl(file));
    }

    // Parse sizes and colors if they're strings
    const parsedSizes =
      typeof sizes === "string"
        ? sizes.split(",").map((s) => s.trim())
        : sizes || [];
    const parsedColors =
      typeof colors === "string"
        ? colors.split(",").map((c) => c.trim())
        : colors || [];

    // Generate slug if not provided
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Insert product
    const [result] = await pool.query(
      `INSERT INTO products (
        name, slug, description, price, original_price, category_id, brand,
        sizes, colors, image_url, additional_images, stock_quantity, is_featured, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        productSlug,
        description || null,
        price,
        originalPrice || price,
        categoryId || null,
        brand || null,
        JSON.stringify(parsedSizes),
        JSON.stringify(parsedColors),
        imageUrls[0] || null,
        JSON.stringify(imageUrls),
        stock || 0,
        isFeatured ? 1 : 0,
        is_active !== undefined
          ? is_active === "true" || is_active === true
            ? 1
            : 0
          : 1,
      ],
    );

    // Log activity
    await pool.query(
      "INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        req.admin.id,
        "create",
        "product",
        result.insertId,
        `Created product: ${name}`,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        productId: result.insertId,
        images: imageUrls,
      },
    });
  } catch (error) {
    // Delete uploaded files if there's an error
    if (req.files) deleteUploadedFiles(req.files);
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin)
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      categoryId,
      brand,
      sizes,
      colors,
      stock,
      isFeatured,
      is_active,
      keepExistingImages,
    } = req.body;

    // Check if product exists
    const [products] = await pool.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);

    if (products.length === 0) {
      // Delete uploaded files if product not found
      if (req.files) deleteUploadedFiles(req.files);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => getImageUrl(file));
    }

    // If keepExistingImages is true and new images uploaded, merge them
    if (keepExistingImages === "true" && imageUrls.length > 0) {
      const existingImages = JSON.parse(products[0].additional_images || "[]");
      imageUrls = [...existingImages, ...imageUrls];
    }

    // Parse sizes and colors if they're strings
    const parsedSizes =
      sizes && typeof sizes === "string"
        ? sizes.split(",").map((s) => s.trim())
        : sizes || null;
    const parsedColors =
      colors && typeof colors === "string"
        ? colors.split(",").map((c) => c.trim())
        : colors || null;

    // Update product
    await pool.query(
      `UPDATE products SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        original_price = COALESCE(?, original_price),
        category_id = COALESCE(?, category_id),
        brand = COALESCE(?, brand),
        sizes = COALESCE(?, sizes),
        colors = COALESCE(?, colors),
        image_url = COALESCE(?, image_url),
        additional_images = COALESCE(?, additional_images),
        stock_quantity = COALESCE(?, stock_quantity),
        is_featured = COALESCE(?, is_featured),
        is_active = COALESCE(?, is_active)
      WHERE id = ?`,
      [
        name,
        slug,
        description,
        price,
        originalPrice,
        categoryId,
        brand,
        parsedSizes ? JSON.stringify(parsedSizes) : null,
        parsedColors ? JSON.stringify(parsedColors) : null,
        imageUrls.length > 0 ? imageUrls[0] : null,
        imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
        stock,
        isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
        is_active !== undefined
          ? is_active === "true" || is_active === true
            ? 1
            : 0
          : null,
        id,
      ],
    );

    // Log activity
    await pool.query(
      "INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        req.admin.id,
        "update",
        "product",
        id,
        `Updated product: ${name || products[0].name}`,
      ],
    );

    res.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/admin/products/:id
// @access  Private (Admin)
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);

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
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const [products] = await pool.query(
      "SELECT name FROM products WHERE id = ?",
      [id],
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete product
    await pool.query("DELETE FROM products WHERE id = ?", [id]);

    // Log activity
    await pool.query(
      "INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        req.admin.id,
        "delete",
        "product",
        id,
        `Deleted product: ${products[0].name}`,
      ],
    );

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products with pagination
// @route   GET /api/admin/products
// @access  Private (Admin)
export const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let query = `
      SELECT p.*
      FROM products p
    `;

    const params = [];

    if (search) {
      query += " WHERE p.name LIKE ? OR p.description LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

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
      }
    });

    // Get total count
    const countQuery = search
      ? "SELECT COUNT(*) as total FROM products WHERE name LIKE ? OR description LIKE ?"
      : "SELECT COUNT(*) as total FROM products";
    const countParams = search ? [`%${search}%`, `%${search}%`] : [];
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
