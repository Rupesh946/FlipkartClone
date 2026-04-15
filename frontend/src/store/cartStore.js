import { create } from 'zustand'
import api from '../api/axios'

const useCartStore = create((set, get) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,
  loading: false,
  error: null,

  fetchCart: async () => {
    try {
      set({ loading: true, error: null })
      const { data } = await api.get('/cart')
      set({
        items: data.items,
        itemCount: data.itemCount,
        subtotal: data.subtotal,
        loading: false,
      })
    } catch (err) {
      set({ loading: false, error: err.message })
    }
  },

  addToCart: async (productId, quantity = 1) => {
    await api.post('/cart', { product_id: productId, quantity })
    await get().fetchCart()
  },

  updateQuantity: async (productId, quantity) => {
    await api.put(`/cart/${productId}`, { quantity })
    await get().fetchCart()
  },

  removeFromCart: async (productId) => {
    await api.delete(`/cart/${productId}`)
    await get().fetchCart()
  },

  clearCart: async () => {
    await api.delete('/cart')
    set({ items: [], itemCount: 0, subtotal: 0 })
  },
}))

export default useCartStore
