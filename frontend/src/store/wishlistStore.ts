import { create } from 'zustand';
import api from '../services/api';

export interface WishlistProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  discountPrice: number;
  stock: number;
  images: string[];
  brand: string;
}

interface WishlistState {
  products: WishlistProduct[];
  isLoading: boolean;
  error: string | null;

  fetchWishlist: (isAuthenticated: boolean) => Promise<void>;
  toggleWishlist: (product: WishlistProduct, isAuthenticated: boolean) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  isInWishlist: (productId) => {
    return get().products.some((p) => p.id === productId);
  },

  fetchWishlist: async (isAuthenticated) => {
    if (!isAuthenticated) {
      const local = localStorage.getItem('guestWishlist');
      const products = local ? JSON.parse(local) : [];
      set({ products, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/wishlist');
      set({ products: res.data.wishlist || [], isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to fetch wishlist',
      });
    }
  },

  toggleWishlist: async (product, isAuthenticated) => {
    set({ isLoading: true, error: null });
    try {
      if (isAuthenticated) {
        const res = await api.post('/wishlist/toggle', { productId: product.id });
        const { inWishlist } = res.data;
        
        if (inWishlist) {
          set((state) => ({ products: [...state.products, product], isLoading: false }));
        } else {
          set((state) => ({
            products: state.products.filter((p) => p.id !== product.id),
            isLoading: false,
          }));
        }
      } else {
        // Guest mode
        const currentProducts = [...get().products];
        const exists = currentProducts.some((p) => p.id === product.id);
        let updatedProducts;

        if (exists) {
          updatedProducts = currentProducts.filter((p) => p.id !== product.id);
        } else {
          updatedProducts = [...currentProducts, product];
        }

        localStorage.setItem('guestWishlist', JSON.stringify(updatedProducts));
        set({ products: updatedProducts, isLoading: false });
      }
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to toggle wishlist item',
      });
      throw err;
    }
  },
}));
