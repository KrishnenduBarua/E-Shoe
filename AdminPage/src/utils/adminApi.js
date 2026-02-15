import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
