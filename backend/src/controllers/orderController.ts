import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/db';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { OrderStatus, PaymentStatus } from '@prisma/client';

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

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });

    res.status(200).json({ success: true, addresses });
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

    // If setting as default, clear other default addresses first
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
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
    });

    res.status(201).json({ success: true, message: 'Address added successfully', address });
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

    const existingAddress = await prisma.address.findUnique({ where: { id } });
    if (!existingAddress) return next(new NotFoundError('Address not found'));
    if (existingAddress.userId !== userId) {
      return next(new ForbiddenError('You can only modify your own address'));
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
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
    });

    res.status(200).json({ success: true, message: 'Address updated successfully', address });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return next(new BadRequestError('User not authenticated'));

    const existingAddress = await prisma.address.findUnique({ where: { id } });
    if (!existingAddress) return next(new NotFoundError('Address not found'));
    if (existingAddress.userId !== userId) {
      return next(new ForbiddenError('You can only delete your own address'));
    }

    await prisma.address.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Address deleted successfully' });
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

    // Verify Address belongs to user
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) {
      return next(new BadRequestError('Invalid shipping address'));
    }

    // Fetch Cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return next(new BadRequestError('Your shopping cart is empty'));
    }

    // Calculate Prices & Verify Stocks
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

    // Verify Coupon
    let discountAmount = 0;
    let couponId: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (!coupon || !coupon.isActive || coupon.expiryDate < new Date()) {
        return next(new BadRequestError('Invalid or expired coupon code'));
      }

      if (totalAmount < coupon.minCartValue) {
        return next(
          new BadRequestError(
            `Minimum cart value of $${coupon.minCartValue} required to apply this coupon`
          )
        );
      }

      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (totalAmount * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }
      discountAmount = Math.min(discountAmount, totalAmount); // Discount cannot exceed price
      couponId = coupon.id;
    }

    const payableAmount = totalAmount - discountAmount;
    const orderNumber = generateOrderNumber();

    // Perform database operations as a transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // 1. Create order record
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
          paymentStatus: paymentMethod === 'COD' ? PaymentStatus.PENDING : PaymentStatus.PENDING,
          status: OrderStatus.PENDING,
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

      // 2. Reduce product stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // 4. Create notification
      await tx.notification.create({
        data: {
          userId,
          title: 'Order Placed!',
          message: `Your order ${orderNumber} for $${payableAmount.toFixed(2)} has been placed successfully via ${paymentMethod}.`,
        },
      });

      return createdOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET ORDER HISTORY
export const getMyOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new BadRequestError('User not authenticated'));

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      orders,
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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        address: true,
        coupon: true,
      },
    });

    if (!order) return next(new NotFoundError('Order not found'));

    // Customer can view only their own order. Admins can view any order.
    if (order.userId !== userId && req.user?.role !== 'ADMIN') {
      return next(new ForbiddenError('You are not authorized to view this order'));
    }

    res.status(200).json({
      success: true,
      order,
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

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return next(new NotFoundError('Order not found'));
    if (order.userId !== userId && req.user?.role !== 'ADMIN') {
      return next(new ForbiddenError('You are not authorized to cancel this order'));
    }

    // Can only cancel pending or processing orders
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
      return next(new BadRequestError('Order cannot be cancelled as it has already been shipped or delivered.'));
    }

    await prisma.$transaction(async (tx: any) => {
      // 1. Update Order Status
      await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: order.paymentStatus === PaymentStatus.COMPLETED ? PaymentStatus.FAILED : order.paymentStatus,
        },
      });

      // 2. Restore stocks
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // 3. Create Notification
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: 'Order Cancelled',
          message: `Your order ${order.orderNumber} has been successfully cancelled.`,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully. Inventory restored.',
    });
  } catch (error) {
    next(error);
  }
};
