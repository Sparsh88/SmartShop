import express from 'express';
import { 
  registerUser, 
  loginUser, 
  googleLogin, 
  forgotPassword, 
  resetPassword, 
  getUserProfile, 
  updateUserProfile 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('profilePic'), updateUserProfile);

export default router;
