import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { getFallbackWishlist, toggleFallbackWishlist } from '../utils/ecomFallback';

const withFastTimeout = <T>(promise: Promise<T>, timeoutMs: number = 300): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), timeoutMs)),
  ]);
};

// 1. GET WISHLIST
export const getWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new BadRequestError('User not authenticated'));

    try {
      let wishlist = await withFastTimeout(
        prisma.wishlist.findUnique({
          where: { userId },
          include: {
            products: {
              include: {
                category: { select: { name: true, slug: true } },
              },
            },
          },
        }),
        300
      );

      if (!wishlist) {
        wishlist = await withFastTimeout(
          prisma.wishlist.create({
            data: { userId },
            include: {
              products: {
                include: {
                  category: { select: { name: true, slug: true } },
                },
              },
            },
          }),
          300
        );
      }

      return res.status(200).json({
        success: true,
        wishlist: wishlist.products,
      });
    } catch (_dbError) {
      const wishlist = getFallbackWishlist(userId);
      return res.status(200).json({
        success: true,
        wishlist,
      });
    }
  } catch (error) {
    next(error);
  }
};

// 2. TOGGLE WISHLIST (ADD / REMOVE)
export const toggleWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.body;

    if (!userId) return next(new BadRequestError('User not authenticated'));
    if (!productId) return next(new BadRequestError('Product ID is required'));

    try {
      const product = await withFastTimeout(prisma.product.findUnique({ where: { id: productId } }), 300);
      if (!product) return next(new NotFoundError('Product not found'));

      let wishlist = await withFastTimeout(
        prisma.wishlist.findUnique({
          where: { userId },
          include: { products: true },
        }),
        300
      );

      if (!wishlist) {
        wishlist = await withFastTimeout(
          prisma.wishlist.create({
            data: { userId },
            include: { products: true },
          }),
          300
        );
      }

      const isProductInWishlist = wishlist.products.some((p: any) => p.id === productId);

      if (isProductInWishlist) {
        await withFastTimeout(
          prisma.wishlist.update({
            where: { id: wishlist.id },
            data: {
              products: {
                disconnect: { id: productId },
              },
            },
          }),
          300
        );
        return res.status(200).json({
          success: true,
          message: 'Product removed from wishlist',
          inWishlist: false,
        });
      } else {
        await withFastTimeout(
          prisma.wishlist.update({
            where: { id: wishlist.id },
            data: {
              products: {
                connect: { id: productId },
              },
            },
          }),
          300
        );
        return res.status(200).json({
          success: true,
          message: 'Product added to wishlist',
          inWishlist: true,
        });
      }
    } catch (_dbError) {
      const result = toggleFallbackWishlist(userId, productId);
      return res.status(200).json({
        success: true,
        message: result.inWishlist ? 'Product added to wishlist' : 'Product removed from wishlist',
        inWishlist: result.inWishlist,
      });
    }
  } catch (error) {
    next(error);
  }
};
