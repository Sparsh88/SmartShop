import { fallbackProducts, FallbackProduct } from './catalogFallback';

export interface FallbackCartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: FallbackProduct;
}

export interface FallbackCart {
  id: string;
  userId: string;
  items: FallbackCartItem[];
}

export interface FallbackAddress {
  id: string;
  userId: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface FallbackOrder {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  couponId?: string | null;
  totalAmount: number;
  discountAmount: number;
  payableAmount: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentId?: string | null;
  createdAt: Date;
  items: {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    product: FallbackProduct;
  }[];
  address?: FallbackAddress;
}

// In-Memory Storage
const userCarts = new Map<string, FallbackCart>();
const userWishlists = new Map<string, string[]>(); // userId -> productIds[]
const userAddresses = new Map<string, FallbackAddress[]>();
const globalOrders: FallbackOrder[] = [];

// Helper: Seed default addresses for test users
const getOrCreateAddresses = (userId: string): FallbackAddress[] => {
  if (!userAddresses.has(userId)) {
    const defaultAddr: FallbackAddress = {
      id: `addr-${userId}-default`,
      userId,
      name: userId === 'usr-admin-01' ? 'SmartShop Admin' : 'John Doe',
      phone: '+91 9876543210',
      street: '123 Connaught Place, Block B',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
      isDefault: true,
      createdAt: new Date(),
    };
    userAddresses.set(userId, [defaultAddr]);
  }
  return userAddresses.get(userId)!;
};

// ==========================================
// 1. CART METHODS
// ==========================================

export const getFallbackCart = (userId: string): FallbackCart => {
  if (!userCarts.has(userId)) {
    userCarts.set(userId, {
      id: `cart-${userId}`,
      userId,
      items: [],
    });
  }
  return userCarts.get(userId)!;
};

export const addToFallbackCart = (userId: string, productId: string, quantity: number = 1): FallbackCart => {
  const cart = getFallbackCart(userId);
  const product = fallbackProducts.find((p) => p.id === productId) || fallbackProducts[0];

  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cartId: cart.id,
      productId: product.id,
      quantity,
      product,
    });
  }
  return cart;
};

export const updateFallbackCartQuantity = (userId: string, productId: string, quantity: number): FallbackCart => {
  const cart = getFallbackCart(userId);
  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) {
    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.productId !== productId);
    } else {
      existing.quantity = quantity;
    }
  }
  return cart;
};

export const removeFromFallbackCart = (userId: string, productId: string): FallbackCart => {
  const cart = getFallbackCart(userId);
  cart.items = cart.items.filter((item) => item.productId !== productId);
  return cart;
};

export const clearFallbackCart = (userId: string): FallbackCart => {
  const cart = getFallbackCart(userId);
  cart.items = [];
  return cart;
};

// ==========================================
// 2. WISHLIST METHODS
// ==========================================

export const getFallbackWishlist = (userId: string): FallbackProduct[] => {
  const productIds = userWishlists.get(userId) || [];
  return fallbackProducts.filter((p) => productIds.includes(p.id));
};

export const toggleFallbackWishlist = (userId: string, productId: string): { inWishlist: boolean; wishlist: FallbackProduct[] } => {
  if (!userWishlists.has(userId)) {
    userWishlists.set(userId, []);
  }
  const list = userWishlists.get(userId)!;
  const index = list.indexOf(productId);
  let inWishlist = false;

  if (index !== -1) {
    list.splice(index, 1);
    inWishlist = false;
  } else {
    list.push(productId);
    inWishlist = true;
  }

  return {
    inWishlist,
    wishlist: getFallbackWishlist(userId),
  };
};

// ==========================================
// 3. ADDRESS METHODS
// ==========================================

export const getFallbackAddresses = (userId: string): FallbackAddress[] => {
  return getOrCreateAddresses(userId);
};

export const addFallbackAddress = (userId: string, data: Omit<FallbackAddress, 'id' | 'userId' | 'createdAt'>): FallbackAddress => {
  const addresses = getOrCreateAddresses(userId);
  if (data.isDefault) {
    addresses.forEach((a) => (a.isDefault = false));
  }
  const newAddress: FallbackAddress = {
    ...data,
    id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    createdAt: new Date(),
  };
  addresses.push(newAddress);
  return newAddress;
};

// ==========================================
// 4. ORDER & PAYMENT METHODS
// ==========================================

export const createFallbackOrder = (
  userId: string,
  addressId: string,
  couponCode: string | null | undefined,
  paymentMethod: string
): FallbackOrder => {
  const cart = getFallbackCart(userId);
  const addresses = getOrCreateAddresses(userId);
  const address = addresses.find((a) => a.id === addressId) || addresses[0];

  let totalAmount = 0;
  const items = cart.items.map((item) => {
    totalAmount += item.product.discountPrice * item.quantity;
    return {
      id: `ord-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: '',
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.discountPrice,
      product: item.product,
    };
  });

  let discountAmount = 0;
  if (couponCode && (couponCode.toUpperCase() === 'WELCOME10' || couponCode.toUpperCase() === 'SMART10')) {
    discountAmount = Math.round((totalAmount * 10) / 100);
  }
  const payableAmount = totalAmount - discountAmount;

  const orderId = `ord-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const order: FallbackOrder = {
    id: orderId,
    orderNumber,
    userId,
    addressId: address.id,
    couponId: couponCode ? 'coupon-welcome10' : null,
    totalAmount,
    discountAmount,
    payableAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
    status: 'PROCESSING',
    createdAt: new Date(),
    items: items.map((it) => ({ ...it, orderId })),
    address,
  };

  globalOrders.unshift(order);
  clearFallbackCart(userId);

  return order;
};

export const getFallbackOrders = (userId: string): FallbackOrder[] => {
  return globalOrders.filter((o) => o.userId === userId);
};

export const getFallbackOrderById = (orderId: string): FallbackOrder | undefined => {
  return globalOrders.find((o) => o.id === orderId);
};

export const updateFallbackOrderPayment = (
  orderId: string,
  paymentStatus: 'COMPLETED' | 'FAILED',
  paymentId?: string
): FallbackOrder | undefined => {
  const order = getFallbackOrderById(orderId);
  if (order) {
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'COMPLETED') {
      order.status = 'PROCESSING';
    }
    if (paymentId) {
      order.paymentId = paymentId;
    }
  }
  return order;
};

export const getAllFallbackOrders = (): FallbackOrder[] => {
  return [...globalOrders];
};

export const updateFallbackOrderStatus = (
  orderId: string,
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED'
): FallbackOrder | undefined => {
  const order = getFallbackOrderById(orderId);
  if (order) {
    order.status = status;
    if (status === 'DELIVERED') {
      order.paymentStatus = 'COMPLETED';
    } else if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
  }
  return order;
};


