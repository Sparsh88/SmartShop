# SmartShop — Full-Stack E-Commerce Platform

A modern full-stack e-commerce web application featuring role-based authentication, dynamic catalog filtering, persistent cart synchronization, Razorpay checkout integration, and an administrative analytics dashboard.

---

## Live Demo & Repository

- **Live Application:** [https://smart-shop-ten-nu.vercel.app](https://smart-shop-ten-nu.vercel.app)
- **Backend API:** [https://smartshop-backend-kvyp.onrender.com](https://smartshop-backend-kvyp.onrender.com)
- **GitHub Repository:** [https://github.com/Sparsh88/SmartShop](https://github.com/Sparsh88/SmartShop)

---

## Overview

SmartShop is an end-to-end e-commerce platform designed to simulate modern retail operations. It pairs a high-performance React 18 single-page application with a modular Node.js/Express REST API and a structured PostgreSQL relational database managed through Prisma ORM.

The platform provides a complete customer shopping journey—from product discovery and cart persistence to checkout and order tracking—coupled with an administrative portal for catalog control, order fulfillment, and sales analytics.

The system emphasizes transaction integrity through atomic stock deductions during checkout, cryptographic Razorpay payment verification, and dual-token JWT authentication with HttpOnly refresh cookies.

---

## Problem Statement

- **Session Continuity & Cart Loss:** Managing shopping cart state across guest sessions and seamlessly synchronizing client items with database records upon login.
- **Secure Authentication & Access Control:** Securing user sessions using short-lived tokens and HttpOnly cookies while enforcing Role-Based Access Control (RBAC) across protected customer and admin endpoints.
- **Catalog Filtering Performance:** Delivering fast search, category, brand, rating, and price range filtering without overburdening the database.
- **Transaction & Inventory Consistency:** Ensuring inventory integrity through atomic stock deductions during order placement and signature verification for digital payments.

---

## Key Features

- **Dual-Token Authentication & Security:** Short-lived JWT access tokens held in memory paired with HttpOnly refresh cookies, automatic silent refresh interceptors, and bcrypt password hashing.
- **Multi-Criteria Product Search & Filter:** Dynamic catalog filtering by category slugs, brand, price ranges, rating thresholds, and sorting parameters with debounced search queries.
- **Persistent Cart & Wishlist:** Guest cart stored in Zustand state and automatically synchronized with PostgreSQL database records upon customer login.
- **Coupon Engine:** Percentage and flat-rate discount codes with minimum order value validation and usage tracking.
- **Dual Payment Workflow:** Cash on Delivery (COD) and Razorpay integration with HMAC-SHA256 signature verification and sandbox mock fallback.
- **Order Lifecycle Management:** Complete status progression (`PENDING` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `CANCELLED`) with automatic inventory restoration on cancellation.
- **Customer Reviews & Ratings:** Verified buyer reviews (1–5 stars) with automatic recalculation of average product ratings.
- **AI-Powered Product Recommendation Engine:** Hybrid recommendation system combining PostgreSQL candidate retrieval, Google Gemini AI structured ranking, contextual user-facing explanations, and a resilient deterministic heuristic fallback.
- **Admin Analytics Portal:** Interactive revenue charts (Recharts) over 6 months, order status distribution, product CRUD with Cloudinary image upload, and user status controls.

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 18, TypeScript, Vite | Single-page client with strict typing and fast HMR |
| Styling & UI | Tailwind CSS, Lucide React | Responsive UI design, modern layout, and clean iconography |
| Animations | Framer Motion | Smooth page transitions and micro-interactions |
| State Management | Zustand, TanStack React Query | Client state stores (Auth, Cart, Wishlist) and server cache management |
| Form Validation | React Hook Form, Zod | Schema-based validation for auth, addresses, and checkout forms |
| Backend Runtime | Node.js, Express.js, TypeScript | RESTful API architecture with typed controllers, routes, and middleware |
| Database & ORM | PostgreSQL (Neon Cloud), Prisma ORM | Relational data modeling, migrations, foreign keys, and atomic queries |
| Payment Gateway | Razorpay SDK | Order creation, webhook/signature verification, and sandbox mode |
| AI / LLM Engine | Google Gemini API (`@google/generative-ai`) | Structured JSON candidate re-ranking and contextual product reasoning |
| Cloud Storage | Cloudinary, Multer | Product image upload with local filesystem fallback |
| Analytics | Recharts | Sales trends, revenue breakdowns, and order distribution charts |
| Deployment | Vercel (Frontend), Render (Backend) | Cloud hosting with automated deployment pipelines |

---

## Architecture

```text
Client Browser (React 18 + TypeScript + Zustand)
       │
       │ HTTPS / REST API
       ▼
Express.js API Server (Node.js + TypeScript)
  ├── Auth Middleware (JWT Verification & HttpOnly Cookies)
  ├── RBAC Guards (Customer vs Admin Endpoints)
  ├── Controllers (Auth, Products, Cart, Orders, Coupons, Admin)
  └── Services
       ├── Razorpay Payment Gateway (HMAC SHA-256 Verification)
       ├── Cloudinary Image Service (Product Image Assets)
       ├── Nodemailer Email Service (Verification & Password Reset)
       └── Prisma ORM Client (PostgreSQL Connection Pooling)
               │
               ▼
       PostgreSQL Database (Neon Cloud)
```

---

## Application Flow

1. **Product Discovery:** Customer browses catalog, applies category, price, and rating filters, or searches keywords.
2. **Cart Management:** Items added to cart persist in Zustand store and synchronize to PostgreSQL when authenticated.
3. **Checkout & Coupon:** Customer enters shipping address, applies discount coupon, and selects COD or Razorpay.
4. **Order Placement & Payment:** For Razorpay, backend creates order; client completes checkout; backend validates HMAC-SHA256 signature and atomically deducts stock.
5. **Order Tracking:** Customer tracks order status milestones (`PENDING` → `PROCESSING` → `SHIPPED` → `DELIVERED`).
6. **Admin Operations:** Admin logs in to view revenue analytics, manage product inventory, update order statuses, and create promo coupons.

---

## 🤖 AI-Powered Recommendations

SmartShop integrates an intelligent, production-ready hybrid recommendation engine powered by **Google Gemini API** (`gemini-1.5-flash`) and a high-performance **PostgreSQL heuristic fallback**.

```mermaid
graph TD
    UserClient["React 18 Frontend Client"] -->|Track Interaction / Request Recommendations| API["Express.js REST API"]
    API -->|Optional Auth| AuthMW["Auth Middleware (User Token or Guest Session)"]
    AuthMW --> RecController["Recommendation Controller"]

    subgraph Recommendation Pipeline
        RecController --> Cache["In-Memory Cache (TTL 10-30m)"]
        Cache -->|Cache Miss| RecService["Recommendation Service"]
        RecService -->|Fetch User History & Candidates| DB[("PostgreSQL Database")]

        RecService --> CandidateFilter["Candidate Filtering & Stock Guard"]
        CandidateFilter --> CheckAI{"Gemini API Key Available?"}

        CheckAI -->|Yes| GeminiCall["Google Gemini 1.5 Flash (Structured JSON)"]
        CheckAI -->|No / Timeout / Error| FallbackRanker["Deterministic Multi-Factor Ranker"]

        GeminiCall -->|Validate with Zod| ValidateAI["Sanitize AI Output against Real Candidate IDs"]
        ValidateAI -->|Success| CombineResults["Merge Products + AI Reasons"]
        ValidateAI -->|Fail / Invalid| FallbackRanker
        FallbackRanker --> CombineResults
    end

    CombineResults --> SaveCache["Save to Cache"]
    SaveCache --> RecController
    RecController --> UserClient
```

### Key Highlights & Engineering Safeguards

1. **Hybrid Architecture (No Database Dumps to LLM):**
   - The system never sends full database dumps to the AI model.
   - PostgreSQL queries filter a lean candidate pool (same category, brand affinity, price bracket ±40%, top ratings, user recency).
   - Only minimal product metadata (ID, name, category, brand, price, rating) is passed to the Gemini model for semantic ranking and human-readable reasoning.

2. **Strict Structured JSON & Hallucination Defense:**
   - Enforces `responseMimeType: "application/json"` with strict Zod validation.
   - AI-generated product IDs are cross-checked against the real candidate pool to reject any hallucinated IDs.
   - Core product data (pricing, inventory, images, names) is always sourced directly from PostgreSQL—never trusted from LLM text output.

3. **100% Guaranteed Uptime & Deterministic Fallback:**
   - If `GEMINI_API_KEY` is missing, API quota is exceeded, or the AI service times out (3.5s limit), the system automatically triggers a multi-factor heuristic ranking algorithm:
     - **Category Affinity:** +0.35 weight
     - **Price Proximity:** +0.25 weight
     - **Rating & Popularity:** +0.25 weight
     - **Brand & Trending Recency:** +0.15 weight
   - The user never encounters an error due to external AI service latency or failure.

4. **Guest & Authenticated User Support with Privacy Safeguards:**
   - Authenticated users receive personalized recommendations based on past orders, cart, wishlist, and interaction history.
   - Guest users receive session-based recommendations tracked via an anonymous, pseudo-anonymous `smartshop_session_id` stored in client `localStorage`.
   - Zero sensitive personal information (PII) or authentication tokens are ever sent to the AI service.

5. **In-Memory Caching & Performance:**
   - Personalized recommendations are cached for **10 minutes**.
   - Product detail page recommendations are cached for **20 minutes**.
   - Edge and memory caches eliminate redundant LLM API calls and database round-trips.

### Recommendation Endpoints

| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/api/recommendations` | Personalized recommendations for homepage / account | Public / Optional JWT |
| `GET` | `/api/recommendations/product/:productId` | Contextual recommendations related to viewed item | Public / Optional JWT |
| `GET` | `/api/recommendations/cart` | Complementary items tailored to current cart contents | Public / Optional JWT |
| `POST` | `/api/recommendations/track` | Track user events (`VIEW`, `CART`, `WISHLIST`, `PURCHASE`) | Public / Optional JWT |

---

## Project Structure

```text
SmartShop/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Models: User, Product, Category, Order, Cart, Coupon, Review
│   │   └── seed.ts            # Database seed script for test data
│   ├── src/
│   │   ├── controllers/       # Auth, Product, Cart, Order, Coupon, Admin controllers
│   │   ├── middleware/        # JWT auth, RBAC guards, Multer upload, error handling
│   │   ├── routes/            # REST API endpoints
│   │   ├── services/          # Cloudinary, Email, Razorpay integration
│   │   ├── utils/             # Zod validation schemas
│   │   └── server.ts          # Express app entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, Footer, ProductCard, CartDrawer, AdminLayout
│   │   ├── pages/             # Home, Shop, ProductDetail, Cart, Checkout, Orders, Admin
│   │   ├── store/             # Zustand stores (useAuthStore, useCartStore, useWishlistStore)
│   │   ├── services/          # Axios API clients with auto-refresh interceptors
│   │   ├── types/             # TypeScript definitions
│   │   ├── App.tsx            # Route configuration
│   │   └── main.tsx           # React DOM root
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## Installation & Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Cloud database URL (e.g., Neon Cloud) or local instance

### 1. Clone the Repository

```bash
git clone https://github.com/Sparsh88/SmartShop.git
cd SmartShop
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
CLIENT_URL="http://localhost:5173"
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
GEMINI_API_KEY="your_gemini_api_key_here"
```


Run database migrations and seed data:

```bash
npx prisma db push
npm run prisma:seed
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Author

**Sparsh Chauhan**  
*Computer Science & Engineering Student | Full Stack Developer*

- **Portfolio:** [portfolio-delta-topaz-jsfd5oekgj.vercel.app](https://portfolio-delta-topaz-jsfd5oekgj.vercel.app/)
- **GitHub:** [@Sparsh88](https://github.com/Sparsh88)
- **LinkedIn:** [linkedin.com/in/sparsh88](https://www.linkedin.com/in/sparsh88)
- **Email:** [sparshchauhan050@gmail.com](mailto:sparshchauhan050@gmail.com)
