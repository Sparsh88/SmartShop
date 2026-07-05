import express from 'express';
import { 
  validateCoupon, 
  createCoupon, 
  getCouponsAdmin, 
  getActiveCoupons, 
  deleteCoupon 
} from '../controllers/couponController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getActiveCoupons)
  .post(protect, adminOnly, createCoupon);

router.post('/validate', protect, validateCoupon);
router.get('/admin', protect, adminOnly, getCouponsAdmin);
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;
