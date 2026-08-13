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

  // Fast recursive scaler with shallow copy on mutation to avoid heavy JSON.stringify/parse overhead
  const scaleObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(scaleObject);
    }

    if (obj instanceof Date) return obj;

    // Check if the object is a Product model (has price, discountPrice, and brand/name fields)
    if (typeof obj.price === 'number' && typeof obj.discountPrice === 'number' && 'brand' in obj) {
      const cloned = { ...obj };
      cloned.price = Math.round(obj.price * 0.4);
      cloned.discountPrice = Math.round(obj.discountPrice * 0.4);
      for (const key of Object.keys(cloned)) {
        if (typeof cloned[key] === 'object' && cloned[key] !== null) {
          cloned[key] = scaleObject(cloned[key]);
        }
      }
      return cloned;
    }

    const copy = { ...obj };
    for (const key of Object.keys(copy)) {
      if (typeof copy[key] === 'object' && copy[key] !== null) {
        copy[key] = scaleObject(copy[key]);
      }
    }
    return copy;
  };

  return scaleObject(result);
});

export default prisma;
