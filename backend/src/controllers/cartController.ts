import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import {
  getFallbackCart,
  addToFallbackCart,
  updateFallbackCartQuantity,
  removeFromFallbackCart,
  clearFallbackCart,
} from '../utils/ecomFallback';
import { findFallbackProductById } from '../utils/catalogFallback';

const withFastTimeout = <T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), timeoutMs)),
  ]);
};

// 1. GET CART
export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new BadRequestError('User not authenticated'));

    try {
      let cart = await withFastTimeout(
        prisma.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        }),
        5000
      );

      if (!cart) {
        cart = await withFastTimeout(
          prisma.cart.create({
            data: { userId },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          }),
          5000
        );
      }

      return res.status(200).json({
        success: true,
        cart,
      });
    } catch (_dbError) {
      const fallbackCart = getFallbackCart(userId);
      return res.status(200).json({
        success: true,
        cart: fallbackCart,
      });
    }
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

    try {
      let product: any = null;
      let cart: any = null;

      try {
        [product, cart] = await withFastTimeout(
          Promise.all([
            prisma.product.findUnique({ where: { id: productId } }),
            prisma.cart.findUnique({
              where: { userId },
              include: {
                items: {
                  where: { productId },
                },
              },
            }),
          ]),
          5000
        );
      } catch (_e) {
        // DB timeout / error
      }

      if (!product) {
        product = findFallbackProductById(productId);
        if (!product) {
          return next(new NotFoundError('Product not found'));
        }
        // Fallback product -> route to in-memory fallback cart
        const updatedCart = addToFallbackCart(userId, productId, quantity);
        return res.status(200).json({
          success: true,
          message: 'Product added to cart successfully',
          cart: updatedCart,
        });
      }

      if (product.stock < quantity) {
        return next(new BadRequestError(`Only ${product.stock} items in stock.`));
      }

      let updatedCart;

      if (!cart) {
        updatedCart = await withFastTimeout(
          prisma.cart.create({
            data: {
              userId,
              items: {
                create: {
                  productId,
                  quantity,
                },
              },
            },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          }),
          5000
        );
      } else {
        const existingItem = cart.items[0];

        if (existingItem) {
          const newQty = existingItem.quantity + quantity;
          if (product.stock < newQty) {
            return next(new BadRequestError(`Insufficient stock. Maximum available is ${product.stock}`));
          }
          await withFastTimeout(
            prisma.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: newQty },
            }),
            5000
          );
        } else {
          await withFastTimeout(
            prisma.cartItem.create({
              data: {
                cartId: cart.id,
                productId,
                quantity,
              },
            }),
            5000
          );
        }

        updatedCart = await withFastTimeout(
          prisma.cart.findUnique({
            where: { userId },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          }),
          5000
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Product added to cart successfully',
        cart: updatedCart,
      });
    } catch (_dbError) {
      const updatedCart = addToFallbackCart(userId, productId, quantity);
      return res.status(200).json({
        success: true,
        message: 'Product added to cart successfully',
        cart: updatedCart,
      });
    }
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

    try {
      const [product, cart] = await withFastTimeout(
        Promise.all([
          prisma.product.findUnique({ where: { id: productId } }),
          prisma.cart.findUnique({ where: { userId } }),
        ]),
        5000
      );

      if (!product) return next(new NotFoundError('Product not found'));
      if (product.stock < quantity) {
        return next(new BadRequestError(`Only ${product.stock} items available in stock.`));
      }
      if (!cart) return next(new NotFoundError('Cart not found'));

      await withFastTimeout(
        prisma.cartItem.update({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId,
            },
          },
          data: { quantity },
        }),
        5000
      );

      const updatedCart = await withFastTimeout(
        prisma.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        }),
        5000
      );

      return res.status(200).json({
        success: true,
        message: 'Cart updated',
        cart: updatedCart,
      });
    } catch (_dbError) {
      const updatedCart = updateFallbackCartQuantity(userId, productId, quantity);
      return res.status(200).json({
        success: true,
        message: 'Cart updated',
        cart: updatedCart,
      });
    }
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

    try {
      const cart = await withFastTimeout(prisma.cart.findUnique({ where: { userId } }), 5000);
      if (!cart) return next(new NotFoundError('Cart not found'));

      await withFastTimeout(
        prisma.cartItem.delete({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId,
            },
          },
        }),
        5000
      );

      const updatedCart = await withFastTimeout(
        prisma.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        }),
        5000
      );

      return res.status(200).json({
        success: true,
        message: 'Product removed from cart successfully',
        cart: updatedCart,
      });
    } catch (_dbError) {
      const updatedCart = removeFromFallbackCart(userId, productId);
      return res.status(200).json({
        success: true,
        message: 'Product removed from cart successfully',
        cart: updatedCart,
      });
    }
  } catch (error) {
    next(error);
  }
};

// 5. CLEAR CART
export const clearCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new BadRequestError('User not authenticated'));

    try {
      const cart = await withFastTimeout(prisma.cart.findUnique({ where: { userId } }), 5000);
      if (cart) {
        await withFastTimeout(
          prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
          }),
          5000
        );
      }
      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        cart: { items: [], totalAmount: 0, payableAmount: 0 },
      });
    } catch (_dbError) {
      const updatedCart = clearFallbackCart(userId);
      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        cart: updatedCart,
      });
    }
  } catch (error) {
    next(error);
  }
};
