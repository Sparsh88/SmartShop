import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { z } from 'zod';

const couponCreateSchema = z.object({
  code: z.string().min(2, 'Coupon code must be at least 2 characters').toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.number().positive('Discount value must be positive'),
  minCartValue: z.number().nonnegative().default(0),
  expiryDate: z.string().transform((val: string) => new Date(val)),
});

// 1. GET ALL COUPONS (ADMINS SEE ALL, CUSTOMERS SEE ACTIVE)
export const getCoupons = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';

    const coupons = await prisma.coupon.findMany({
      where: isAdmin ? {} : { isActive: true, expiryDate: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

// 2. VALIDATE COUPON
export const validateCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { code, cartAmount } = req.body;

    if (!code || cartAmount === undefined) {
      return next(new BadRequestError('Coupon code and cart amount are required'));
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive || coupon.expiryDate < new Date()) {
      return next(new BadRequestError('Coupon is invalid or expired'));
    }

    if (cartAmount < coupon.minCartValue) {
      return next(
        new BadRequestError(
          `Minimum purchase of $${coupon.minCartValue} required to use this coupon`
        )
      );
    }

    res.status(200).json({
      success: true,
      message: 'Coupon code applied successfully',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. CREATE COUPON (ADMIN ONLY)
export const createCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = couponCreateSchema.parse(req.body);

    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCoupon) {
      return next(new BadRequestError('Coupon code already exists'));
    }

    const coupon = await prisma.coupon.create({
      data: validatedData,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// 4. TOGGLE COUPON STATUS (ADMIN ONLY)
export const toggleCouponStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return next(new NotFoundError('Coupon not found'));

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });

    res.status(200).json({
      success: true,
      message: `Coupon ${updatedCoupon.isActive ? 'activated' : 'deactivated'} successfully`,
      coupon: updatedCoupon,
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE COUPON (ADMIN ONLY)
export const deleteCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return next(new NotFoundError('Coupon not found'));

    await prisma.coupon.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
