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

const router = Router();

// Public Routes
router.get('/', getProducts);
router.get('/home', getFeaturedAndTrendingProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/:id', getProductById);

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
