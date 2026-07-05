import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, required: true, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true, min: 0 },
  minPurchase: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  active: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 100 },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
