import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  link: { type: String, default: '/shop' },
  active: { type: Boolean, default: true },
  type: { type: String, enum: ['hero', 'deal', 'flash'], default: 'hero' }
}, { timestamps: true });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
