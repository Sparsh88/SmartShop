# SmartShop — Premium Full Stack E-Commerce Platform

SmartShop is a modern, responsive, and production-ready Full Stack E-Commerce web application built using clean MVC architecture and industry-standard security safeguards.

## 🚀 Technology Stack

### Frontend
* **Core**: React 19 (TypeScript), Vite
* **Styling**: Tailwind CSS, PostCSS (Autoprefixer)
* **Animation**: Framer Motion
* **State Management**: Zustand (with local storage persistence and guest modes)
* **API cache**: React Query (TanStack Query v5)
* **Forms & Verification**: React Hook Form, Zod schema validations
* **HTTP Client**: Axios (configured with request token attachers and response silent refresh listeners)
* **Analytics Charts**: Recharts

### Backend
* **Runtime & Framework**: Node.js, Express.js (TypeScript)
* **ORM & Database**: Prisma ORM with Neon PostgreSQL
* **Authentication**: JSON Web Tokens (Access JWT + HttpOnly Refresh Token Cookie)
* **Password Hashing**: bcryptjs
* **Storage & Uploads**: Multer & Cloudinary
* **Email dispatch**: Nodemailer
* **Gateway integration**: Razorpay SDK
* **Security guards**: Helmet headers, Express Rate Limit, CORS constraints

---

## 📂 Project Structure

```text
E-commerce/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # Prisma PostgreSQL data schemas
│   ├── src/
│   │   ├── config/               # Database client & Cloudinary initializations
│   │   ├── controllers/          # Business logic handlers (MVC controllers)
│   │   ├── middleware/           # Auth validation, Error logging, Upload buffers
│   │   ├── routes/               # REST endpoint routes mapping
│   │   ├── utils/                # Custom HTTP errors & Nodemailer email templates
│   │   ├── index.ts              # Entry point Express server
│   │   └── seed.ts               # Database pre-population seed script
│   ├── tsconfig.json
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/           # Common layouts (Navbar, Footer), guards, UI elements
    │   ├── pages/                # Customer storefront pages & Admin console panels
    │   ├── services/             # Axios API client interceptor configuration
    │   ├── store/                # Zustand global authentication and cart stores
    │   ├── App.tsx               # App routing table structure
    │   ├── main.tsx              # React mounting bootstrap
    │   └── index.css             # Tailwind style sheets & glassmorphism utilities
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.ts
    └── package.json
```

---

## ⚙️ Installation & Local Setup

To run this project locally, clone the repository and configure the steps below:

### 1. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` configuration file by cloning `.env.example` and providing active credentials (e.g. database URL):
   ```bash
   cp .env.example .env
   ```
4. Generate the Prisma database client:
   ```bash
   npx prisma generate
   ```
5. Apply database schema migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Populate the PostgreSQL database with categories, default products, active coupons, and administrator credentials:
   ```bash
   npm run seed
   ```
7. Start the Express development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Test Sandbox Login Credentials

We have pre-seeded test accounts for verification in development:

* **Administrator Account**:
  * **Email**: `admin@smartshop.com`
  * **Password**: `Password123`
* **Standard Customer Account**:
  * **Email**: `customer@smartshop.com`
  * **Password**: `Password123`

---

## 🔗 REST API Endpoints Overview

All backend requests start with `/api`:

### 🔐 Authentication (`/api/auth`)
* `POST /register` — Register a customer (triggers code mailing and cart setup).
* `POST /verify` — Submit the 6-digit email confirmation code.
* `POST /login` — Log in and capture HTTPOnly cookies.
* `POST /refresh` — Refresh the access token silently.
* `POST /logout` — Clear session cookies.
* `POST /forgot-password` — Request a reset link.
* `POST /reset-password/:token` — Reset account password.
* `PUT /profile` — Update name, email, or change avatar picture (Supports image upload).
* `PUT /change-password` — Change password.

### 🛍️ Products (`/api/products`)
* `GET /` — List products with filters, search, and pagination.
* `GET /home` — Retrievefeatured and trending homepage items.
* `GET /categories` — List store categories.
* `GET /brands` — List distinct brands.
* `GET /:id` — Get product detail specs and related items.
* `POST /` — Add catalog product (Admin Only - Supports multiple image uploads).
* `PUT /:id` — Update catalog product specs (Admin Only).
* `DELETE /:id` — Remove catalog product (Admin Only).

### 🛒 Cart & Wishlist (`/api/cart` & `/api/wishlist`)
* `GET /cart` — View cart contents.
* `POST /cart/add` — Add item to cart.
* `PUT /cart/update` — Edit cart quantities.
* `DELETE /cart/remove/:productId` — Delete item from cart.
* `DELETE /cart/clear` — Clear cart.
* `GET /wishlist` — View liked products.
* `POST /wishlist/toggle` — Add/remove liked products.

### 📦 Orders & Payments (`/api/orders` & `/api/payments`)
* `GET /orders/addresses` — View customer address list.
* `POST /orders/addresses` — Save new shipping address.
* `POST /orders/create` — Create order transaction (COD/Razorpay).
* `GET /orders/my-orders` — View previous orders list.
* `PUT /orders/cancel/:id` — Request order cancellation.
* `POST /payments/create-order` — Create Razorpay order credentials.
* `POST /payments/verify` — Verify capture signature via cryptographic HMAC matching.

---

## 🌩️ Deployment Details

### Backend (Render / Heroku)
1. Link your git repository to Render.
2. Select Web Service. Set Environment to `Node`.
3. Build command: `npm install && npm run build` (Wait: ensure Prisma builds by running `npx prisma generate` in your build command or package.json scripts).
4. Start command: `npm run start`.
5. Attach environment variables.

### Database (Neon / Supabase)
1. Create a PostgreSQL server on Neon.
2. Capture the Connection String.
3. Attach this to the backend `DATABASE_URL` environment parameter.

### Frontend (Vercel / Netlify)
1. Link the repository frontend directory to Vercel.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Configure `VITE_API_URL` pointing to your hosted Express URL (e.g. `https://smartshop-api.onrender.com/api`).
