import express from 'express';
import { 
  getCategories, 
  createCategory, 
  deleteCategory,
  getBanners,
  getAllBannersAdmin,
  createBanner,
  deleteBanner
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Categories
router.route('/categories')
  .get(getCategories)
  .post(protect, adminOnly, upload.single('image'), createCategory);

router.delete('/categories/:id', protect, adminOnly, deleteCategory);

// Banners
router.route('/banners')
  .get(getBanners)
  .post(protect, adminOnly, upload.single('image'), createBanner);

router.get('/banners/admin', protect, adminOnly, getAllBannersAdmin);
router.delete('/banners/:id', protect, adminOnly, deleteBanner);

export default router;
