import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  getPersonalizedRecommendations,
  getRelatedProductRecommendations,
  getCartRecommendations,
  trackUserInteraction,
} from '../services/recommendationService';
import { BadRequestError } from '../utils/errors';
import { InteractionType } from '../services/recommendationService';

const trackSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  interactionType: z.nativeEnum(InteractionType, {
    errorMap: () => ({ message: 'Invalid interaction type. Must be VIEW, CART, REMOVE_FROM_CART, WISHLIST, or PURCHASE' }),
  }),
  sessionId: z.string().optional(),
});


// 1. GET PERSONALIZED RECOMMENDATIONS (User or Guest)
export const getRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string) || undefined;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 8, 1), 20);

    const result = await getPersonalizedRecommendations(userId, sessionId, limit);

    res.status(200).json({
      success: true,
      recommendations: result.recommendations,
      count: result.recommendations.length,
      source: result.source,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET RELATED PRODUCT RECOMMENDATIONS (Product Page)
export const getRelatedRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return next(new BadRequestError('Product ID is required'));
    }

    const userId = req.user?.id;
    const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string) || undefined;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 4, 1), 12);

    const result = await getRelatedProductRecommendations(productId, userId, sessionId, limit);

    res.status(200).json({
      success: true,
      recommendations: result.recommendations,
      count: result.recommendations.length,
      source: result.source,
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET CART RECOMMENDATIONS
export const getCartComplementaryRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string) || undefined;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 4, 1), 8);

    const result = await getCartRecommendations(userId, sessionId, limit);

    res.status(200).json({
      success: true,
      recommendations: result.recommendations,
      count: result.recommendations.length,
      source: result.source,
    });
  } catch (error) {
    next(error);
  }
};

// 4. TRACK USER INTERACTION (VIEW, CART, WISHLIST, PURCHASE)
export const trackEvent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = trackSchema.parse(req.body);
    const userId = req.user?.id;
    const sessionId = validatedData.sessionId || (req.headers['x-session-id'] as string) || undefined;

    // Track asynchronously
    await trackUserInteraction({
      userId,
      sessionId,
      productId: validatedData.productId,
      interactionType: validatedData.interactionType,
    });

    res.status(200).json({
      success: true,
      message: 'Interaction tracked successfully',
    });
  } catch (error) {
    next(error);
  }
};
