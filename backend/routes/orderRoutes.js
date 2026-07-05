import express from 'express';
import { 
  createRazorpayOrder, 
  verifyPaymentAndPlaceOrder, 
  placeCodOrder, 
  getMyOrders, 
  getOrderById, 
  cancelOrder, 
  requestReturn, 
  updateOrderStatus,
  getAllOrdersAdmin
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, adminOnly, getAllOrdersAdmin);

router.post('/razorpay', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPaymentAndPlaceOrder);
router.post('/cod', protect, placeCodOrder);
router.get('/myorders', protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/return', protect, requestReturn);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
