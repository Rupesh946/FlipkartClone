import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Toggles product in/out of wishlist. Returns true if added, false if removed.
      toggleWishlist: (product) => {
        const exists = get().items.find((i) => i.id === product.id)
        set((state) => ({
          items: exists
            ? state.items.filter((i) => i.id !== product.id)
            : [...state.items, { ...product }],
        }))
        return !exists
      },

      removeFromWishlist: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),

      isWishlisted: (productId) =>
        get().items.some((i) => i.id === productId),

      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'flipkart-wishlist' }
  )
)

export default useWishlistStore
