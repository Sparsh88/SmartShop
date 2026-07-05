import mongoose from 'mongoose';

const specSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 }, // percentage discount
  category: { type: String, required: true, index: true },
  brand: { type: String, required: true, index: true },
  rating: { type: Number, default: 5, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String, required: true }],
  specs: [specSchema],
  ratingDistribution: {
    5: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    1: { type: Number, default: 0 }
  },
  viewsCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  isTrending: { type: Boolean, default: false },
  isDeal: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  flashSaleEnd: { type: Date }
}, { timestamps: true });

// Create indexes for text search
productSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
