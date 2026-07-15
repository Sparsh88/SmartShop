import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';

// 1. GET CART
export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new BadRequestError('User not authenticated'));

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Auto-create cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// 2. ADD TO CART
export const addToCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity = 1 } = req.body;

    if (!userId) return next(new BadRequestError('User not authenticated'));
    if (!productId) return next(new BadRequestError('Product ID is required'));

    // Verify product exists and has stock
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return next(new NotFoundError('Product not found'));
    if (product.stock < quantity) {
      return next(new BadRequestError(`Only ${product.stock} items in stock.`));
    }

    // Get cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    let cartItem;
    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (product.stock < newQty) {
        return next(new BadRequestError(`Insufficient stock. Maximum available is ${product.stock}`));
      }
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      cartItem,
    });
  } catch (error) {
    next(error);
  }
};

// 3. UPDATE QUANTITY
export const updateCartItemQuantity = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;

    if (!userId) return next(new BadRequestError('User not authenticated'));
    if (!productId || quantity === undefined) {
      return next(new BadRequestError('Product ID and quantity are required'));
    }

    if (quantity <= 0) {
      return next(new BadRequestError('Quantity must be greater than zero'));
    }

    // Verify stock
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return next(new NotFoundError('Product not found'));
    if (product.stock < quantity) {
      return next(new BadRequestError(`Only ${product.stock} items available in stock.`));
    }

    // Find cart
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return next(new NotFoundError('Cart not found'));

    const cartItem = await prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      data: { quantity },
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cartItem,
    });
  } catch (error) {
    next(error);
  }
};

// 4. REMOVE FROM CART
export const removeFromCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId) return next(new BadRequestError('User not authenticated'));
    if (!productId) return next(new BadRequestError('Product ID is required'));

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return next(new NotFoundError('Cart not found'));

    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 5. CLEAR CART
export const clearCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new BadRequestError('User not authenticated'));

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return next(new NotFoundError('Cart not found'));

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};
