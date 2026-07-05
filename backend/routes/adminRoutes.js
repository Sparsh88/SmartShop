import express from 'express';
import { 
  getDashboardAnalytics, 
  getAllUsersAdmin, 
  updateUserRoleAdmin, 
  deleteUserAdmin 
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', protect, adminOnly, getDashboardAnalytics);
router.get('/users', protect, adminOnly, getAllUsersAdmin);
router.put('/users/:id/role', protect, adminOnly, updateUserRoleAdmin);
router.delete('/users/:id', protect, adminOnly, deleteUserAdmin);

export default router;
