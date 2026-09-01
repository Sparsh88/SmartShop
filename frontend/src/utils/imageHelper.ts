/**
 * Helper utility to format and fix product image URLs.
 * Ensures verified, high-resolution Unsplash images for all fashion catalog products and categories.
 * Prevents broken images with automatic category-aware fallbacks.
 */

export const categoryFallbacks: Record<string, string> = {
  't-shirts': '/uploads/black-crewneck-tee.jpg',
  'shirts': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
  'jeans': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
  'pants-trousers': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80',
  'jackets': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
  'hoodies': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80',
  'sweaters': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80',
  'sneakers': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80',
  'shoes': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80',
  'full-sets': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
};

export function getDefaultFallbackImage(categoryOrSlug?: string): string {
  const key = (categoryOrSlug || '').toLowerCase();
  for (const [slug, img] of Object.entries(categoryFallbacks)) {
    if (key.includes(slug)) return img;
  }
  return categoryFallbacks.default;
}

export function fixProductImage(url: string | undefined, productName?: string): string {
  // If product has its own custom image URL, respect and use it directly
  if (url && url.startsWith('http')) {
    return url;
  }

  // Handle local uploads
  if (url && url.startsWith('/uploads')) {
    const metaEnv = (import.meta as any).env;
    const apiBase = metaEnv?.VITE_API_URL 
      ? metaEnv.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    return `${apiBase}${url}`;
  }

  const name = (productName || '').toLowerCase();

  // Category-specific fallbacks based on name keywords if no image URL is given
  if (name.includes('jacket') || name.includes('bomber') || name.includes('biker') || name.includes('puffer') || name.includes('windbreaker')) {
    return categoryFallbacks.jackets;
  }
  if (name.includes('hoodie') || name.includes('sweatshirt')) {
    return categoryFallbacks.hoodies;
  }
  if (name.includes('sweater') || name.includes('cardigan') || name.includes('knit') || name.includes('turtleneck')) {
    return categoryFallbacks.sweaters;
  }
  if (name.includes('t-shirt') || name.includes('tee') || name.includes('polo')) {
    return categoryFallbacks['t-shirts'];
  }
  if (name.includes('shirt') || name.includes('flannel') || name.includes('oxford') || name.includes('poplin')) {
    return categoryFallbacks.shirts;
  }
  if (name.includes('jeans') || name.includes('denim')) {
    return categoryFallbacks.jeans;
  }
  if (name.includes('chinos') || name.includes('pants') || name.includes('trousers') || name.includes('jogger') || name.includes('cargo')) {
    return categoryFallbacks['pants-trousers'];
  }
  if (name.includes('sneaker') || name.includes('trainers') || name.includes('running')) {
    return categoryFallbacks.sneakers;
  }
  if (name.includes('loafers') || name.includes('derby') || name.includes('boot') || name.includes('shoes')) {
    return categoryFallbacks.shoes;
  }
  if (name.includes('set') || name.includes('outfit') || name.includes('tracksuit')) {
    return categoryFallbacks['full-sets'];
  }

  return categoryFallbacks.default;
}
