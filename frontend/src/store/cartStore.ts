import { create } from 'zustand';
import api from '../services/api';

export interface CartItem {
  id: string;
  quantity: number;
  productId: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    discount: number;
    discountPrice: number;
    stock: number;
    images: string[];
    brand: string;
  };
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  payableAmount: number;
  isLoading: boolean;
  error: string | null;

  fetchCart: (isAuthenticated: boolean) => Promise<void>;
  addToCart: (productId: string, quantity: number, isAuthenticated: boolean) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, isAuthenticated: boolean) => Promise<void>;
  removeFromCart: (productId: string, isAuthenticated: boolean) => Promise<void>;
  clearCart: (isAuthenticated: boolean) => Promise<void>;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalAmount: 0,
  payableAmount: 0,
  isLoading: false,
  error: null,

  calculateTotals: () => {
    const items = get().items;
    const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const payableAmount = items.reduce((sum, item) => sum + item.product.discountPrice * item.quantity, 0);
    
    set({
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      payableAmount: parseFloat(payableAmount.toFixed(2)),
    });
  },

  fetchCart: async (isAuthenticated) => {
    if (!isAuthenticated) {
      // Fetch guest cart from local storage
      const localCart = localStorage.getItem('guestCart');
      const items = localCart ? JSON.parse(localCart) : [];
      set({ items, error: null });
      get().calculateTotals();
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/cart');
      const items = res.data.cart?.items || [];
      set({ items, isLoading: false });
      get().calculateTotals();
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to fetch cart',
      });
    }
  },

  addToCart: async (productId, quantity, isAuthenticated) => {
    set({ isLoading: true, error: null });
    try {
      if (isAuthenticated) {
        await api.post('/cart/add', { productId, quantity });
        await get().fetchCart(true);
      } else {
        // Guest mode: get product details or add placeholder details
        // To make guest mode completely seamless, we will fetch details if adding
        const res = await api.get(`/products/${productId}`);
        const product = res.data.product;

        const currentItems = [...get().items];
        const existingIndex = currentItems.findIndex((item) => item.productId === productId);

        if (existingIndex !== -1) {
          const newQty = currentItems[existingIndex].quantity + quantity;
          if (product.stock < newQty) {
            throw new Error(`Insufficient stock. Maximum is ${product.stock}`);
          }
          currentItems[existingIndex].quantity = newQty;
        } else {
          currentItems.push({
            id: `guest-${Date.now()}`,
            productId,
            quantity,
            product,
          });
        }

        localStorage.setItem('guestCart', JSON.stringify(currentItems));
        set({ items: currentItems, isLoading: false });
        get().calculateTotals();
      }
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || err.message || 'Failed to add item',
      });
      throw err;
    }
  },

  updateQuantity: async (productId, quantity, isAuthenticated) => {
    set({ isLoading: true, error: null });
    try {
      if (isAuthenticated) {
        await api.put('/cart/update', { productId, quantity });
        await get().fetchCart(true);
      } else {
        const currentItems = [...get().items];
        const idx = currentItems.findIndex((item) => item.productId === productId);

        if (idx !== -1) {
          if (currentItems[idx].product.stock < quantity) {
            throw new Error(`Insufficient stock. Maximum is ${currentItems[idx].product.stock}`);
          }
          currentItems[idx].quantity = quantity;
        }

        localStorage.setItem('guestCart', JSON.stringify(currentItems));
        set({ items: currentItems, isLoading: false });
        get().calculateTotals();
      }
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || err.message || 'Failed to update quantity',
      });
      throw err;
    }
  },

  removeFromCart: async (productId, isAuthenticated) => {
    set({ isLoading: true, error: null });
    try {
      if (isAuthenticated) {
        await api.delete(`/cart/remove/${productId}`);
        await get().fetchCart(true);
      } else {
        const currentItems = get().items.filter((item) => item.productId !== productId);
        localStorage.setItem('guestCart', JSON.stringify(currentItems));
        set({ items: currentItems, isLoading: false });
        get().calculateTotals();
      }
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to remove item',
      });
      throw err;
    }
  },

  clearCart: async (isAuthenticated) => {
    set({ isLoading: true, error: null });
    try {
      if (isAuthenticated) {
        await api.delete('/cart/clear');
        set({ items: [], isLoading: false });
      } else {
        localStorage.removeItem('guestCart');
        set({ items: [], isLoading: false });
      }
      get().calculateTotals();
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to clear cart',
      });
      throw err;
    }
  },
}));
