import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/db';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors';
import { sendEmail } from '../utils/email';
import { uploadToCloudinary } from '../middleware/uploadMiddleware';

// Zod schemas for input validation
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Helper: Generate Access Token
const generateAccessToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { id: userId, email, role },
    (process.env.JWT_ACCESS_SECRET || 'smartshop_super_secret_access_key_2026_jwt_token') as string,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' } as jwt.SignOptions
  );
};

// Helper: Generate Refresh Token
const generateRefreshToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { id: userId, email, role },
    (process.env.JWT_REFRESH_SECRET || 'smartshop_super_secret_refresh_key_2026_jwt_token') as string,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' } as jwt.SignOptions
  );
};

// 1. REGISTER
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return next(new ConflictError('Email address already registered'));
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Transaction to create User, Cart, and Wishlist
    const newUser = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          isVerified: true,
          verificationToken: null,
        },
      });

      await tx.cart.create({
        data: { userId: user.id },
      });

      await tx.wishlist.create({
        data: { userId: user.id },
      });

      return user;
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. VERIFY EMAIL
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return next(new BadRequestError('Email and verification code are required'));
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
        verificationToken: code,
      },
    });

    if (!user) {
      return next(new BadRequestError('Invalid verification code or email'));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id, user.email, user.role);

    // Save refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. LOGIN
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !(await bcrypt.compare(validatedData.password, user.password))) {
      return next(new UnauthorizedError('Invalid email or password'));
    }

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id, user.email, user.role);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. REFRESH TOKEN
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get refresh token from cookie or request body fallback
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return next(new UnauthorizedError('Refresh token is required'));
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'smartshop_super_secret_refresh_key_2026_jwt_token'
    ) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return next(new UnauthorizedError('User not found'));
    }

    const newAccessToken = generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user.id, user.email, user.role);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired refresh token. Please login again.'));
  }
};

// 5. LOGOUT
export const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 6. FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new BadRequestError('Email address is required'));
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new BadRequestError('No account with that email address exists'));
    }

    // Generate reset password token (random string + expiry)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpire: resetExpiry,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset Your Password - SmartShop',
        message: `Hello ${user.name},\n\nYou requested a password reset. Please click on the link below (or paste it into your browser) to reset your password:\n\n${resetUrl}\n\nThis link is valid for 1 hour.`,
        html: `
          <h3>Password Reset Request</h3>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });
    } catch (mailError) {
      console.error('Email sending failed during forgot password:', mailError);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

// 7. RESET PASSWORD
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const validatedData = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpire: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return next(new BadRequestError('Invalid or expired password reset token'));
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login.',
    });
  } catch (error) {
    next(error);
  }
};

// 8. UPDATE PROFILE
export const updateProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;

    if (!userId) return next(new BadRequestError('User not authenticated'));

    let avatarUrl = undefined;
    if (req.file) {
      avatarUrl = await uploadToCloudinary(req.file.path, 'avatars');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(avatarUrl && { avatar: avatarUrl }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 9. CHANGE PASSWORD
export const changePassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!userId) return next(new BadRequestError('User not authenticated'));
    if (!oldPassword || !newPassword) {
      return next(new BadRequestError('Old password and new password are required'));
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return next(new NotFoundError('User not found'));

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return next(new BadRequestError('Incorrect current password'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

