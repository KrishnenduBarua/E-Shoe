import axios from "axios";
import Cookies from "js-cookie";
import { apiRateLimiter } from "./security";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Check rate limiting
    if (!apiRateLimiter.canMakeRequest()) {
      return Promise.reject(
        new Error("Too many requests. Please try again later."),
      );
    }

    // Add auth token from cookies
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token
    const csrfToken = Cookies.get("csrf_token");
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    // Add request timestamp for replay attack prevention
    config.headers["X-Request-Time"] = Date.now().toString();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth data
          Cookies.remove("auth_token");
          Cookies.remove("user_data");
          window.location.href = "/login";
          break;
        case 403:
          // Forbidden
          console.error("Access forbidden");
          break;
        case 429:
          // Too many requests
          console.error("Rate limit exceeded");
          break;
        case 500:
          // Server error
          console.error("Server error occurred");
          break;
        default:
          break;
      }
    }

    return Promise.reject(error);
  },
);

// API methods
export const api = {
  // Auth endpoints
  auth: {
    sendOTP: (phoneNumber) => apiClient.post("/auth/send-otp", { phoneNumber }),
    verifyOTP: (phoneNumber, otp) =>
      apiClient.post("/auth/verify-otp", { phoneNumber, otp }),
    logout: () => apiClient.post("/auth/logout"),
    getProfile: () => apiClient.get("/auth/profile"),
    updateProfile: (data) => apiClient.put("/auth/profile", data),
  },

  // Product endpoints
  products: {
    getAll: (params) => apiClient.get("/products", { params }),
    getById: (id) => apiClient.get(`/products/${id}`),
    getByCategory: (category, params) =>
      apiClient.get(`/products/category/${category}`, { params }),
    search: (query) =>
      apiClient.get("/products/search", { params: { q: query } }),
  },

  // Category endpoints
  categories: {
    getAll: () => apiClient.get("/categories"),
    getById: (id) => apiClient.get(`/categories/${id}`),
  },

  // Cart endpoints
  cart: {
    get: () => apiClient.get("/cart"),
    add: (productId, quantity) =>
      apiClient.post("/cart/add", { productId, quantity }),
    update: (itemId, quantity) =>
      apiClient.put(`/cart/${itemId}`, { quantity }),
    remove: (itemId) => apiClient.delete(`/cart/${itemId}`),
    clear: () => apiClient.delete("/cart"),
  },

  // Order endpoints
  orders: {
    create: (orderData) => apiClient.post("/orders", orderData),
    getAll: () => apiClient.get("/orders"),
    getById: (id) => apiClient.get(`/orders/${id}`),
    cancel: (id) => apiClient.post(`/orders/${id}/cancel`),
  },

  // Wishlist endpoints
  wishlist: {
    get: () => apiClient.get("/wishlist"),
    add: (productId) => apiClient.post("/wishlist/add", { productId }),
    remove: (productId) => apiClient.delete(`/wishlist/${productId}`),
  },
};

export default apiClient;
