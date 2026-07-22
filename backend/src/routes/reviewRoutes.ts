import { Router } from 'express';
import { addProductReview, getProductReviews, deleteReview } from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';
import { cacheControl } from '../middleware/cacheMiddleware';

const router = Router();

// Public: View reviews (Cached for 5 minutes)
router.get('/product/:productId', cacheControl(300), getProductReviews);

// Protected: Write or delete review
router.post('/', protect, addProductReview);
router.delete('/:id', protect, deleteReview);

export default router;
