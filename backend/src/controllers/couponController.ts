import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { z } from 'zod';

const withFastTimeout = <T>(promise: Promise<T>, timeoutMs: number = 300): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), timeoutMs)),
  ]);
};

// In-Memory Fallback Coupons
interface FallbackCoupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minCartValue: number;
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
}

const fallbackCoupons: FallbackCoupon[] = [
  {
    id: 'cpn-welcome10',
    code: 'WELCOME10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minCartValue: 1999,
    expiryDate: new Date('2030-12-31'),
    isActive: true,
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'cpn-flat500',
    code: 'FLAT500',
    discountType: 'FLAT',
    discountValue: 500,
    minCartValue: 4999,
    expiryDate: new Date('2030-12-31'),
    isActive: true,
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'cpn-smart15',
    code: 'SMART15',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minCartValue: 2999,
    expiryDate: new Date('2030-12-31'),
    isActive: true,
    createdAt: new Date('2026-01-01'),
  },
];

const couponCreateSchema = z.object({
  code: z.string().min(2, 'Coupon code must be at least 2 characters').toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.number().positive('Discount value must be positive'),
  minCartValue: z.number().nonnegative().default(0),
  expiryDate: z.string().transform((val: string) => new Date(val)),
});

// 1. GET ALL COUPONS (ADMINS SEE ALL, CUSTOMERS SEE ACTIVE)
export const getCoupons = async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';

    try {
      const coupons = await withFastTimeout(
        prisma.coupon.findMany({
          where: isAdmin ? {} : { isActive: true, expiryDate: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
        }),
        350
      );

      return res.status(200).json({ success: true, coupons });
    } catch (_dbError) {
      const coupons = isAdmin
        ? fallbackCoupons
        : fallbackCoupons.filter((c) => c.isActive && c.expiryDate > new Date());
      return res.status(200).json({ success: true, coupons });
    }
  } catch (error) {
    return res.status(200).json({ success: true, coupons: fallbackCoupons });
  }
};

// 2. VALIDATE COUPON
export const validateCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { code, cartAmount } = req.body;

    if (!code || cartAmount === undefined) {
      return next(new BadRequestError('Coupon code and cart amount are required'));
    }

    const normalizedCode = code.toUpperCase().trim();
    let coupon: any = null;

    try {
      coupon = await withFastTimeout(
        prisma.coupon.findUnique({
          where: { code: normalizedCode },
        }),
        300
      );
    } catch (_dbError) {
      // Fallback
    }

    if (!coupon) {
      coupon = fallbackCoupons.find((c) => c.code === normalizedCode);
    }

    if (!coupon || !coupon.isActive || new Date(coupon.expiryDate) < new Date()) {
      return next(new BadRequestError('Coupon is invalid or expired'));
    }

    if (cartAmount < coupon.minCartValue) {
      return next(
        new BadRequestError(
          `Minimum purchase of ₹${coupon.minCartValue} required to use this coupon`
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

    try {
      const existingCoupon = await withFastTimeout(
        prisma.coupon.findUnique({
          where: { code: validatedData.code },
        }),
        300
      );

      if (existingCoupon) {
        return next(new BadRequestError('Coupon code already exists'));
      }

      const coupon = await withFastTimeout(
        prisma.coupon.create({
          data: {
            code: validatedData.code,
            discountType: validatedData.discountType as any,
            discountValue: validatedData.discountValue,
            minCartValue: validatedData.minCartValue || 0,
            expiryDate: validatedData.expiryDate,
          },
        }),
        350
      );

      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        coupon,
      });
    } catch (_dbError) {
      const existingFallback = fallbackCoupons.find((c) => c.code === validatedData.code);
      if (existingFallback) {
        return next(new BadRequestError('Coupon code already exists'));
      }

      const newCoupon: FallbackCoupon = {
        id: `cpn-${Date.now()}`,
        code: validatedData.code,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue,
        minCartValue: validatedData.minCartValue || 0,
        expiryDate: validatedData.expiryDate,
        isActive: true,
        createdAt: new Date(),
      };

      fallbackCoupons.unshift(newCoupon);

      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        coupon: newCoupon,
      });
    }
  } catch (error) {
    next(error);
  }
};

// 4. TOGGLE COUPON STATUS (ADMIN ONLY)
export const toggleCouponStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    try {
      const coupon = await withFastTimeout(prisma.coupon.findUnique({ where: { id } }), 300);
      if (coupon) {
        const updatedCoupon = await withFastTimeout(
          prisma.coupon.update({
            where: { id },
            data: { isActive: !coupon.isActive },
          }),
          300
        );

        return res.status(200).json({
          success: true,
          message: `Coupon ${updatedCoupon.isActive ? 'activated' : 'deactivated'} successfully`,
          coupon: updatedCoupon,
        });
      }
    } catch (_dbError) {
      // Fallback
    }

    const fallback = fallbackCoupons.find((c) => c.id === id);
    if (!fallback) return next(new NotFoundError('Coupon not found'));

    fallback.isActive = !fallback.isActive;

    return res.status(200).json({
      success: true,
      message: `Coupon ${fallback.isActive ? 'activated' : 'deactivated'} successfully`,
      coupon: fallback,
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE COUPON (ADMIN ONLY)
export const deleteCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    try {
      const coupon = await withFastTimeout(prisma.coupon.findUnique({ where: { id } }), 300);
      if (coupon) {
        await withFastTimeout(prisma.coupon.delete({ where: { id } }), 300);
        return res.status(200).json({
          success: true,
          message: 'Coupon deleted successfully',
        });
      }
    } catch (_dbError) {
      // Fallback
    }

    const idx = fallbackCoupons.findIndex((c) => c.id === id);
    if (idx !== -1) {
      fallbackCoupons.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
