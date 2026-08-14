# SmartShop

A modern full-stack e-commerce web application featuring role-based authentication, dynamic catalog filtering, persistent cart synchronization, Razorpay checkout integration, and an administrative analytics dashboard.

---

## 🌐 Live Demo & Repository

- **Live Application:** [https://smart-shop-ten-nu.vercel.app](https://smart-shop-ten-nu.vercel.app)
- **Backend API:** [https://smartshop-backend-kvyp.onrender.com](https://smartshop-backend-kvyp.onrender.com)
- **GitHub Repository:** [https://github.com/Sparsh88/SmartShop](https://github.com/Sparsh88/SmartShop)

> **Demo Credentials:**
> - **Admin:** `admin@smartshop.com` / `Password123`
> - **Customer:** `customer@smartshop.com` / `Password123`

---

## 📌 Overview

SmartShop is an end-to-end e-commerce platform designed to simulate modern retail operations. It pairs a high-performance React 18 single-page application with a modular Node.js/Express REST API and a structured PostgreSQL relational database managed through Prisma ORM.

The platform provides a complete customer shopping journey—from product discovery and cart persistence to checkout and order tracking—coupled with an administrative portal for catalog control, order fulfillment, and sales analytics.

---

## 🎯 Problem Statement

- **Session Continuity & Cart Loss:** Managing shopping cart state across guest sessions and seamlessly synchronizing client items with database records upon login.
- **Secure Authentication & Access Control:** Securing user sessions using short-lived tokens and HttpOnly cookies while enforcing Role-Based Access Control (RBAC) across protected customer and admin endpoints.
- **Catalog Filtering Performance:** Delivering fast search, category, brand, rating, and price range filtering without overburdening the database.
- **Transaction & Inventory Consistency:** Ensuring inventory integrity through atomic stock deductions during order placement and signature verification for digital payments.

---

## ✨ Key Features

### 👤 Authentication & Security
- **Dual-Token System:** Short-lived JWT access tokens held in client state paired with secure HttpOnly refresh cookies for seamless token rotation.
- **Silent Refresh Interceptors:** Automatic token renewal on `401 Unauthorized` responses via Axios response interceptors.
- **Account Verification & Recovery:** Email verification and password reset workflows powered by Nodemailer and cryptographic tokens.
- **Role-Based Access Control:** Middleware protecting sensitive administrative routes and verified customer actions.

### 🛍️ Product Catalog & Discovery
- **Multi-Criteria Search & Filter:** Dynamic search with category slugs, brand filters, price boundaries, rating thresholds, and sorting parameters.
- **Product Details & Gallery:** Multiple image viewing, discount price calculations, stock status indicators, and featured/trending tags.
- **Wishlist & Cart Synchronization:** Guest cart state stored in Zustand and synchronized with PostgreSQL upon login; one-click wishlist toggling.

### 💳 Checkout, Orders & Reviews
- **Coupon Engine:** Percentage and flat-rate discount codes with minimum cart value validation.
- **Dual Payment Workflow:** Cash on Delivery (COD) and Razorpay integration with HMAC-SHA256 signature verification and sandbox mock fallback.
- **Order Lifecycle Management:** Status progression (`PENDING` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `CANCELLED`) with automatic inventory restoration on cancellation.
- **Customer Reviews:** Verified buyer ratings (1–5 stars) with automatic recalculation of average product ratings.

### 📊 Admin Management & Analytics
- **Interactive Analytics:** Sales trends visualization (Recharts) over 6 months, order status distribution, and key revenue metrics.
- **Catalog & User Management:** Product CRUD with multi-image upload (Cloudinary with local storage fallback), category management, coupon creation, and user status controls.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite | Single-page application with strict type safety |
| **Styling & UI** | Tailwind CSS, Framer Motion, Lucide React | Responsive UI design, smooth micro-animations, and modern iconography |
| **State Management** | Zustand, TanStack React Query v5 | Client state stores (Auth, Cart, Wishlist) and server cache management |
| **Form Handling** | React Hook Form, Zod | Schema-based validation for auth, addresses, and checkout forms |
| **Backend** | Node.js, Express.js, TypeScript | RESTful API architecture with typed controllers, routes, and middleware |
| **Database & ORM** | PostgreSQL (Neon), Prisma ORM | Relational data modeling, migrations, indexing, and connection pooling |
| **Authentication** | JWT, HttpOnly Cookies, bcryptjs | Dual-token authentication, password hashing, and route protection |
| **File Storage** | Multer, Cloudinary | Multi-image file parsing with cloud upload and local disk fallback |
| **Payments & Mail** | Razorpay, Nodemailer | Payment gateway integration with HMAC verification and transactional email delivery |
| **Deployment** | Vercel (Frontend), Render (Backend) | Frontend SPA hosting with API rewrites and backend containerized web service |

---

## 🏗️ Architecture

```text
┌───────────────────────────────────────────────────────────┐
│                       Client Layer                        │
│   React 18 SPA (Vite) + Zustand + TanStack React Query    │
└─────────────────────────────┬─────────────────────────────┘
                              │ HTTPS / REST API + HttpOnly Cookies
┌─────────────────────────────▼─────────────────────────────┐
│                   Express.js Backend API                  │
│       Security: Helmet | CORS | Express Rate Limit        │
├─────────────────────────────┬─────────────────────────────┤
│ Middleware Pipeline         │ Business Controllers        │
│ - JWT Verification (Protect)│ - Auth & User Profile       │
│ - RBAC (Customer / Admin)   │ - Products, Categories & Reviews │
│ - Multer File Uploads       │ - Cart, Wishlist & Orders   │
│ - Global Error Handler      │ - Razorpay Payments & Admin │
└──────────────┬──────────────┴──────────────┬──────────────┘
               │                             │
┌──────────────▼──────────────┐ ┌────────────▼──────────────┐
│       Database Layer        │ │    Third-Party Services   │
│     Prisma ORM Client       │ │ - Cloudinary (Media)      │
│              │              │ │ - Razorpay (Payments)     │
│   PostgreSQL Database       │ │ - Nodemailer (SMTP Mail)  │
└─────────────────────────────┘ └───────────────────────────┘
```

---

## 🔄 Application Flow

```text
Browse & Filter Catalog ──► Add to Cart / Wishlist ──► User Login / Register
                                                              │
Order Placed & Stock Reduced ◄── Choose COD / Razorpay ◄── Select Shipping Address
          │
          ├──► Customer tracks status under Order History
          └──► Admin monitors revenue, updates status & manages catalog
```

1. **Catalog Discovery:** The user browses products, applying search queries, category filters, and price sorting, with data cached via React Query.
2. **Cart Management:** Items are added to the cart/wishlist; guest carts are cached in Zustand and synchronized with PostgreSQL upon user login.
3. **Authentication:** The user registers or signs in; the backend issues a short-lived JWT in memory and sets a secure HttpOnly refresh cookie.
4. **Checkout & Discounts:** The user selects or creates a shipping address and applies an eligible discount coupon.
5. **Payment Processing:** The user selects Cash on Delivery or Razorpay. For Razorpay, an order token is generated and verified via SHA-256 HMAC signature.
6. **Order Execution & Inventory Sync:** The backend creates order records, decrements product stock in a transaction, and clears the cart.
7. **Order Tracking & Admin Control:** The customer tracks progress under Order History, while administrators update order status and inspect metrics on the Admin Dashboard.

---

## 📂 Project Structure

```text
SmartShop/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # PostgreSQL models, enums & relations
│   ├── src/
│   │   ├── config/                # Database (Prisma) & Cloudinary configuration
│   │   ├── controllers/           # Auth, Product, Cart, Order, Admin controllers
│   │   ├── middleware/            # JWT protect, RBAC, Multer upload & error handling
│   │   ├── routes/                # Express route definitions
│   │   ├── utils/                 # Nodemailer helper & custom error classes
│   │   ├── index.ts               # Express application entry point
│   │   └── seed.ts                # Database seeder with sample products & users
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, Footer, ProductCard, Modals, Skeleton loaders
│   │   ├── pages/                 # Home, Catalog, ProductDetails, Cart, Checkout, Admin pages
│   │   ├── services/              # Axios instance & token refresh interceptors (api.ts)
│   │   ├── store/                 # Zustand state stores (authStore, cartStore, wishlistStore)
│   │   ├── App.tsx                # App routing & React Query provider setup
│   │   └── main.tsx               # Client entry point
│   ├── vercel.json                # Production SPA routing & API rewrites
│   ├── vite.config.ts
│   └── package.json
├── render.yaml                    # Backend Render deployment configuration
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js:** `v18+` or `v20+`
- **PostgreSQL:** Local instance or cloud database (e.g. Neon)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/Sparsh88/SmartShop.git
cd SmartShop
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env

# Run migrations and generate Prisma client
npx prisma generate
npx prisma migrate dev --name init

# Seed initial categories, products, coupons & test accounts
npm run seed

# Start development server
npm run dev
```

The backend server will start on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Start Vite development server
npm run dev
```

The frontend application will start on `http://localhost:5173`.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/smartshop?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET="your_jwt_access_secret_key"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Cloudinary (Optional - defaults to local uploads if omitted)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Nodemailer / SMTP
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your_smtp_user"
SMTP_PASS="your_smtp_pass"
SMTP_FROM="SmartShop <noreply@smartshop.com>"

# Razorpay (Optional - sandbox mock mode available if omitted)
RAZORPAY_KEY_ID="rzp_test_yourkeyid"
RAZORPAY_KEY_SECRET="yourkeysecret"

# Client CORS
FRONTEND_URL="http://localhost:5173"
```

---

## 👨‍💻 Author

**Sparsh Chauhan**  
*B.Tech in Computer Science & Engineering*  
- **GitHub:** [Sparsh88](https://github.com/Sparsh88)  
- **LinkedIn:** [Sparsh Chauhan](https://linkedin.com/in/sparshchauhan08)  