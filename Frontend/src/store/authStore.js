import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { api } from "../utils/api";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      logout: async () => {
        try {
          await api.auth.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          Cookies.remove("auth_token");
          Cookies.remove("user_data");
          set({ user: null, isAuthenticated: false });
        }
      },

      updateUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for security
    },
  ),
);

export default useAuthStore;
