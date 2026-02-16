import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  // Convert to string and trim any whitespace
  const path = String(imagePath).trim();

  // Check for cloudinary.com first (regardless of protocol)
  if (path.includes("cloudinary.com") || path.includes("res.cloudinary")) {
    // Fix malformed protocols
    let fixedUrl = path
      .replace(/^https\/\//, "https://") // Fix https//
      .replace(/^http\/\//, "http://") // Fix http//
      .replace(/^\/\//, "https://"); // Fix //

    // If still no protocol, add https://
    if (!fixedUrl.match(/^https?:\/\//)) {
      fixedUrl = `https://${fixedUrl}`;
    }

    return fixedUrl;
  }

  // If the path starts with protocol-relative URL (//), add https:
  if (path.startsWith("//")) {
    return `https:${path}`;
  }

  // If the path is already an absolute URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Otherwise, prepend the backend URL (local storage)
  const baseUrl = API_URL.replace("/api", "");
  return `${baseUrl}${path}`;
};

const apiClient = axios.create({
  baseURL: `${API_URL}/admin`,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If the data is FormData, let browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const adminApi = {
  // Auth
  auth: {
    login: (email, password) =>
      axios.post(
        `${API_URL}/admin/auth/login`,
        { email, password },
        { withCredentials: true },
      ),
    logout: () => apiClient.post("/auth/logout"),
    getProfile: () => apiClient.get("/auth/profile"),
    changePassword: (currentPassword, newPassword) =>
      apiClient.put("/auth/change-password", { currentPassword, newPassword }),
  },

  // Statistics
  stats: {
    getDashboard: () => apiClient.get("/stats"),
  },

  // Products
  products: {
    getAll: (params) => apiClient.get("/products", { params }),
    getById: (id) => apiClient.get(`/products/${id}`),
    create: (data) => apiClient.post("/products", data),
    update: (id, data) => apiClient.put(`/products/${id}`, data),
    delete: (id) => apiClient.delete(`/products/${id}`),
  },

  // Orders
  orders: {
    getAll: (params) => apiClient.get("/orders", { params }),
    getById: (id) => apiClient.get(`/orders/${id}`),
    confirm: (id, notes) => apiClient.put(`/orders/${id}/confirm`, { notes }),
    reject: (id, notes) => apiClient.put(`/orders/${id}/reject`, { notes }),
    updateStatus: (id, status, notes) =>
      apiClient.put(`/orders/${id}/status`, { status, notes }),
  },

  // Users
  users: {
    getAll: (params) => apiClient.get("/users", { params }),
    delete: (id) => apiClient.delete(`/users/${id}`),
  },
};

export default apiClient;
