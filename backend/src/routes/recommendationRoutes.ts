import { Router } from 'express';
import {
  getRecommendations,
  getRelatedRecommendations,
  getCartComplementaryRecommendations,
  trackEvent,
} from '../controllers/recommendationController';
import { optionalProtect } from '../middleware/authMiddleware';

const router = Router();

// Public / Authenticated Recommendation Endpoints (uses optional authentication)
router.get('/', optionalProtect, getRecommendations);
router.get('/product/:productId', optionalProtect, getRelatedRecommendations);
router.get('/cart', optionalProtect, getCartComplementaryRecommendations);
router.post('/track', optionalProtect, trackEvent);

export default router;
