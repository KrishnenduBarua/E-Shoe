import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminApi } from "../utils/adminApi";
import Cookies from "js-cookie";

export const useAdminStore = create(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Login
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await adminApi.auth.login(email, password);
          const { admin, token } = response.data.data;
          Cookies.set("admin_token", token, { expires: 7 });
          set({ admin, isAuthenticated: true, loading: false });
          return true;
        } catch (error) {
          const message = error.response?.data?.message || "Login failed";
          set({ error: message, loading: false });
          return false;
        }
      },

      // Logout
      logout: async () => {
        try {
          await adminApi.auth.logout();
        } catch (error) {
          console.error("Logout error:", error);
        }
        Cookies.remove("admin_token");
        set({ admin: null, isAuthenticated: false });
      },

      // Load profile
      loadProfile: async () => {
        const token = Cookies.get("admin_token");
        if (!token) {
          set({ isAuthenticated: false, loading: false });
          return;
        }

        set({ loading: true });
        try {
          const response = await adminApi.auth.getProfile();
          const admin = response.data.data;
          set({ admin, isAuthenticated: true, loading: false });
        } catch (error) {
          Cookies.remove("admin_token");
          set({ admin: null, isAuthenticated: false, loading: false });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "admin-storage",
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
