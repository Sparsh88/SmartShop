import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';

// 1. GET WISHLIST
export const getWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new BadRequestError('User not authenticated'));

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        products: {
          include: {
            category: { select: { name: true, slug: true } },
          },
        },
      },
    });

    // Auto-create wishlist if it doesn't exist
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
        include: {
          products: {
            include: {
              category: { select: { name: true, slug: true } },
            },
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      wishlist: wishlist.products,
    });
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

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return next(new NotFoundError('Product not found'));

    // Find user's wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: { products: true },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
        include: { products: true },
      });
    }

    const isProductInWishlist = wishlist.products.some((p: any) => p.id === productId);

    if (isProductInWishlist) {
      // Remove from wishlist
      await prisma.wishlist.update({
        where: { id: wishlist.id },
        data: {
          products: {
            disconnect: { id: productId },
          },
        },
      });
      res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
        inWishlist: false,
      });
    } else {
      // Add to wishlist
      await prisma.wishlist.update({
        where: { id: wishlist.id },
        data: {
          products: {
            connect: { id: productId },
          },
        },
      });
      res.status(200).json({
        success: true,
        message: 'Product added to wishlist',
        inWishlist: true,
      });
    }
  } catch (error) {
    next(error);
  }
};
