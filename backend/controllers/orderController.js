import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

let razorpayInstance = null;
const rzpKeyId = process.env.RAZORPAY_KEY_ID;
const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (rzpKeyId && rzpKeySecret && rzpKeyId !== 'YOUR_RAZORPAY_KEY_ID') {
  try {
    razorpayInstance = new Razorpay({
      key_id: rzpKeyId,
      key_secret: rzpKeySecret
    });
    console.log('Razorpay SDK Initialized successfully.');
  } catch (error) {
    console.error('Error initializing Razorpay:', error.message);
  }
} else {
  console.warn('Razorpay credentials missing. Running payment flow in SIMULATION mode.');
}

// 1. Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  const { amount, couponCode } = req.body;

  try {
    const totalAmountInPaise = Math.round(Number(amount) * 100); // Razorpay processes in paise (1 INR = 100 paise)

    if (razorpayInstance) {
      const options = {
        amount: totalAmountInPaise,
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`
      };
      
      const order = await razorpayInstance.orders.create(options);
      return res.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: rzpKeyId,
        isMock: false
      });
    }

    // Mock Razorpay Order Generation for testing
    const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
    res.json({
      id: mockOrderId,
      amount: totalAmountInPaise,
      currency: 'INR',
      key: 'rzp_test_mockKeyId12345',
      isMock: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Verify Payment and Place Order (Razorpay)
export const verifyPaymentAndPlaceOrder = async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    items,
    shippingAddress,
    totalAmount,
    discountAmount,
    couponUsed,
    isMockOrder
  } = req.body;

  try {
    // Signature Verification (only if Razorpay is configured and it's not a simulated mock order)
    if (razorpayInstance && !isMockOrder) {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', rzpKeySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
      }
    }

    // Decrement stock levels and increment purchase counters
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${item.name}` });
      }
      product.stock -= item.quantity;
      product.purchaseCount += item.quantity;
      await product.save();
    }

    // Track coupon usage
    if (couponUsed) {
      const coupon = await Coupon.findOne({ code: couponUsed.toUpperCase() });
      if (coupon) {
        coupon.usageCount += 1;
        await coupon.save();
      }
    }

    // Create Order Record
    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      paymentDetails: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      },
      totalAmount: Number(totalAmount),
      discountAmount: Number(discountAmount || 0),
      couponUsed,
      status: 'processing'
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Place Cash on Delivery Order
export const placeCodOrder = async (req, res) => {
  const { items, shippingAddress, totalAmount, discountAmount, couponUsed } = req.body;

  try {
    // Check stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${item.name}` });
      }
      product.stock -= item.quantity;
      product.purchaseCount += item.quantity;
      await product.save();
    }

    // Handle coupon usage
    if (couponUsed) {
      const coupon = await Coupon.findOne({ code: couponUsed.toUpperCase() });
      if (coupon) {
        coupon.usageCount += 1;
        await coupon.save();
      }
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      totalAmount: Number(totalAmount),
      discountAmount: Number(discountAmount || 0),
      couponUsed,
      status: 'processing'
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get Logged In User's Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Get Order Details by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorize: Admin or the customer who placed the order
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Cancel Order (Customer)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorize
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (order.status !== 'processing') {
      return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status}` });
    }

    // Restore stocks
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        product.purchaseCount = Math.max(0, product.purchaseCount - item.quantity);
        await product.save();
      }
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Request Return (Customer)
export const requestReturn = async (req, res) => {
  const { returnReason } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only return orders that are delivered' });
    }

    order.status = 'returned';
    order.returnReason = returnReason || 'No reason specified';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Update Order Status (Admin only)
export const updateOrderStatus = async (req, res) => {
  const { status, carrier, trackingNumber, estimatedDelivery } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status || order.status;
    
    if (carrier || trackingNumber || estimatedDelivery) {
      order.trackingDetails = {
        carrier: carrier || order.trackingDetails?.carrier,
        trackingNumber: trackingNumber || order.trackingDetails?.trackingNumber,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : order.trackingDetails?.estimatedDelivery
      };
    }

    // Auto-mark payment as paid if order status is set to delivered for COD
    if (order.status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 9. Get All Orders (Admin only)
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
