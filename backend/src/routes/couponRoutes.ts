import { Router } from 'express';
import {
  getCoupons,
  validateCoupon,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from '../controllers/couponController';
import { protect, authorize, optionalProtect } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// Retrieve valid coupons (Public/Customer gets active coupons, Admin gets all)
router.get('/', optionalProtect, getCoupons);
router.post('/validate', optionalProtect, validateCoupon);

// Admin-only operations
router.post('/', protect, authorize(Role.ADMIN), createCoupon);
router.put('/toggle/:id', protect, authorize(Role.ADMIN), toggleCouponStatus);
router.delete('/:id', protect, authorize(Role.ADMIN), deleteCoupon);

export default router;
