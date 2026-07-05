import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // crucial for serving local uploads to frontend
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Resolve directory paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve local upload folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', categoryRoutes); // handles /categories and /banners
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assistant', assistantRoutes);

// Database seed trigger route
app.get('/api/seed-db', (req, res) => {
  exec('node seed.js', (err, stdout, stderr) => {
    if (err) {
      console.error(`Database seeding via endpoint failed: ${err.message}`);
      return res.status(500).json({ success: false, error: err.message, stderr });
    }
    console.log(`Database seeded via API endpoint successfully:\n${stdout}`);
    res.json({ success: true, message: 'Database seeded successfully!', output: stdout });
  });
});

// Base route check
app.get('/', (req, res) => {
  res.json({ message: 'SmartShop AI E-Commerce API is running...' });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
