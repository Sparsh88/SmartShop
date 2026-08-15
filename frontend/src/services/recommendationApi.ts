import api from './api';
import { getSessionId } from '../utils/sessionHelper';

export interface RecommendedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  discountPrice: number;
  stock: number;
  rating?: number;
  brand: string;
  images: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface RecommendationResponseItem {
  product: RecommendedProduct;
  score: number;
  reason: string;
  isAiGenerated?: boolean;
}

export interface RecommendationApiResponse {
  success: boolean;
  recommendations: RecommendationResponseItem[];
  count: number;
  source: string;
}

export type InteractionType = 'VIEW' | 'CART' | 'REMOVE_FROM_CART' | 'WISHLIST' | 'PURCHASE';

export const recommendationApi = {
  // Get personalized recommendations for home page or account
  getPersonalized: async (limit: number = 8): Promise<RecommendationApiResponse> => {
    const sessionId = getSessionId();
    const res = await api.get<RecommendationApiResponse>('/recommendations', {
      params: { limit, sessionId },
      headers: { 'x-session-id': sessionId },
    });
    return res.data;
  },

  // Get related products for product details page
  getRelated: async (productId: string, limit: number = 4): Promise<RecommendationApiResponse> => {
    const sessionId = getSessionId();
    const res = await api.get<RecommendationApiResponse>(`/recommendations/product/${productId}`, {
      params: { limit, sessionId },
      headers: { 'x-session-id': sessionId },
    });
    return res.data;
  },

  // Get complementary recommendations for cart page
  getCartRecommendations: async (limit: number = 4): Promise<RecommendationApiResponse> => {
    const sessionId = getSessionId();
    const res = await api.get<RecommendationApiResponse>('/recommendations/cart', {
      params: { limit, sessionId },
      headers: { 'x-session-id': sessionId },
    });
    return res.data;
  },

  // Asynchronously track interactions (non-blocking)
  track: async (productId: string, interactionType: InteractionType): Promise<void> => {
    try {
      const sessionId = getSessionId();
      await api.post('/recommendations/track', {
        productId,
        interactionType,
        sessionId,
      });
    } catch (err) {
      // Fire-and-forget; never break client user experience on analytics failure
      console.debug('[Recommendation Track] Silent notice:', err);
    }
  },
};
