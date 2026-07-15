import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/db';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { OrderStatus } from '@prisma/client';
import { z } from 'zod';

const reviewSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(3, 'Comment must be at least 3 characters'),
});

// 1. ADD / UPDATE PRODUCT REVIEW
export const addProductReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const validatedData = reviewSchema.parse(req.body);
    const { productId, rating, comment } = validatedData;

    if (!userId) return next(new BadRequestError('User not authenticated'));

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return next(new NotFoundError('Product not found'));

    // Security check: Must have purchased the product (delivered status)
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId,
        status: OrderStatus.DELIVERED,
        items: {
          some: { productId },
        },
      },
    });

    if (!hasPurchased) {
      return next(
        new BadRequestError('You can only review items you have successfully purchased and received.')
      );
    }

    // Add or update review (upsert logic)
    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId,
        productId,
        rating,
        comment,
      },
    });

    // Recalculate average product rating
    const aggregateReviews = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    const averageRating = aggregateReviews._avg.rating || 0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: parseFloat(averageRating.toFixed(1)),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Review saved successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET ALL REVIEWS FOR A PRODUCT
export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// 3. DELETE REVIEW (ADMIN OR OWNER)
export const deleteReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) return next(new BadRequestError('User not authenticated'));

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return next(new NotFoundError('Review not found'));

    if (review.userId !== userId && req.user?.role !== 'ADMIN') {
      return next(new ForbiddenError('You are not authorized to delete this review'));
    }

    await prisma.review.delete({ where: { id } });

    // Recalculate product rating
    const aggregateReviews = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
    });

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: parseFloat((aggregateReviews._avg.rating || 0).toFixed(1)),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
