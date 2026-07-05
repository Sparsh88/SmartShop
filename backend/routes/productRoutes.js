import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  createProductReview, 
  getProductReviews,
  visualSearchProducts
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, upload.array('images', 5), createProduct);

router.post('/visual-search', upload.single('image'), visualSearchProducts);

router.route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, upload.array('images', 5), updateProduct)
  .delete(protect, adminOnly, deleteProduct);

router.route('/:id/reviews')
  .get(getProductReviews)
  .post(protect, createProductReview);

export default router;
