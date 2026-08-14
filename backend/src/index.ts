import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Import routers
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';
import couponRoutes from './routes/couponRoutes';

// Import middlewares & db
import { globalErrorHandler } from './middleware/errorMiddleware';
import { NotFoundError } from './utils/errors';
import prisma from './config/db';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // allows serving local uploads statically
}));

// CORS Configuration
const frontendEnv = process.env.FRONTEND_URL || process.env.CLIENT_URL || '';
const configuredOrigins = frontendEnv
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const defaultAllowedOrigins = [
  'https://smart-shop-ten-nu.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultAllowedOrigins]));

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        // Log CORS block for diagnosis and return false rather than unhandled exception
        console.warn(`[CORS] Request from origin ${origin} not in allowed list:`, allowedOrigins);
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// Public Root & Health Check Endpoints (placed before rate limiter so health checks never fail or throttle)
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    success: true,
    message: 'SmartShop Backend API is running',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    success: true,
    message: 'SmartShop API is healthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    success: true,
    message: 'SmartShop API is healthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Rate Limiter for general API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inline Cookie Parser Middleware (removes need for cookie-parser npm dependency)
app.use((req: any, _res: any, next: any) => {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie: string) => {
      const parts = cookie.split('=');
      const key = parts.shift()?.trim();
      if (key) {
        list[key] = decodeURIComponent(parts.join('='));
      }
    });
  }
  req.cookies = list;
  next();
});

// Serving Uploaded Files Statically
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Route Mappings
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);

// Fallback Route for Undefined Paths
app.use('*', (req: any, _res: any, next: any) => {
  next(new NotFoundError(`Cannot find endpoint ${req.originalUrl} on this server.`));
});

// Global Error Handler Middleware
app.use(globalErrorHandler);

// Process-level diagnostic error listeners
process.on('unhandledRejection', (reason: any) => {
  console.error('[SmartShop Backend] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('[SmartShop Backend] Uncaught Exception:', error);
});

// Proactively connect to database to eliminate cold start on first user request
prisma.$connect()
  .then(() => {
    console.log('[SmartShop Backend] Database connection pool initialized successfully.');
  })
  .catch((err: any) => {
    console.error('[SmartShop Backend] Database connection initialization warning:', err.message || err);
  });

// Start server with 0.0.0.0 binding for container/cloud platforms
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SmartShop Backend] Server is running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});
