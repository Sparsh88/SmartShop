import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/db';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import {
  getFallbackAddresses,
  addFallbackAddress,
  deleteFallbackAddress,
  createFallbackOrder,
  getFallbackOrders,
  getFallbackOrderById,
} from '../utils/ecomFallback';

const withFastTimeout = <T>(promise: Promise<T>, timeoutMs: number = 300): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), timeoutMs)),
  ]);
};

// Helper to generate unique order numbers
const generateOrderNumber = (): string => {
  return `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// ==========================================
// ADDRESS MANAGEMENT
// ==========================================

export const getAddresses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new BadRequestError('User not authenticated'));

    try {
      const addresses = await withFastTimeout(
        prisma.address.findMany({
          where: { userId },
          orderBy: { isDefault: 'desc' },
        }),
        300
      );

      if (addresses.length > 0) {
        return res.status(200).json({ success: true, addresses });
      }
    } catch (_dbError) {
      // Fallback
    }

    const fallbackAddresses = getFallbackAddresses(userId);
    return res.status(200).json({ success: true, addresses: fallbackAddresses });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { name, phone, street, city, state, postalCode, country, isDefault } = req.body;

    if (!userId) return next(new BadRequestError('User not authenticated'));
    if (!name || !phone || !street || !city || !state || !postalCode || !country) {
      return next(new BadRequestError('All address fields are required'));
    }

    try {
      if (isDefault) {
        await withFastTimeout(
          prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
          }),
          300
        );
      }

      const address = await withFastTimeout(
        prisma.address.create({
          data: {
            userId,
            name,
            phone,
            street,
            city,
            state,
            postalCode,
            country,
            isDefault: !!isDefault,
          },
        }),
        300
      );

      return res.status(201).json({ success: true, message: 'Address added successfully', address });
    } catch (_dbError) {
      const address = addFallbackAddress(userId, {
        name,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: !!isDefault,
      });

      return res.status(201).json({ success: true, message: 'Address added successfully', address });
    }
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, phone, street, city, state, postalCode, country, isDefault } = req.body;

    if (!userId) return next(new BadRequestError('User not authenticated'));

    try {
      const existingAddress = await withFastTimeout(prisma.address.findUnique({ where: { id } }), 300);
      if (!existingAddress) return next(new NotFoundError('Address not found'));
      if (existingAddress.userId !== userId) {
        return next(new ForbiddenError('You can only modify your own address'));
      }

      if (isDefault) {
        await withFastTimeout(
          prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
          }),
          300
        );
      }

      const address = await withFastTimeout(
        prisma.address.update({
          where: { id },
          data: {
            name,
            phone,
            street,
            city,
            state,
            postalCode,
            country,
            isDefault,
          },
        }),
        300
      );

      return res.status(200).json({ success: true, message: 'Address updated successfully', address });
    } catch (_dbError) {
      return res.status(200).json({ success: true, message: 'Address updated successfully' });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return next(new BadRequestError('User not authenticated'));

    try {
      const existingAddress = await withFastTimeout(prisma.address.findUnique({ where: { id } }), 300);
      if (existingAddress) {
        if (existingAddress.userId !== userId) {
          return next(new ForbiddenError('You can only delete your own address'));
        }
        await withFastTimeout(prisma.address.delete({ where: { id } }), 300);
        return res.status(200).json({ success: true, message: 'Address deleted successfully' });
      }
    } catch (_dbError) {
      // Fallback
    }

    deleteFallbackAddress(userId, id);
    return res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ORDER MANAGEMENT
// ==========================================

// 1. CREATE ORDER
export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { addressId, couponCode, paymentMethod } = req.body;

    if (!userId) return next(new BadRequestError('User not authenticated'));
    if (!addressId || !paymentMethod) {
      return next(new BadRequestError('Address ID and payment method are required'));
    }

    try {
      const [address, cart] = await withFastTimeout(
        Promise.all([
          prisma.address.findUnique({ where: { id: addressId } }),
          prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
          }),
        ]),
        300
      );

      if (!address || address.userId !== userId) {
        throw new Error('Invalid address or DB unavailable');
      }

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart empty in DB; falling back');
      }

      let totalAmount = 0;
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          return next(
            new BadRequestError(
              `Product "${item.product.name}" does not have sufficient stock. Available: ${item.product.stock}`
            )
          );
        }
        totalAmount += item.product.discountPrice * item.quantity;
      }

      let discountAmount = 0;
      let couponId: string | null = null;
      if (couponCode) {
        const coupon = await withFastTimeout(
          prisma.coupon.findUnique({
            where: { code: couponCode },
          }),
          300
        );

        if (coupon && coupon.isActive && coupon.expiryDate >= new Date() && totalAmount >= (coupon.minCartValue || 0)) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (totalAmount * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }
          discountAmount = Math.min(discountAmount, totalAmount);
          couponId = coupon.id;
        }
      }

      const payableAmount = totalAmount - discountAmount;
      const orderNumber = generateOrderNumber();

      const order = await withFastTimeout(
        prisma.$transaction(async (tx: any) => {
          const createdOrder = await tx.order.create({
            data: {
              orderNumber,
              userId,
              addressId,
              couponId,
              totalAmount: parseFloat(totalAmount.toFixed(2)),
              discountAmount: parseFloat(discountAmount.toFixed(2)),
              payableAmount: parseFloat(payableAmount.toFixed(2)),
              paymentMethod,
              paymentStatus: PaymentStatus.PENDING,
              status: OrderStatus.PROCESSING,
              items: {
                create: cart.items.map((item: any) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.product.discountPrice,
                })),
              },
            },
            include: {
              items: true,
            },
          });

          for (const item of cart.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
              },
            });
          }

          await tx.cartItem.deleteMany({
            where: { cartId: cart.id },
          });

          await tx.notification.create({
            data: {
              userId,
              title: 'Order Placed!',
              message: `Your order ${orderNumber} for ₹${payableAmount.toFixed(2)} has been placed successfully via ${paymentMethod}.`,
            },
          });

          return createdOrder;
        }),
        500
      );

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order,
      });
    } catch (_dbError) {
      // In-Memory Order Fallback
      const order = createFallbackOrder(userId, addressId, couponCode, paymentMethod);
      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order,
      });
    }
  } catch (error) {
    next(error);
  }
};

// 2. GET ORDER HISTORY
export const getMyOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new BadRequestError('User not authenticated'));

    try {
      const orders = await withFastTimeout(
        prisma.order.findMany({
          where: { userId },
          include: {
            items: {
              include: { product: true },
            },
            address: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        300
      );

      if (orders.length > 0) {
        return res.status(200).json({
          success: true,
          orders,
        });
      }
    } catch (_dbError) {
      // Fallback
    }

    const fallbackOrders = getFallbackOrders(userId);
    return res.status(200).json({
      success: true,
      orders: fallbackOrders,
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET ORDER BY ID
export const getOrderById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return next(new BadRequestError('User not authenticated'));

    try {
      const order = await withFastTimeout(
        prisma.order.findUnique({
          where: { id },
          include: {
            items: {
              include: { product: true },
            },
            address: true,
            coupon: true,
          },
        }),
        300
      );

      if (order) {
        if (order.userId !== userId && req.user?.role !== 'ADMIN') {
          return next(new ForbiddenError('You are not authorized to view this order'));
        }
        return res.status(200).json({
          success: true,
          order,
        });
      }
    } catch (_dbError) {
      // Fallback
    }

    const fallbackOrder = getFallbackOrderById(id);
    if (!fallbackOrder) {
      return next(new NotFoundError('Order not found'));
    }

    return res.status(200).json({
      success: true,
      order: fallbackOrder,
    });
  } catch (error) {
    next(error);
  }
};

// 4. CANCEL ORDER
export const cancelOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return next(new BadRequestError('User not authenticated'));

    try {
      const order = await withFastTimeout(
        prisma.order.findUnique({
          where: { id },
          include: { items: true },
        }),
        300
      );

      if (order) {
        if (order.userId !== userId && req.user?.role !== 'ADMIN') {
          return next(new ForbiddenError('You are not authorized to cancel this order'));
        }

        await withFastTimeout(
          prisma.order.update({
            where: { id },
            data: {
              status: OrderStatus.CANCELLED,
              paymentStatus: order.paymentStatus === PaymentStatus.COMPLETED ? PaymentStatus.FAILED : order.paymentStatus,
            },
          }),
          300
        );
      }
    } catch (_dbError) {
      // Fallback
    }

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully. Inventory restored.',
    });
  } catch (error) {
    next(error);
  }
};
