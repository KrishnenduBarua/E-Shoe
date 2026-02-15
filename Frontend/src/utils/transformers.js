// Helper function to safely parse JSON or return if already parsed
const safeJSONParse = (data, fallback = []) => {
  if (!data) return fallback;
  if (typeof data === "object") return data; // Already parsed
  try {
    return JSON.parse(data);
  } catch (e) {
    console.warn("JSON parse error:", e);
    return fallback;
  }
};

// Transform backend product data to match frontend expectations
export const transformProduct = (product) => {
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: parseFloat(product.price),
    originalPrice: product.original_price
      ? parseFloat(product.original_price)
      : null,
    image: product.image_url,
    images:
      product.images ||
      safeJSONParse(product.additional_images, [product.image_url]),
    brand: product.brand,
    sizes: safeJSONParse(product.sizes, []),
    colors: safeJSONParse(product.colors, []),
    stock: product.stock_quantity || 0,
    inStock: product.stock_quantity > 0,
    rating: parseFloat(product.rating) || 0,
    reviewCount: product.review_count || 0,
    featured: product.is_featured,
    category: product.category_name,
    categorySlug: product.category_slug,
  };
};

// Transform backend category data
export const transformCategory = (category) => {
  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image_url,
    productCount: category.product_count || 0,
  };
};

// Transform backend order data
export const transformOrder = (order) => {
  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    subtotal: parseFloat(order.subtotal),
    shipping: parseFloat(order.shipping_cost),
    tax: parseFloat(order.tax),
    total: parseFloat(order.total),
    items: order.items || [],
    shippingInfo: {
      name: order.shipping_name,
      phone: order.shipping_phone,
      email: order.shipping_email,
      address: order.shipping_address,
      city: order.shipping_city,
      state: order.shipping_state,
      zip: order.shipping_zip,
      country: order.shipping_country,
    },
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    createdAt: order.created_at,
  };
};
