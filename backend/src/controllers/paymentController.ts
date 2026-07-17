import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PaymentStatus, OrderStatus } from '@prisma/client';

// Configure Razorpay client
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_5mQp9V8sX8Z3kJ';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key_placeholder';
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// 1. CREATE RAZORPAY ORDER
export const createRazorpayOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.body;

    if (!userId) return next(new BadRequestError('User not authenticated'));
    if (!orderId) return next(new BadRequestError('SmartShop Order ID is required'));

    // Find the SmartShop order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return next(new NotFoundError('Order not found'));
    if (order.userId !== userId) {
      return next(new BadRequestError('Unauthorized access to order details'));
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_5mQp9V8sX8Z3kJ';
    const isMock = process.env.RAZORPAY_KEY_SECRET === 'rzp_test_secret_key_placeholder' || !process.env.RAZORPAY_KEY_SECRET;

    if (isMock) {
      // Mock mode: generate a dummy Razorpay order id for sandbox runs
      const mockRazorpayOrderId = `rzp_ord_${Date.now()}`;
      
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentId: mockRazorpayOrderId },
      });

      return res.status(201).json({
        success: true,
        isMock: true,
        orderId: mockRazorpayOrderId,
        amount: order.payableAmount * 100, // in paisa
        currency: 'INR',
        keyId,
        payableAmount: order.payableAmount,
      });
    }

    // Live mode
    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(order.payableAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: order.orderNumber,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save Razorpay Order ID to the local order record
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: razorpayOrder.id,
      },
    });

    res.status(201).json({
      success: true,
      isMock: false,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
      payableAmount: order.payableAmount,
    });
  } catch (error) {
    next(error);
  }
};

// 2. VERIFY PAYMENT SIGNATURE
export const verifyRazorpayPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!userId) return next(new BadRequestError('User not authenticated'));
    if (!orderId) return next(new BadRequestError('SmartShop Order ID is required'));

    // Check Order (selecting only the required fields to optimize database throughput)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, orderNumber: true, payableAmount: true },
    });
    if (!order) return next(new NotFoundError('Order not found'));

    const isMock = process.env.RAZORPAY_KEY_SECRET === 'rzp_test_secret_key_placeholder' || !process.env.RAZORPAY_KEY_SECRET;

    if (isMock) {
      // Mock Auto-Approval
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            status: OrderStatus.PROCESSING,
            paymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
          },
        }),
        prisma.notification.create({
          data: {
            userId: order.userId,
            title: 'Payment Received (Mock)',
            message: `Mock payment for order ${order.orderNumber} approved. Status: Processing.`,
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        message: 'Mock payment verified successfully',
      });
    }

    // Verify SHA-256 HMAC Signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key_placeholder';
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      // Mark as Failed
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
      return next(new BadRequestError('Invalid payment signature. Verification failed.'));
    }

    // Successful signature match
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          status: OrderStatus.PROCESSING,
          paymentId: razorpay_payment_id,
        },
      }),
      prisma.notification.create({
        data: {
          userId: order.userId,
          title: 'Payment Confirmed!',
          message: `Payment of $${order.payableAmount.toFixed(2)} received. Your order ${order.orderNumber} is processing.`,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment verified and captured successfully',
    });
  } catch (error) {
    next(error);
  }
};
