import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Prisma middleware to scale product prices to match competitive Indian market rates
prisma.$use(async (params, next) => {
  const result = await next(params);

  if (!result) return result;

  // Only apply scaling for models containing products and read/write actions
  const modelsWithProducts = ['Product', 'CartItem', 'OrderItem', 'Cart', 'Order', 'Review', 'Wishlist'];
  const actionsToScale = ['findUnique', 'findFirst', 'findMany', 'create', 'update', 'upsert'];

  if (!params.model || !modelsWithProducts.includes(params.model) || !actionsToScale.includes(params.action)) {
    return result;
  }

  // Deep clone the query result so we are working with standard, mutable plain JS objects.
  // This avoids any 'TypeError: Cannot assign to read-only property' from Prisma model proxies.
  let clonedResult;
  try {
    clonedResult = JSON.parse(JSON.stringify(result));
  } catch (e) {
    clonedResult = result;
  }

  // Helper to recursively scale any product prices found in the result
  const scaleObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(scaleObject);
    }

    // Check if the object is a Product model (has price, discountPrice, and brand/name fields)
    if (typeof obj.price === 'number' && typeof obj.discountPrice === 'number' && 'brand' in obj) {
      // Scale by 0.4 (approx 60% reduction to align with Indian market competitive pricing)
      obj.price = Math.round(obj.price * 0.4);
      obj.discountPrice = Math.round(obj.discountPrice * 0.4);
    }

    // Recursively process nested properties (like in CartItem relations, OrderItem relations, etc.)
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = scaleObject(obj[key]);
      }
    }

    return obj;
  };

  return scaleObject(clonedResult);
});

export default prisma;
