import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  toggleBlockUser,
  deleteUser,
  updateOrderStatus,
  getAllOrders,
  getNotifications,
  markNotificationsRead,
} from '../controllers/adminController';
import { protect, authorize } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// General Notifications (any authenticated user can read their notifications)
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);

// Dashboard and User Management (Admin Only)
router.use(protect, authorize(Role.ADMIN));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/block/:id', toggleBlockUser);
router.delete('/users/:id', deleteUser);

router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);

export default router;
