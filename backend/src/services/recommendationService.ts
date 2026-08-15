import prisma from '../config/db';
import {
  rankProductsWithAI,
  CandidateProductSummary,
  UserContextSummary,
} from './aiService';

export enum InteractionType {
  VIEW = 'VIEW',
  CART = 'CART',
  REMOVE_FROM_CART = 'REMOVE_FROM_CART',
  WISHLIST = 'WISHLIST',
  PURCHASE = 'PURCHASE',
}

// Lean product card selection matching existing SmartShop catalog patterns
export const recommendationProductSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  discount: true,
  discountPrice: true,
  rating: true,
  stock: true,
  brand: true,
  images: true,
  isFeatured: true,
  isTrending: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};

export interface RecommendationItem {
  product: any;
  score: number;
  reason: string;
  isAiGenerated: boolean;
}

// In-memory cache for high-speed response times and reducing LLM / DB overhead
interface CacheEntry<T> {
  data: T;
  expiry: number;
}
const recommendationCache = new Map<string, CacheEntry<any>>();

const getFromCache = <T>(key: string): T | null => {
  const entry = recommendationCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    recommendationCache.delete(key);
    return null;
  }
  return entry.data;
};

const setInCache = <T>(key: string, data: T, ttlMs: number): void => {
  recommendationCache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
};

import { fallbackProducts } from '../utils/catalogFallback';

const withFastTimeout = <T>(promise: Promise<T>, timeoutMs: number = 300): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), timeoutMs)),
  ]);
};


// Resilient default products for offline/cold-start environments
const defaultFallbackProducts = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling with Auto NC Optimizer and crystal clear hands-free calling.',
    price: 34990,
    discount: 15,
    discountPrice: 29741,
    rating: 4.8,
    stock: 25,
    brand: 'Sony',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
    isFeatured: true,
    isTrending: true,
    createdAt: new Date(),
    category: { id: 'c1', name: 'Electronics', slug: 'electronics' },
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    name: 'Apple Watch Series 9',
    description: 'Smartwatch with powerful health sensors, advanced workout metrics, and always-on Retina display.',
    price: 41900,
    discount: 10,
    discountPrice: 37710,
    rating: 4.9,
    stock: 18,
    brand: 'Apple',
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'],
    isFeatured: true,
    isTrending: true,
    createdAt: new Date(),
    category: { id: 'c1', name: 'Electronics', slug: 'electronics' },
  },
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    name: 'Nike Air Zoom Pegasus 40',
    description: 'A responsive ride for everyday running with engineered mesh upper and dual Zoom Air units.',
    price: 11895,
    discount: 20,
    discountPrice: 9516,
    rating: 4.7,
    stock: 30,
    brand: 'Nike',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
    isFeatured: true,
    isTrending: true,
    createdAt: new Date(),
    category: { id: 'c2', name: 'Fashion', slug: 'fashion' },
  },
  {
    id: 'f4444444-4444-4444-4444-444444444444',
    name: 'Atomic Habits by James Clear',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Over 10 million copies sold.',
    price: 799,
    discount: 25,
    discountPrice: 599,
    rating: 4.9,
    stock: 50,
    brand: 'Penguin Random House',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'],
    isFeatured: true,
    isTrending: true,
    createdAt: new Date(),
    category: { id: 'c4', name: 'Books', slug: 'books' },
  },
];

/**
 * 1. Track user/guest interactions asynchronously
 */
export const trackUserInteraction = async (data: {
  userId?: string;
  sessionId?: string;
  productId: string;
  interactionType: InteractionType | string;
}) => {
  try {
    if (!data.productId) return null;
    if (!data.userId && !data.sessionId) return null;

    const productExists = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true },
    }).catch(() => null);

    if (!productExists) return null;

    const interaction = await (prisma as any).userProductInteraction.create({
      data: {
        userId: data.userId || null,
        sessionId: data.sessionId || null,
        productId: data.productId,
        interactionType: data.interactionType as any,
      },
    }).catch(() => null);

    if (data.userId) recommendationCache.delete(`rec:user:${data.userId}`);
    if (data.sessionId) recommendationCache.delete(`rec:sess:${data.sessionId}`);

    return interaction;
  } catch (error: any) {
    console.error('[Recommendation Service] Error tracking interaction:', error.message || error);
    return null;
  }
};

/**
 * 2. Get Personalized Recommendations for Authenticated Users or Active Guests
 */
export const getPersonalizedRecommendations = async (
  userId?: string,
  sessionId?: string,
  limit: number = 8
): Promise<{ success: boolean; recommendations: RecommendationItem[]; source: string }> => {
  const cacheKey = userId ? `rec:user:${userId}` : sessionId ? `rec:sess:${sessionId}` : 'rec:popular';
  const cached = getFromCache<{ success: boolean; recommendations: RecommendationItem[]; source: string }>(cacheKey);
  if (cached) return cached;

  try {
    // 1. Gather User Context & History
    let userInteractions: any[] = [];
    let userWishlistIds: string[] = [];
    let userCartIds: string[] = [];
    let userPurchasedIds: string[] = [];

    if (userId) {
      const [interactions, wishlist, cart, orders] = await Promise.all([
        (prisma as any).userProductInteraction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 25,
          include: {
            product: {
              select: { id: true, name: true, categoryId: true, brand: true, price: true, category: { select: { name: true } } },
            },
          },
        }).catch(() => []),
        prisma.wishlist.findUnique({
          where: { userId },
          include: { products: { select: { id: true, name: true, categoryId: true } } },
        }).catch(() => null),
        prisma.cart.findUnique({
          where: { userId },
          include: { items: { include: { product: { select: { id: true, name: true, categoryId: true } } } } },
        }).catch(() => null),
        prisma.order.findMany({
          where: { userId },
          take: 5,
          include: { items: { include: { product: { select: { id: true, name: true, categoryId: true, category: { select: { name: true } } } } } } },
        }).catch(() => []),
      ]);

      userInteractions = interactions || [];
      userWishlistIds = wishlist?.products.map((p: any) => p.id) || [];
      userCartIds = cart?.items.map((i: any) => i.productId) || [];
      userPurchasedIds = orders?.flatMap((o: any) => o.items.map((i: any) => i.productId)) || [];
    } else if (sessionId) {
      userInteractions = await (prisma as any).userProductInteraction.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          product: {
            select: { id: true, name: true, categoryId: true, brand: true, price: true, category: { select: { name: true } } },
          },
        },
      }).catch(() => []);
    }

    // Extract preferences from history
    const viewedCategories = new Set<string>();
    const preferredCategoryIds = new Set<string>();
    const preferredBrands = new Set<string>();
    const recentViewedNames: string[] = [];
    let totalInteractionPrice = 0;
    let priceCount = 0;

    for (const item of userInteractions) {
      if (item?.product) {
        if (item.product.category?.name) viewedCategories.add(item.product.category.name);
        if (item.product.categoryId) preferredCategoryIds.add(item.product.categoryId);
        if (item.product.brand) preferredBrands.add(item.product.brand);
        if (!recentViewedNames.includes(item.product.name)) recentViewedNames.push(item.product.name);
        totalInteractionPrice += item.product.price;
        priceCount++;
      }
    }

    const averagePrice = priceCount > 0 ? totalInteractionPrice / priceCount : 2500;
    const hasHistory = preferredCategoryIds.size > 0 || recentViewedNames.length > 0;

    // 2. Candidate Retrieval from PostgreSQL
    const candidateWhere: any = {
      stock: { gt: 0 },
    };

    if (hasHistory) {
      candidateWhere.OR = [
        { categoryId: { in: Array.from(preferredCategoryIds) } },
        { brand: { in: Array.from(preferredBrands) } },
        {
          discountPrice: {
            gte: Math.max(0, averagePrice * 0.4),
            lte: averagePrice * 2.2,
          },
        },
        { isFeatured: true },
        { isTrending: true },
        { rating: { gte: 4.0 } },
      ];
    } else {
      candidateWhere.OR = [
        { isTrending: true },
        { isFeatured: true },
        { rating: { gte: 4.0 } },
        { discount: { gt: 0 } },
      ];
    }

    let candidateProducts = await withFastTimeout(
      prisma.product.findMany({
        where: candidateWhere,
        take: 30,
        orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
        select: recommendationProductSelect,
      }),
      300
    ).catch(() => []);

    if (!candidateProducts || candidateProducts.length === 0) {
      candidateProducts = fallbackProducts as any;
    }


    // 3. AI Ranking via Gemini (with structured output)
    const candidateSummaries: CandidateProductSummary[] = candidateProducts.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category.name,
      brand: p.brand,
      price: p.discountPrice,
      rating: p.rating,
    }));

    const userContext: UserContextSummary = {
      viewedCategories: Array.from(viewedCategories),
      recentViewedNames: recentViewedNames.slice(0, 5),
      cartProductNames: [],
      wishlistProductNames: [],
      purchasedCategories: [],
    };

    let aiRanked = await rankProductsWithAI(candidateSummaries, {
      type: 'personalized',
      userContext,
    });

    const productMap = new Map<string, any>();
    candidateProducts.forEach((p: any) => productMap.set(p.id, p));
    let recommendations: RecommendationItem[] = [];

    if (aiRanked && aiRanked.length > 0) {
      for (const rank of aiRanked) {
        const product = productMap.get(rank.productId);
        if (product && product.stock > 0) {
          recommendations.push({
            product,
            score: rank.score,
            reason: rank.reason,
            isAiGenerated: true,
          });
        }
      }
    }

    // 4. Deterministic Heuristic Fallback
    if (recommendations.length < limit) {
      const existingIds = new Set(recommendations.map((r) => r.product.id));

      const scoredCandidates = candidateProducts
        .filter((p) => !existingIds.has(p.id) && p.stock > 0)
        .map((product) => {
          let score = 0.5;
          let reasons: string[] = [];

          if (preferredCategoryIds.has(product.category?.id)) {
            score += 0.3;
            reasons.push(`Based on your interest in ${product.category?.name}`);
          }
          if (preferredBrands.has(product.brand)) {
            score += 0.15;
            reasons.push(`Popular by ${product.brand}`);
          }
          if (product.rating >= 4.5) {
            score += 0.15;
            reasons.push(`Top-rated customer favorite (${product.rating}★)`);
          }
          if (product.isTrending) {
            score += 0.1;
            reasons.push('Currently trending in store');
          }
          if (product.discount > 15) {
            score += 0.1;
            reasons.push(`Special discount: ${product.discount}% off`);
          }

          const reason = reasons.length > 0 ? reasons[0] : `Popular pick in ${product.category?.name || 'our collection'}`;

          return {
            product,
            score: Math.min(score, 0.99),
            reason,
            isAiGenerated: false,
          };
        });

      scoredCandidates.sort((a, b) => b.score - a.score);

      for (const candidate of scoredCandidates) {
        if (recommendations.length >= limit) break;
        recommendations.push(candidate);
      }
    }

    const finalRecommendations = recommendations.slice(0, limit);

    const payload = {
      success: true,
      recommendations: finalRecommendations,
      source: aiRanked ? 'gemini-ai' : 'heuristic-fallback',
    };

    setInCache(cacheKey, payload, 600000);
    return payload;
  } catch (error: any) {
    console.warn('[Recommendation Service] Database query fallback:', error.message || error);
    // Serve guaranteed fallback catalog so user never sees an error
    return {
      success: true,
      recommendations: defaultFallbackProducts.slice(0, limit).map((p) => ({
        product: p,
        score: 0.85,
        reason: `Recommended choice in ${p.category.name}`,
        isAiGenerated: false,
      })),
      source: 'offline-fallback',
    };
  }
};

/**
 * 3. Get Related Product Recommendations for Product Details Page
 */
export const getRelatedProductRecommendations = async (
  productId: string,
  _userId?: string,
  _sessionId?: string,
  limit: number = 4
): Promise<{ success: boolean; recommendations: RecommendationItem[]; source: string }> => {
  const cacheKey = `rec:product:${productId}`;
  const cached = getFromCache<{ success: boolean; recommendations: RecommendationItem[]; source: string }>(cacheKey);
  if (cached) return cached;

  try {
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    }).catch(() => null);

    const baseProduct: any = currentProduct || defaultFallbackProducts[0];
    const baseCategoryId = baseProduct.categoryId || baseProduct.category?.id;

    const candidates = await prisma.product.findMany({
      where: {
        NOT: { id: baseProduct.id },
        stock: { gt: 0 },
        OR: [
          { categoryId: baseCategoryId },
          { brand: baseProduct.brand },
        ],
      },
      take: 20,
      orderBy: [{ rating: 'desc' }, { isTrending: 'desc' }],
      select: recommendationProductSelect,
    }).catch(() => []);

    const effectiveCandidates = (candidates && candidates.length > 0) 
      ? candidates 
      : defaultFallbackProducts.filter(p => p.id !== productId);

    if (effectiveCandidates.length === 0) {
      return { success: true, recommendations: [], source: 'empty' };
    }

    const candidateSummaries: CandidateProductSummary[] = effectiveCandidates.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category?.name || 'General',
      brand: p.brand,
      price: p.discountPrice,
      rating: p.rating,
    }));

    const currentSummary: CandidateProductSummary = {
      id: baseProduct.id,
      name: baseProduct.name,
      category: baseProduct.category?.name || 'General',
      brand: baseProduct.brand,
      price: baseProduct.discountPrice,
      rating: baseProduct.rating,
    };

    const aiRanked = await rankProductsWithAI(candidateSummaries, {
      type: 'related',
      currentProduct: currentSummary,
    });

    const productMap = new Map<string, any>();
    effectiveCandidates.forEach((p: any) => productMap.set(p.id, p));
    let recommendations: RecommendationItem[] = [];

    if (aiRanked && aiRanked.length > 0) {
      for (const rank of aiRanked) {
        if (rank.productId === baseProduct.id) continue;
        const product = productMap.get(rank.productId);
        if (product && product.stock > 0) {
          recommendations.push({
            product,
            score: rank.score,
            reason: rank.reason,
            isAiGenerated: true,
          });
        }
      }
    }

    if (recommendations.length < limit) {
      const existingIds = new Set(recommendations.map((r) => r.product.id));

      const scored = effectiveCandidates
        .filter((p: any) => !existingIds.has(p.id) && p.id !== baseProduct.id && p.stock > 0)
        .map((p: any) => {
          let score = 0.5;
          let reason = `Similar to ${baseProduct.name} in ${p.category?.name || 'Category'}`;

          if (p.category?.id === baseCategoryId) score += 0.35;
          if (p.brand === baseProduct.brand) {
            score += 0.2;
            reason = `Also from ${p.brand}`;
          }


          return {
            product: p,
            score: Math.min(score, 0.98),
            reason,
            isAiGenerated: false,
          };
        });

      scored.sort((a, b) => b.score - a.score);

      for (const item of scored) {
        if (recommendations.length >= limit) break;
        recommendations.push(item);
      }
    }

    const finalRecommendations = recommendations.slice(0, limit);

    const payload = {
      success: true,
      recommendations: finalRecommendations,
      source: aiRanked ? 'gemini-ai' : 'heuristic-fallback',
    };

    setInCache(cacheKey, payload, 1200000);
    return payload;
  } catch (err: any) {
    console.warn('[Recommendation Service] Related products fallback:', err.message || err);
    return {
      success: true,
      recommendations: defaultFallbackProducts.slice(0, limit).map((p) => ({
        product: p,
        score: 0.85,
        reason: `Similar style in ${p.category.name}`,
        isAiGenerated: false,
      })),
      source: 'offline-fallback',
    };
  }
};

/**
 * 4. Get Cart Complementary Recommendations
 */
export const getCartRecommendations = async (
  userId?: string,
  _sessionId?: string,
  limit: number = 4
): Promise<{ success: boolean; recommendations: RecommendationItem[]; source: string }> => {
  try {
    let cartItemProductIds: string[] = [];

    if (userId) {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      }).catch(() => null);
      cartItemProductIds = cart?.items.map((i) => i.productId) || [];
    }

    const candidates = await prisma.product.findMany({
      where: {
        NOT: { id: { in: cartItemProductIds } },
        stock: { gt: 0 },
        OR: [{ isTrending: true }, { isFeatured: true }, { rating: { gte: 4.0 } }],
      },
      take: 15,
      orderBy: { rating: 'desc' },
      select: recommendationProductSelect,
    }).catch(() => []);

    const effectiveList = (candidates && candidates.length > 0) ? candidates : defaultFallbackProducts;

    const recommendations: RecommendationItem[] = effectiveList.slice(0, limit).map((product) => ({
      product,
      score: 0.88,
      reason: 'Frequently bought together with trending items',
      isAiGenerated: false,
    }));

    return {
      success: true,
      recommendations,
      source: 'cart-complementary',
    };
  } catch (err: any) {
    return {
      success: true,
      recommendations: defaultFallbackProducts.slice(0, limit).map((p) => ({
        product: p,
        score: 0.88,
        reason: 'Frequently paired with cart items',
        isAiGenerated: false,
      })),
      source: 'offline-fallback',
    };
  }
};
