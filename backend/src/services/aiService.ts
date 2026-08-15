import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Zod Schema to strictly validate AI JSON output
const aiRecommendationResponseSchema = z.object({
  recommendations: z.array(
    z.object({
      productId: z.string(),
      score: z.number().min(0).max(1).optional().default(0.85),
      reason: z.string().min(1).max(200),
    })
  ),
});

export interface RankedRecommendation {
  productId: string;
  score: number;
  reason: string;
}

export interface CandidateProductSummary {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
}

export interface UserContextSummary {
  viewedCategories: string[];
  recentViewedNames: string[];
  cartProductNames: string[];
  wishlistProductNames: string[];
  purchasedCategories: string[];
}

/**
 * Calls Gemini AI to rank candidates and generate personalized explanations.
 * Falls back safely to null on any failure, timeout, or missing key.
 */
export const rankProductsWithAI = async (
  candidates: CandidateProductSummary[],
  context: {
    type: 'personalized' | 'related' | 'cart';
    userContext?: UserContextSummary;
    currentProduct?: CandidateProductSummary;
    cartProducts?: CandidateProductSummary[];
  },
  timeoutMs: number = 3500
): Promise<RankedRecommendation[] | null> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key' || apiKey === 'your_gemini_api_key_here') {
    return null; // Graceful fallback
  }

  if (!candidates || candidates.length === 0) {
    return [];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for fast and structured reasoning
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const candidatePoolMap = new Set(candidates.map((c) => c.id));

    let promptContextDescription = '';
    if (context.type === 'personalized') {
      promptContextDescription = `
User Context Profile:
- Recently Viewed Categories: ${context.userContext?.viewedCategories.join(', ') || 'None'}
- Recently Viewed Products: ${context.userContext?.recentViewedNames.join(', ') || 'None'}
- Current Cart Items: ${context.userContext?.cartProductNames.join(', ') || 'None'}
- Wishlist Items: ${context.userContext?.wishlistProductNames.join(', ') || 'None'}
- Purchased Categories: ${context.userContext?.purchasedCategories.join(', ') || 'None'}
Goal: Rank products based on customer preferences, category affinity, and cross-category discovery.
`;
    } else if (context.type === 'related' && context.currentProduct) {
      promptContextDescription = `
Currently Viewed Product:
- Name: "${context.currentProduct.name}"
- Category: "${context.currentProduct.category}"
- Brand: "${context.currentProduct.brand}"
- Price: ₹${context.currentProduct.price}
Goal: Rank candidates by similarity, compatibility, and complementary appeal to this viewed product.
`;
    } else if (context.type === 'cart' && context.cartProducts) {
      promptContextDescription = `
Current Cart Items:
${context.cartProducts.map((p) => `- "${p.name}" (${p.category}, ₹${p.price})`).join('\n')}
Goal: Recommend complementary, bundle-worthy, or frequently-paired items for these cart products.
`;
    }

    const prompt = `
You are the AI Product Recommendation Engine for SmartShop e-commerce.
Analyze the context below and select and rank the best products from the Candidate Pool.

${promptContextDescription}

Candidate Pool (Only choose from these exact product IDs):
${JSON.stringify(
  candidates.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    brand: c.brand,
    price: c.price,
    rating: c.rating,
  })),
  null,
  2
)}

Strict Requirements:
1. Only return product IDs that exist in the Candidate Pool above. Do NOT invent new IDs.
2. Return a valid JSON object matching this schema:
{
  "recommendations": [
    {
      "productId": "string (matching candidate id)",
      "score": number (between 0.0 and 1.0, 1.0 being top match),
      "reason": "string (A short, compelling, friendly reason under 15 words explaining why this product is recommended)"
    }
  ]
}
`;

    // Timeout-wrapped API execution
    const fetchWithTimeout = async (): Promise<string> => {
      const resultPromise = model.generateContent(prompt);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), timeoutMs)
      );
      const result = await Promise.race([resultPromise, timeoutPromise]);
      const response = await result.response;
      return response.text();
    };

    const responseText = await fetchWithTimeout();
    const parsedData = JSON.parse(responseText);

    // Validate structured response against Zod schema
    const validated = aiRecommendationResponseSchema.safeParse(parsedData);
    if (!validated.success) {
      console.warn('[AI Recommendation] Schema validation failed:', validated.error.message);
      return null;
    }

    // Hallucination Defense: Filter out any product IDs that were not in candidate pool
    const validRecommendations: RankedRecommendation[] = validated.data.recommendations
      .filter((rec) => candidatePoolMap.has(rec.productId))
      .map((rec) => ({
        productId: rec.productId,
        score: Math.min(Math.max(rec.score, 0), 1),
        reason: rec.reason,
      }));

    return validRecommendations.length > 0 ? validRecommendations : null;
  } catch (err: any) {
    console.warn('[AI Recommendation] Gemini API fallback triggered:', err.message || err);
    return null;
  }
};
