import { Router } from 'express';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect); // All routes require login

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);

export default router;
