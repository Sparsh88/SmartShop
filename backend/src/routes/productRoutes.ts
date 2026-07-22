import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getFeaturedAndTrendingProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  createCategory,
} from '../controllers/productController';
import { protect, authorize } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';
import { upload } from '../middleware/uploadMiddleware';
import { cacheControl } from '../middleware/cacheMiddleware';

const router = Router();

// Public Routes with Edge Caching (s-maxage)
router.get('/', cacheControl(300), getProducts); // 5 minutes cache
router.get('/home', cacheControl(600), getFeaturedAndTrendingProducts); // 10 minutes cache
router.get('/categories', cacheControl(3600), getCategories); // 1 hour cache
router.get('/brands', cacheControl(3600), getBrands); // 1 hour cache
router.get('/:id', cacheControl(300), getProductById); // 5 minutes cache

// Admin Protected Routes
router.post(
  '/',
  protect,
  authorize(Role.ADMIN),
  upload.array('images', 5),
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize(Role.ADMIN),
  upload.array('images', 5),
  updateProduct
);

router.delete('/:id', protect, authorize(Role.ADMIN), deleteProduct);

router.post(
  '/categories',
  protect,
  authorize(Role.ADMIN),
  upload.single('image'),
  createCategory
);

export default router;
