import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from server if logged in, otherwise from localStorage
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        try {
          const { data } = await api.get('/auth/profile');
          // If wishlist is populated with full product details, save it as is
          setWishlist(data.wishlist || []);
        } catch (error) {
          console.error('Failed to load wishlist from server:', error.message);
        }
      } else {
        const local = localStorage.getItem('smartshop_wishlist');
        setWishlist(local ? JSON.parse(local) : []);
      }
    };
    loadWishlist();
  }, [user]);

  // Synchronize local changes to server or storage
  const syncWishlist = async (updated) => {
    setWishlist(updated);
    if (user) {
      try {
        // Send updated profile address or custom update route
        // For convenience, we will maintain wishlist in localStorage & sync via backend put profile
        // Let's create a dedicated wishlist toggle endpoint or sync user profile
        // Actually, we can update user profile wishlist
        await api.put('/auth/profile', { wishlist: updated.map(item => item._id || item) });
      } catch (error) {
        console.error('Failed to sync wishlist with server:', error.message);
      }
    } else {
      localStorage.setItem('smartshop_wishlist', JSON.stringify(updated));
    }
  };

  const addToWishlist = (product) => {
    if (wishlist.some(item => (item._id || item) === product._id)) return;
    const updated = [...wishlist, product];
    syncWishlist(updated);
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter(item => (item._id || item) !== productId);
    syncWishlist(updated);
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.some(item => (item._id || item) === product._id);
    if (exists) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => (item._id || item) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
