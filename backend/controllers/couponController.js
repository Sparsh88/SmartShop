import Coupon from '../models/Coupon.js';

// Validate coupon during checkout
export const validateCoupon = async (req, res) => {
  const { code, amount } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (!coupon.active) {
      return res.status(400).json({ message: 'Coupon is inactive' });
    }

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    if (Number(amount) < coupon.minPurchase) {
      return res.status(400).json({ 
        message: `Minimum purchase of ₹${coupon.minPurchase} is required to use this coupon` 
      });
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a Coupon (Admin only)
export const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, minPurchase, maxDiscount, expiryDate } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase || 0),
      maxDiscount: Number(maxDiscount || 0),
      expiryDate: new Date(expiryDate)
    });

    const savedCoupon = await coupon.save();
    res.status(201).json(savedCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all coupons (Admin only)
export const getCouponsAdmin = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active coupons (Public / Customer checkout)
export const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ 
      active: true,
      expiryDate: { $gt: new Date() } 
    }).select('code discountType discountValue minPurchase maxDiscount description');
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Coupon (Admin only)
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
