import { Router } from 'express';
import {
  getCoupons,
  validateCoupon,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from '../controllers/couponController';
import { protect, authorize } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// Retrieve valid coupons
router.get('/', protect, getCoupons);
router.post('/validate', protect, validateCoupon);

// Admin-only operations
router.post('/', protect, authorize(Role.ADMIN), createCoupon);
router.put('/toggle/:id', protect, authorize(Role.ADMIN), toggleCouponStatus);
router.delete('/:id', protect, authorize(Role.ADMIN), deleteCoupon);

export default router;
