import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect); // All wishlist routes require login

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

export default router;
