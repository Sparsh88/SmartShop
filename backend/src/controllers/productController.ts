import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { uploadToCloudinary } from '../middleware/uploadMiddleware';

// Zod validation schemas
const productCreateSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().or(z.number()).transform((val: any) => Number(val)),
  discount: z.string().or(z.number()).optional().transform((val: any) => Number(val || 0)),
  stock: z.string().or(z.number()).transform((val: any) => Number(val)),
  brand: z.string().min(1, 'Brand is required'),
  categoryId: z.string().uuid('Invalid Category ID'),
  isFeatured: z.string().or(z.boolean()).optional().transform((val: any) => String(val) === 'true'),
  isTrending: z.string().or(z.boolean()).optional().transform((val: any) => String(val) === 'true'),
});

const categoryCreateSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  image: z.string().optional(),
});

// 1. GET ALL PRODUCTS (WITH FILTERS, SEARCH, SORTING & PAGINATION)
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

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
      where.category = {
        slug: category as string,
      };
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
    let orderBy: any = { createdAt: 'desc' }; // Default: Latest
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

    // Execute query in transaction to get total counts as well
    let [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // If search term returned 0 results, check for category synonyms
    if (products.length === 0 && search) {
      const searchTerm = (search as string).toLowerCase().trim();
      
      // Synonym mappings matching category slugs
      const categorySynonyms: Record<string, string[]> = {
        'electronics': ['electronics', 'headphone', 'headphones', 'speaker', 'speakers', 'earphone', 'earphones', 'earbuds', 'soundbar', 'microphone', 'mic', 'watch', 'smartwatch', 'tracker', 'device', 'gadgets', 'phone', 'laptop', 'tv', 'led'],
        'fashion': ['fashion', 'clothes', 'clothing', 'tshirt', 'shirt', 'sneaker', 'shoes', 'sneakers', 'shoe', 'wear', 'apparel', 'outfit', 'garment', 'pant', 'jeans', 'jacket'],
        'home-kitchen': ['home-kitchen', 'kitchen', 'home', 'appliances', 'appliance', 'espresso', 'coffee', 'maker', 'frother', 'kettle', 'cup', 'mug', 'cook', 'oven', 'stove', 'pan', 'fridge'],
        'books': ['books', 'book', 'novel', 'textbook', 'reading', 'paperback', 'author', 'habits', 'programming', 'code', 'algorithms', 'read', 'literature', 'study'],
        'beauty': ['beauty', 'skincare', 'cosmetic', 'cosmetics', 'serum', 'cleanser', 'retinol', 'cream', 'mask', 'scrub', 'oil', 'gel', 'makeup', 'lipstick', 'lotion', 'face']
      };

      // Find if any category synonym matches the search term
      let matchedCategorySlug = '';
      for (const [slug, synonyms] of Object.entries(categorySynonyms)) {
        if (synonyms.some(syn => searchTerm.includes(syn) || syn.includes(searchTerm))) {
          matchedCategorySlug = slug;
          break;
        }
      }

      if (matchedCategorySlug) {
        // Build a new where clause targeting the matched category slug
        const synonymWhere = {
          ...where,
        };
        // Remove the original OR text search
        delete synonymWhere.OR;
        // Inject the matched category filter
        synonymWhere.category = {
          slug: matchedCategorySlug
        };

        // Query again using the category slug fallback
        const [fallbackProducts, fallbackTotal] = await prisma.$transaction([
          prisma.product.findMany({
            where: synonymWhere,
            orderBy,
            skip,
            take: limitNum,
            include: {
              category: {
                select: { name: true, slug: true },
              },
            },
          }),
          prisma.product.count({ where: synonymWhere }),
        ]);

        products = fallbackProducts;
        total = fallbackTotal;
      }
    }

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalProducts: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET PRODUCT BY ID
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
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
    });

    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    // Fetch related products (same category, excluding current product)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        NOT: { id: product.id },
      },
      take: 4,
    });

    res.status(200).json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET HOMEPAGE FEATURED & TRENDING PRODUCTS
export const getFeaturedAndTrendingProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const featured = await prisma.product.findMany({
      where: { isFeatured: true },
      take: 8,
      include: { category: true },
    });

    const trending = await prisma.product.findMany({
      where: { isTrending: true },
      take: 8,
      include: { category: true },
    });

    res.status(200).json({
      success: true,
      featured,
      trending,
    });
  } catch (error) {
    next(error);
  }
};

// 4. CREATE PRODUCT (ADMIN ONLY)
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = productCreateSchema.parse(req.body);

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });
    if (!category) {
      return next(new BadRequestError('Invalid Category ID'));
    }

    // Image Upload Handling
    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path, 'products');
        imageUrls.push(url);
      }
    } else {
      // Dummy fallback image if no image is uploaded
      imageUrls.push('https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600');
    }

    const originalPrice = validatedData.price;
    const discountPercent = validatedData.discount;
    const discountPrice = originalPrice - (originalPrice * discountPercent) / 100;

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: originalPrice,
        discount: discountPercent,
        discountPrice: parseFloat(discountPrice.toFixed(2)),
        stock: validatedData.stock,
        brand: validatedData.brand,
        categoryId: validatedData.categoryId,
        images: imageUrls,
        isFeatured: validatedData.isFeatured,
        isTrending: validatedData.isTrending,
      },
    });

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

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    // Image Upload Handling
    const imageUrls: string[] = [...product.images];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Replace existing or append? We'll replace/add new ones
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path, 'products');
        imageUrls.push(url);
      }
    }

    const price = validatedData.price !== undefined ? validatedData.price : product.price;
    const discount = validatedData.discount !== undefined ? validatedData.discount : product.discount;
    const discountPrice = price - (price * discount) / 100;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...validatedData,
        price,
        discount,
        discountPrice: parseFloat(discountPrice.toFixed(2)),
        images: imageUrls,
      },
    });

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

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 7. GET ALL CATEGORIES
export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// 8. GET ALL BRANDS
export const getBrands = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await prisma.product.findMany({
      select: { brand: true },
      distinct: ['brand'],
    });

    res.status(200).json({
      success: true,
      brands: brands.map((b: any) => b.brand),
    });
  } catch (error) {
    next(error);
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

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};
