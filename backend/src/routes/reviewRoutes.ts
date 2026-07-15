import { Router } from 'express';
import { addProductReview, getProductReviews, deleteReview } from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public: View reviews
router.get('/product/:productId', getProductReviews);

// Protected: Write or delete review
router.post('/', protect, addProductReview);
router.delete('/:id', protect, deleteReview);

export default router;
