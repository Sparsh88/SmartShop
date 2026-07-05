import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('smartshop_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedLaterItems, setSavedLaterItems] = useState(() => {
    const saved = localStorage.getItem('smartshop_saved_later');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Persist cart to local storage
  useEffect(() => {
    localStorage.setItem('smartshop_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist saved-for-later items to local storage
  useEffect(() => {
    localStorage.setItem('smartshop_saved_later', JSON.stringify(savedLaterItems));
  }, [savedLaterItems]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.product === product._id);
      if (exists) {
        return prev.map(item =>
          item.product === product._id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          stock: product.stock,
          quantity
        }
      ];
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  // Save for later
  const saveForLater = (productId) => {
    const itemToSave = cartItems.find(item => item.product === productId);
    if (itemToSave) {
      setCartItems(prev => prev.filter(item => item.product !== productId));
      setSavedLaterItems(prev => {
        if (prev.find(item => item.product === productId)) return prev;
        return [...prev, itemToSave];
      });
    }
  };

  // Move saved item back to cart
  const moveToCart = (productId) => {
    const itemToMove = savedLaterItems.find(item => item.product === productId);
    if (itemToMove) {
      setSavedLaterItems(prev => prev.filter(item => item.product !== productId));
      setCartItems(prev => {
        if (prev.find(item => item.product === productId)) return prev;
        return [...prev, itemToMove];
      });
    }
  };

  // Delete saved item
  const removeSavedLater = (productId) => {
    setSavedLaterItems(prev => prev.filter(item => item.product !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  // Calculate totals
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Apply Coupon
  const applyCoupon = async (code) => {
    setCouponError('');
    try {
      const { data } = await api.post('/coupons/validate', {
        code,
        amount: cartSubtotal
      });
      setCoupon(data);
      return data;
    } catch (error) {
      setCoupon(null);
      const msg = error.response?.data?.message || 'Invalid Coupon Code';
      setCouponError(msg);
      throw new Error(msg);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError('');
  };

  // Calculate discount amount based on active coupon
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    }
  }

  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedLaterItems,
        coupon,
        couponError,
        addToCart,
        removeFromCart,
        updateQuantity,
        saveForLater,
        moveToCart,
        removeSavedLater,
        clearCart,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        discountAmount,
        finalTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
