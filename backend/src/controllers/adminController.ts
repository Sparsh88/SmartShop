import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { OrderStatus, PaymentStatus } from '@prisma/client';

// 1. GET DASHBOARD METRICS
export const getDashboardStats = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Total Users count
    const totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } });

    // Total Products count
    const totalProducts = await prisma.product.count();

    // Total Orders count
    const totalOrders = await prisma.order.count();

    // Total Revenue (excluding cancelled orders)
    const completedOrders = await prisma.order.findMany({
      where: {
        NOT: { status: OrderStatus.CANCELLED },
      },
      select: { payableAmount: true },
    });
    const totalRevenue = completedOrders.reduce((sum: number, order: { payableAmount: number }) => sum + order.payableAmount, 0);

    // Recent Orders (take 5)
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // Low Stock Products (stock < 5)
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 5 } },
      include: { category: { select: { name: true } } },
    });

    // Monthly Sales Chart Data (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of month

    const ordersForChart = await prisma.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        NOT: { status: OrderStatus.CANCELLED },
      },
      select: {
        payableAmount: true,
        createdAt: true,
      },
    });

    // Process monthly sales in-memory
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesMap: Record<string, { month: string; sales: number; orders: number }> = {};

    // Initialize map for last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      salesMap[label] = { month: label, sales: 0, orders: 0 };
    }

    ordersForChart.forEach((order: { createdAt: Date; payableAmount: number }) => {
      const d = new Date(order.createdAt);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      if (salesMap[label]) {
        salesMap[label].sales += order.payableAmount;
        salesMap[label].orders += 1;
      }
    });

    const monthlySales = Object.values(salesMap);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        totalProducts,
        totalUsers,
        lowStockCount: lowStockProducts.length,
      },
      recentOrders,
      lowStockProducts,
      monthlySales,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET ALL USERS (WITH ORDER COUNTS)
export const getUsers = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        isBlocked: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      users: users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        isVerified: u.isVerified,
        isBlocked: u.isBlocked,
        createdAt: u.createdAt,
        orderCount: u._count.orders,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// 3. BLOCK / UNBLOCK USER
export const toggleBlockUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return next(new NotFoundError('User not found'));
    if (user.role === 'ADMIN') return next(new BadRequestError('Cannot block an administrator'));

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked },
    });

    res.status(200).json({
      success: true,
      message: `User has been successfully ${updatedUser.isBlocked ? 'blocked' : 'unblocked'}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isBlocked: updatedUser.isBlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. DELETE USER
export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return next(new NotFoundError('User not found'));
    if (user.role === 'ADMIN') return next(new BadRequestError('Cannot delete an administrator'));

    await prisma.user.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 5. UPDATE ORDER STATUS (ADMIN ONLY)
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return next(new NotFoundError('Order not found'));

    const updateData: any = {};
    if (status) updateData.status = status as OrderStatus;
    
    // Automatically set payment status to COMPLETED if order is DELIVERED
    if (status === OrderStatus.DELIVERED) {
      updateData.paymentStatus = PaymentStatus.COMPLETED;
    } else if (paymentStatus) {
      updateData.paymentStatus = paymentStatus as PaymentStatus;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `Order Status Updated: ${status}`,
        message: `Your order ${order.orderNumber} has been updated to: ${status}.`,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// 6. GET ALL USER ORDERS (ADMIN VIEW)
export const getAllOrders = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
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

// 7. GET NOTIFICATIONS
export const getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new BadRequestError('User not authenticated'));

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// 8. MARK NOTIFICATIONS AS READ
export const markNotificationsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new BadRequestError('User not authenticated'));

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
