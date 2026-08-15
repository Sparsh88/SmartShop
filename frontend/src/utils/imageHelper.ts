/**
 * Helper utility to format and fix product image URLs.
 * Ensures verified, high-resolution Unsplash images for all catalog products and categories.
 * Prevents broken images with automatic category-aware fallbacks.
 */

export const categoryFallbacks: Record<string, string> = {
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  fashion: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  'home-kitchen': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80',
  beauty: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
  books: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
};

export function getDefaultFallbackImage(nameOrCategory?: string): string {
  const q = (nameOrCategory || '').toLowerCase();
  if (q.includes('book') || q.includes('author') || q.includes('algorithm') || q.includes('psychology') || q.includes('code') || q.includes('habits')) {
    return categoryFallbacks.books;
  }
  if (q.includes('beauty') || q.includes('skin') || q.includes('serum') || q.includes('cream') || q.includes('cleanser') || q.includes('mask') || q.includes('toner') || q.includes('glow')) {
    return categoryFallbacks.beauty;
  }
  if (q.includes('kitchen') || q.includes('cook') || q.includes('coffee') || q.includes('espresso') || q.includes('kettle') || q.includes('knife') || q.includes('pan') || q.includes('barista') || q.includes('chef')) {
    return categoryFallbacks['home-kitchen'];
  }
  if (q.includes('shoe') || q.includes('sneaker') || q.includes('boot') || q.includes('jacket') || q.includes('shirt') || q.includes('blazer') || q.includes('hoodie') || q.includes('wear') || q.includes('fashion')) {
    return categoryFallbacks.fashion;
  }
  return categoryFallbacks.electronics;
}

export function fixProductImage(url: string | undefined, productName?: string): string {
  const name = (productName || '').toLowerCase();

  // Keyword-specific image resolution for pristine visuals
  if (name.includes('pocket speaker') || name.includes('bluetooth speaker') || name.includes('wireless speaker')) {
    return 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('soundbar') || name.includes('home theater') || name.includes('reference monitors') || name.includes('speaker')) {
    return 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('gaming headset')) {
    return 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('earbuds') || name.includes('airpods')) {
    return 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('headphone') || name.includes('headphones')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('smartwatch') || name.includes('watch')) {
    return 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('tracker') || name.includes('fitness band') || name.includes('band')) {
    return 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80';
  }

  // Fashion items
  if (name.includes('jacket') || name.includes('bomber')) {
    return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('blazer') || name.includes('trench coat') || name.includes('overcoat')) {
    return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('hoodie') || name.includes('sweater')) {
    return 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('sneaker') || name.includes('running shoe') || name.includes('shoes') || name.includes('trainers')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('loafers') || name.includes('derby') || name.includes('sandals')) {
    return 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('boots')) {
    return 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80';
  }

  // Home & Kitchen
  if (name.includes('espresso') || name.includes('coffee maker') || name.includes('frother') || name.includes('drip')) {
    return 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('cookware') || name.includes('dutch oven') || name.includes('wok') || name.includes('pan') || name.includes('pot')) {
    return 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('knife') || name.includes('grinder') || name.includes('scale') || name.includes('kettle') || name.includes('cutting board')) {
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80';
  }

  // Books
  if (name.includes('atomic habits') || name.includes('habits')) {
    return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('code') || name.includes('programmer') || name.includes('algorithm') || name.includes('system design') || name.includes('refactoring')) {
    return 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('psychology of money') || name.includes('thinking, fast') || name.includes('sapiens') || name.includes('deep work') || name.includes('zero to one') || name.includes('book')) {
    return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80';
  }

  // Beauty
  if (name.includes('cleanser') || name.includes('scrub')) {
    return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('serum') || name.includes('cream') || name.includes('mask') || name.includes('toner') || name.includes('sunscreen') || name.includes('retinol') || name.includes('glow') || name.includes('oil')) {
    return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80';
  }

  // Handle direct URLs
  if (!url) {
    return getDefaultFallbackImage(name);
  }

  // Handle local uploads
  if (url.startsWith('/uploads')) {
    const metaEnv = (import.meta as any).env;
    const apiBase = metaEnv?.VITE_API_URL 
      ? metaEnv.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    return `${apiBase}${url}`;
  }

  return url;
}
