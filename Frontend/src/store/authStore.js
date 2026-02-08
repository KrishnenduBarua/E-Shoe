import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      logout: () => {
        Cookies.remove("auth_token");
        Cookies.remove("user_data");
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),
    }),
    {
      name: "auth-storage",
      getStorage: () => sessionStorage, // Use sessionStorage for security
    },
  ),
);

export default useAuthStore;
