import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Generate unique key for cart item (product id + size)
      getItemKey: (item) => {
        return `${item.id}_${item.selectedSize || "default"}`;
      },

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const itemKey = get().getItemKey(product);
        const existingItem = items.find(
          (item) => get().getItemKey(item) === itemKey,
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              get().getItemKey(item) === itemKey
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity }] });
        }
      },

      removeItem: (productId, selectedSize) => {
        const itemKey = `${productId}_${selectedSize || "default"}`;
        set({
          items: get().items.filter(
            (item) => get().getItemKey(item) !== itemKey,
          ),
        });
      },

      updateQuantity: (productId, selectedSize, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedSize);
          return;
        }

        const itemKey = `${productId}_${selectedSize || "default"}`;
        set({
          items: get().items.map((item) =>
            get().getItemKey(item) === itemKey ? { ...item, quantity } : item,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useCartStore;
