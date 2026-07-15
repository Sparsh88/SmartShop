/**
 * Helper utility to format product image URLs.
 * Handles fixing broken Unsplash image URLs and resolving uploads paths.
 * Registers unique, active Unsplash images for each of the 30 seeded catalog items.
 */
export function fixProductImage(url: string | undefined, productName?: string): string {
  if (!url) {
    // Fallback default placeholder
    return 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600';
  }

  const name = productName?.toLowerCase() || '';

  // 1. Books (Penguin Books)
  if (name.includes('atomic habits')) {
    return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('thinking, fast')) {
    return 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('power of habit')) {
    return 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('clean code')) {
    return 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('pragmatic programmer')) {
    return 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('algorithms')) {
    return 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80';
  }

  // 2. Skincare Cosmetics (GlowRx)
  if (name.includes('gentle cleanser') || name.includes('cleanser')) {
    return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('retinol cream') || name.includes('retinol')) {
    return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('brightening mask')) {
    return 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('niacinamide')) {
    return 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('scrub')) {
    return 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('eye gel')) {
    return 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('night oil') || name.includes('recovery oil')) {
    return 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('face serum') || name.includes('hyaluronic')) {
    return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80';
  }

  // 3. Home Appliances (BaristaCo)
  if (name.includes('espresso')) {
    return 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('frother')) {
    return 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80';
  }

  // 4. Audio Gear (AcousticPro)
  if (name.includes('anc headphones') || name.includes('studio headphones')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('gaming headset')) {
    return 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('earbuds pro')) {
    return 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('active earphones') || name.includes('earphones')) {
    return 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('neckband')) {
    return 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('pocket speaker')) {
    return 'https://images.unsplash.com/photo-1589256469067-ea00e21cbdb9?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('bluetooth speaker')) {
    return 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('soundbar')) {
    return 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('microphone') || name.includes('mic')) {
    return 'https://images.unsplash.com/photo-1590608897129-79da98d15969?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('reference monitors') || name.includes('speakers')) {
    return 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=600&auto=format&fit=crop&q=80';
  }

  // 5. Smart Wearables (FitVibe)
  if (name.includes('smartwatch')) {
    return 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('tracker band') || name.includes('fitness band')) {
    return 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80';
  }

  // 6. Shoes (StepUp)
  if (name.includes('sneakers')) {
    return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('running shoes') || name.includes('shoes')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
  }

  // Handle the default broken espresso maker URL mapping
  if (url.includes('photo-1517256064527-09c53b2d0bc6')) {
    return 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=600&auto=format&fit=crop&q=80';
  }

  // Handle static uploads path
  if (url.startsWith('/uploads')) {
    const metaEnv = (import.meta as any).env;
    const apiBase = metaEnv?.VITE_API_URL 
      ? metaEnv.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    return `${apiBase}${url}`;
  }

  return url;
}
