import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments({});
    
    // Aggregation for Total Revenue and Total Orders (excluding cancelled ones)
    const orderStats = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = orderStats[0]?.totalRevenue || 0;
    const totalOrders = orderStats[0]?.totalOrders || 0;

    // 1. Monthly Revenue & Sales Count Graph Data
    const monthlySales = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          salesCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const formattedMonthlySales = monthlySales.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        revenue: item.revenue,
        sales: item.salesCount
      };
    });

    // 2. Top-selling products
    const topProducts = await Product.find({})
      .sort({ purchaseCount: -1 })
      .limit(5)
      .select('name category price brand purchaseCount stock images');

    // 3. Low stock products (warning threshold: < 10)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .sort({ stock: 1 })
      .limit(5)
      .select('name category stock price brand');

    // 4. Category Performance (revenue/sales per category)
    const categorySales = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name', // grouping by product name or item categories
          salesVolume: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Format categorySales
    const formattedCategorySales = categorySales.map(item => ({
      name: item._id,
      sales: item.salesVolume,
      revenue: item.revenue
    }));

    // Customer growth analytics (signups per month)
    const customerGrowth = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const formattedCustomerGrowth = customerGrowth.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        customers: item.count
      };
    });

    // Handle empty data fallback for visual charts in development
    const defaultMonthlySales = [
      { month: 'Jan', revenue: 4000, sales: 24 },
      { month: 'Feb', revenue: 3000, sales: 18 },
      { month: 'Mar', revenue: 9800, sales: 50 },
      { month: 'Apr', revenue: 3908, sales: 27 },
      { month: 'May', revenue: 4800, sales: 30 },
      { month: 'Jun', revenue: 6800, sales: 40 }
    ];

    const defaultCustomerGrowth = [
      { month: 'Jan', customers: 10 },
      { month: 'Feb', customers: 15 },
      { month: 'Mar', customers: 28 },
      { month: 'Apr', customers: 36 },
      { month: 'May', customers: 45 },
      { month: 'Jun', customers: 60 }
    ];

    res.json({
      totalUsers,
      totalProducts,
      totalRevenue,
      totalOrders,
      monthlySales: formattedMonthlySales.length > 0 ? formattedMonthlySales : defaultMonthlySales,
      customerGrowth: formattedCustomerGrowth.length > 0 ? formattedCustomerGrowth : defaultCustomerGrowth,
      topProducts,
      lowStockProducts,
      categorySales: formattedCategorySales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Users (Admin only)
export const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Role (Admin only)
export const updateUserRoleAdmin = async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = role || user.role;
    await user.save();
    res.json({ message: 'User role updated successfully', role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete User (Admin only)
export const deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
