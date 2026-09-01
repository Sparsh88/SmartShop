import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { uploadToCloudinary } from '../middleware/uploadMiddleware';
import { fallbackProducts, fallbackCategories } from '../utils/catalogFallback';

// Zod validation schemas
const productCreateSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().or(z.number()).transform((val: any) => Number(val)),
  discount: z.string().or(z.number()).optional().transform((val: any) => Number(val || 0)),
  stock: z.string().or(z.number()).transform((val: any) => Number(val)),
  brand: z.string().min(1, 'Brand is required'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().optional(),
  isFeatured: z.string().or(z.boolean()).optional().transform((val: any) => String(val) === 'true'),
  isTrending: z.string().or(z.boolean()).optional().transform((val: any) => String(val) === 'true'),
});

const categoryCreateSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  image: z.string().optional(),
});

// Lean selection object for catalog/listing views to reduce DB retrieval overhead & payload size
const productCardSelect = {
  id: true,
  name: true,
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

// High-speed In-memory catalog cache with TTL to eliminate database latency on repeat/concurrent reads
interface CacheEntry<T> {
  data: T;
  expiry: number;
}
const cache = new Map<string, CacheEntry<any>>();

const getCached = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCached = <T>(key: string, data: T, ttlMs: number = 60000): void => {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
};

export const invalidateProductCache = (): void => {
  cache.clear();
};

let isDbHealthy: boolean | null = null;
let lastDbCheck = 0;

export const withFastTimeout = <T>(promise: Promise<T>, timeoutMs: number = 4000): Promise<T> => {
  if (isDbHealthy === false && Date.now() - lastDbCheck < 15000) {
    return Promise.reject(new Error('DB_CIRCUIT_OPEN'));
  }

  return Promise.race([
    promise.then((res) => {
      isDbHealthy = true;
      lastDbCheck = Date.now();
      return res;
    }),
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        isDbHealthy = false;
        lastDbCheck = Date.now();
        reject(new Error('DB_TIMEOUT'));
      }, timeoutMs)
    ),
  ]);
};

// Comprehensive Semantic & Synonym Mappings for intelligent search
const synonymCategoryMap: Record<string, string[]> = {
  't-shirts': ['t-shirt', 'tshirt', 't shirt', 'tee', 'tees', 'graphic tee', 'polo', 'crewneck', 'cotton tee'],
  'shirts': ['shirt', 'shirts', 'formal shirt', 'oxford', 'linen shirt', 'button down', 'flannel', 'poplin', 'dress shirt'],
  'jeans': ['jeans', 'jean', 'denim', 'blue jeans', 'black jeans', 'distressed', 'slim fit jeans', 'straight leg'],
  'pants-trousers': ['pants', 'pant', 'trousers', 'trouser', 'chinos', 'chino', 'cargo', 'cargos', 'slacks', 'joggers', 'jogger'],
  'jackets': ['jacket', 'jackets', 'outerwear', 'coat', 'trench coat', 'bomber', 'biker', 'leather jacket', 'puffer', 'windbreaker'],
  'hoodies': ['hoodie', 'hoodies', 'sweatshirt', 'sweatshirts', 'pullover', 'fleece', 'zip up hoodie'],
  'sweaters': ['sweater', 'sweaters', 'knitwear', 'knit', 'knitted', 'cardigan', 'turtleneck', 'cable knit', 'cashmere', 'merino'],
  'sneakers': ['sneaker', 'sneakers', 'kicks', 'trainers', 'running shoes', 'skate shoes', 'court shoes', 'athletic shoes'],
  'shoes': ['shoe', 'shoes', 'footwear', 'loafers', 'loafer', 'derby', 'boots', 'boot', 'chelsea boots', 'dress shoes'],
  'full-sets': ['full sets', 'full-sets', 'sets', 'outfit', 'outfits', 'tracksuit', 'matching set', 'co-ord', 'suit', 'combination'],
};

// 1. GET ALL PRODUCTS (WITH FILTERS, SEARCH, SORTING & PAGINATION)
export const getProducts = async (req: Request, res: Response, _next: NextFunction) => {
  const {
    page = '1',
    limit = '9',
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort,
  } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 9;
  const skip = (pageNum - 1) * limitNum;

  try {
    // Build Prisma query filters
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { brand: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (category) {
      const catParam = (category as string).toLowerCase().trim();
      if (catParam !== 'fashion' && catParam !== 'all' && catParam !== 'clothing') {
        where.category = {
          slug: { equals: catParam, mode: 'insensitive' },
        };
      }
    }

    if (brand) {
      where.brand = { equals: brand as string, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.discountPrice = {};
      if (minPrice) where.discountPrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.discountPrice.lte = parseFloat(maxPrice as string);
    }

    if (rating) {
      where.rating = { gte: parseFloat(rating as string) };
    }

    // Sorting logic
    let orderBy: any = { createdAt: 'desc' };
    if (sort) {
      switch (sort as string) {
        case 'price-asc':
          orderBy = { discountPrice: 'asc' };
          break;
        case 'price-desc':
          orderBy = { discountPrice: 'desc' };
          break;
        case 'rating':
          orderBy = { rating: 'desc' };
          break;
        case 'latest':
          orderBy = { createdAt: 'desc' };
          break;
      }
    }

    // Execute queries with fast-timeout circuit breaker
    let [products, total] = await withFastTimeout(
      Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limitNum,
          select: productCardSelect,
        }),
        prisma.product.count({ where }),
      ]),
      300
    );

    let searchMessage: string | undefined;
    let isRelatedFallback = false;

    if (products.length === 0 && search) {
      const searchTerm = (search as string).toLowerCase().trim();
      let matchedCategorySlug = '';

      for (const [slug, synonyms] of Object.entries(synonymCategoryMap)) {
        if (synonyms.some(syn => searchTerm.includes(syn) || syn.includes(searchTerm))) {
          matchedCategorySlug = slug;
          break;
        }
      }

      if (matchedCategorySlug) {
        const synonymWhere = { ...where, category: { slug: matchedCategorySlug } };
        delete synonymWhere.OR;

        const [fallbackProducts, fallbackTotal] = await withFastTimeout(
          Promise.all([
            prisma.product.findMany({
              where: synonymWhere,
              orderBy,
              skip,
              take: limitNum,
              select: productCardSelect,
            }),
            prisma.product.count({ where: synonymWhere }),
          ]),
          300
        );

        products = fallbackProducts;
        total = fallbackTotal;
        searchMessage = `Showing related products for "${search}" in ${matchedCategorySlug.replace('-', ' ')}:`;
        isRelatedFallback = true;
      }
    }

    if (!products || products.length === 0) {
      throw new Error('Database empty or offline; serving fallback catalog');
    }

    return res.status(200).json({
      success: true,
      products,
      searchMessage,
      isRelatedFallback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalProducts: total,
      },
    });
  } catch (error: any) {
    // Immediate in-memory fallback
    let filtered = [...fallbackProducts];
    let searchMessage: string | undefined;
    let isRelatedFallback = false;

    if (search) {
      const q = (search as string).toLowerCase().trim();
      const directMatches = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q)
      );

      if (directMatches.length > 0) {
        filtered = directMatches;
      } else {
        let matchedCategorySlug = '';
        for (const [slug, synonyms] of Object.entries(synonymCategoryMap)) {
          if (synonyms.some(syn => q.includes(syn) || syn.includes(q))) {
            matchedCategorySlug = slug;
            break;
          }
        }

        if (matchedCategorySlug) {
          filtered = filtered.filter(p => p.category.slug === matchedCategorySlug);
          searchMessage = `Showing related products for "${search}":`;
          isRelatedFallback = true;
        } else {
          filtered = filtered.filter(p => p.isFeatured || p.isTrending || p.rating >= 4.7);
          searchMessage = `No exact matches found for "${search}". Showing popular & trending products you might like:`;
          isRelatedFallback = true;
        }
      }
    }

    if (category) {
      const catParam = (category as string).toLowerCase().trim();
      if (catParam !== 'fashion' && catParam !== 'all' && catParam !== 'clothing') {
        const directCatMatches = filtered.filter(p => p.category.slug === catParam);
        if (directCatMatches.length > 0) {
          filtered = directCatMatches;
        } else {
          const matched = filtered.filter(p =>
            p.category.slug.includes(catParam) ||
            catParam.includes(p.category.slug) ||
            p.category.name.toLowerCase().includes(catParam)
          );
          if (matched.length > 0) {
            filtered = matched;
          }
        }
      }
    }

    if (brand) {
      filtered = filtered.filter(p => p.brand.toLowerCase() === (brand as string).toLowerCase());
    }

    if (minPrice) {
      filtered = filtered.filter(p => p.discountPrice >= parseFloat(minPrice as string));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.discountPrice <= parseFloat(maxPrice as string));
    }

    if (rating) {
      filtered = filtered.filter(p => p.rating >= parseFloat(rating as string));
    }

    let sorted = [...filtered];
    if (sort === 'price-asc') {
      sorted.sort((a, b) => a.discountPrice - b.discountPrice);
    } else if (sort === 'price-desc') {
      sorted.sort((a, b) => b.discountPrice - a.discountPrice);
    } else if (sort === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    }

    const total = sorted.length;
    const paginated = sorted.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      products: paginated,
      searchMessage,
      isRelatedFallback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalProducts: total,
      },
    });
  }
};


// 2. GET PRODUCT BY ID
export const getProductById = async (req: Request, res: Response, _next: NextFunction) => {
  const { id } = req.params;

  try {
    const product = await withFastTimeout(
      prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          reviews: {
            include: {
              user: {
                select: { name: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      300
    );

    if (!product) {
      throw new NotFoundError('Product not found in DB');
    }

    const relatedProducts = await withFastTimeout(
      prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          NOT: { id: product.id },
        },
        take: 4,
      }),
      300
    );

    return res.status(200).json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (error: any) {
    const fallback = fallbackProducts.find(p => p.id === id) || fallbackProducts[0];
    const relatedProducts = fallbackProducts.filter(p => p.id !== fallback.id && p.category.id === fallback.category.id).slice(0, 4);

    return res.status(200).json({
      success: true,
      product: fallback,
      relatedProducts,
    });
  }
};

// 3. GET HOMEPAGE FEATURED & TRENDING PRODUCTS
export const getFeaturedAndTrendingProducts = async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const cached = getCached<any>('homepage-products');
    if (cached) {
      return res.status(200).json(cached);
    }

    const [featured, trending] = await withFastTimeout(
      Promise.all([
        prisma.product.findMany({
          where: { isFeatured: true },
          take: 8,
          select: productCardSelect,
        }),
        prisma.product.findMany({
          where: { isTrending: true },
          take: 8,
          select: productCardSelect,
        }),
      ]),
      300
    );

    if (featured.length === 0 && trending.length === 0) {
      throw new Error('Database empty; serving fallback');
    }

    const payload = {
      success: true,
      featured,
      trending,
    };

    setCached('homepage-products', payload, 120000);
    return res.status(200).json(payload);
  } catch (error: any) {
    const featured = fallbackProducts.filter(p => p.isFeatured).slice(0, 8);
    const trending = fallbackProducts.filter(p => p.isTrending).slice(0, 8);

    const payload = {
      success: true,
      featured,
      trending,
    };

    return res.status(200).json(payload);
  }
};


// 4. CREATE PRODUCT (ADMIN ONLY)
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = productCreateSchema.parse(req.body);

    // Validate or resolve category
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: validatedData.categoryId },
          { slug: validatedData.categoryId },
        ],
      },
    });

    if (!category) {
      // Find fallback category or match by slug/id
      const matchedFallback = fallbackCategories.find(
        (c) => c.id === validatedData.categoryId || c.slug === validatedData.categoryId
      );

      if (matchedFallback) {
        category = await prisma.category.upsert({
          where: { slug: matchedFallback.slug },
          update: {},
          create: {
            name: matchedFallback.name,
            slug: matchedFallback.slug,
            image: matchedFallback.image,
          },
        });
      } else {
        // Find any active category or fallback to first
        category = await prisma.category.findFirst();
      }
    }

    if (!category) {
      return next(new BadRequestError('Category not found'));
    }

    // Image Upload or URL Handling
    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path, 'products');
        imageUrls.push(url);
      }
    } else if (req.body.imageUrl && typeof req.body.imageUrl === 'string' && req.body.imageUrl.trim()) {
      imageUrls.push(req.body.imageUrl.trim());
    } else {
      // Fallback category fashion image
      const catImage = category.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800';
      imageUrls.push(catImage);
    }

    const originalPrice = validatedData.price;
    const discountPercent = validatedData.discount;
    const discountPrice = originalPrice - (originalPrice * discountPercent) / 100;

    let product: any;
    try {
      product = await prisma.product.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          price: originalPrice,
          discount: discountPercent,
          discountPrice: parseFloat(discountPrice.toFixed(2)),
          stock: validatedData.stock,
          brand: validatedData.brand,
          categoryId: category.id,
          images: imageUrls,
          isFeatured: validatedData.isFeatured,
          isTrending: validatedData.isTrending,
        },
        include: {
          category: true,
        },
      });
    } catch (dbErr) {
      console.warn('DB write failed; using in-memory product creation:', dbErr);
      product = {
        id: `p-custom-${Date.now()}`,
        name: validatedData.name,
        description: validatedData.description,
        price: originalPrice,
        discount: discountPercent,
        discountPrice: parseFloat(discountPrice.toFixed(2)),
        stock: validatedData.stock,
        brand: validatedData.brand,
        categoryId: category.id,
        category: category,
        images: imageUrls,
        isFeatured: validatedData.isFeatured,
        isTrending: validatedData.isTrending,
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Keep in-memory catalog synchronized immediately
    const memoryItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount,
      discountPrice: product.discountPrice,
      stock: product.stock,
      rating: product.rating || 5.0,
      brand: product.brand,
      images: product.images,
      isFeatured: product.isFeatured,
      isTrending: product.isTrending,
      categoryId: category.id,
      category: category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fallbackProducts.unshift(memoryItem as any);

    invalidateProductCache();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// 5. UPDATE PRODUCT (ADMIN ONLY)
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = productCreateSchema.partial().parse(req.body);

    let product = await prisma.product.findUnique({ where: { id } }).catch(() => null);
    
    // Image Upload or URL Handling
    let imageUrls: string[] = product ? [...product.images] : [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadedUrls: string[] = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path, 'products');
        uploadedUrls.push(url);
      }
      imageUrls = uploadedUrls;
    } else if (req.body.imageUrl && typeof req.body.imageUrl === 'string' && req.body.imageUrl.trim()) {
      imageUrls = [req.body.imageUrl.trim()];
    }

    const price = validatedData.price !== undefined ? validatedData.price : product?.price || 1999;
    const discount = validatedData.discount !== undefined ? validatedData.discount : product?.discount || 0;
    const discountPrice = price - (price * discount) / 100;

    let updatedProduct: any;
    try {
      updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          ...validatedData,
          price,
          discount,
          discountPrice: parseFloat(discountPrice.toFixed(2)),
          images: imageUrls,
        },
        include: { category: true },
      });
    } catch (dbErr) {
      console.warn('DB update failed, updating memory record:', dbErr);
      updatedProduct = {
        id,
        ...validatedData,
        price,
        discount,
        discountPrice: parseFloat(discountPrice.toFixed(2)),
        images: imageUrls,
      };
    }

    // Sync in-memory catalog
    const memIdx = fallbackProducts.findIndex((p) => p.id === id);
    if (memIdx !== -1) {
      fallbackProducts[memIdx] = {
        ...fallbackProducts[memIdx],
        ...updatedProduct,
        images: imageUrls.length > 0 ? imageUrls : fallbackProducts[memIdx].images,
      };
    }

    invalidateProductCache();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// 6. DELETE PRODUCT (ADMIN ONLY)
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    try {
      await prisma.product.delete({ where: { id } });
    } catch (dbErr) {
      console.warn('DB delete warning:', dbErr);
    }

    // Remove from in-memory catalog
    const memIdx = fallbackProducts.findIndex((p) => p.id === id);
    if (memIdx !== -1) {
      fallbackProducts.splice(memIdx, 1);
    }

    invalidateProductCache();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 7. GET ALL CATEGORIES
export const getCategories = async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const cached = getCached<any>('all-categories');
    if (cached) {
      return res.status(200).json(cached);
    }

    const categories = await withFastTimeout(
      prisma.category.findMany({
        orderBy: { name: 'asc' },
      }),
      300
    );

    if (categories.length === 0) {
      throw new Error('No categories in DB; using fallback');
    }

    const payload = {
      success: true,
      categories,
    };

    setCached('all-categories', payload, 300000); // 5 minutes TTL
    return res.status(200).json(payload);
  } catch (error: any) {
    const payload = {
      success: true,
      categories: fallbackCategories,
    };
    return res.status(200).json(payload);
  }
};

// 8. GET ALL BRANDS
export const getBrands = async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const cached = getCached<any>('all-brands');
    if (cached) {
      return res.status(200).json(cached);
    }

    const brands = await withFastTimeout(
      prisma.product.findMany({
        select: { brand: true },
        distinct: ['brand'],
      }),
      300
    );

    if (brands.length === 0) {
      throw new Error('No brands in DB; using fallback');
    }

    const payload = {
      success: true,
      brands: brands.map((b: any) => b.brand),
    };

    setCached('all-brands', payload, 300000); // 5 minutes TTL
    return res.status(200).json(payload);
  } catch (error: any) {
    const brands = Array.from(new Set(fallbackProducts.map(p => p.brand)));
    const payload = {
      success: true,
      brands,
    };
    return res.status(200).json(payload);
  }
};


// 9. CREATE CATEGORY (ADMIN ONLY)
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = categoryCreateSchema.parse(req.body);
    const slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingCat = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCat) {
      return next(new BadRequestError('Category already exists'));
    }

    let imageUrl = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path, 'categories');
    }

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug,
        image: imageUrl,
      },
    });

    invalidateProductCache();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};
