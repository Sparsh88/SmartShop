import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  image: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [orderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: { type: String, required: true, enum: ['razorpay', 'cod'], default: 'cod' },
  paymentStatus: { type: String, required: true, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
  },
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  couponUsed: { type: String },
  status: { 
    type: String, 
    required: true, 
    enum: ['processing', 'shipped', 'delivered', 'cancelled', 'returned'], 
    default: 'processing' 
  },
  trackingDetails: {
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date
  },
  returnReason: String
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
