# SmartShop — Full-Stack Fashion & Apparel E-Commerce Platform

A modern, high-performance full-stack fashion and apparel e-commerce web application featuring 10 dedicated clothing categories, role-based authentication, dynamic catalog filtering, persistent cart synchronization, Razorpay payment gateway integration, AI-powered product recommendations, and an administrative analytics dashboard.

---

## Live Demo & Repository

- **Live Application:** [https://smart-shop-ten-nu.vercel.app](https://smart-shop-ten-nu.vercel.app)
- **Backend API:** [https://smartshop-backend-kvyp.onrender.com](https://smartshop-backend-kvyp.onrender.com)
- **GitHub Repository:** [https://github.com/Sparsh88/SmartShop](https://github.com/Sparsh88/SmartShop)

---

## Overview

SmartShop is an end-to-end modern fashion and lifestyle e-commerce platform designed to simulate contemporary retail operations. It combines a responsive React 18 single-page application with a modular Node.js/Express REST API and a structured PostgreSQL relational database managed via Prisma ORM.

The platform provides a complete customer shopping journey—from product discovery across 10 specialized apparel departments and persistent cart management to cryptographic payment checkout and order tracking—coupled with an administrative portal for catalog control, order fulfillment, and sales analytics.

---

## Problem Statement

- **Fashion Catalog Organization & State Persistence:** Maintaining seamless client-side state across 10 distinct clothing departments without data loss, empty views, or stale caches during frequent navigation.
- **Session Continuity & Cart Loss:** Managing shopping cart state across guest sessions and seamlessly synchronizing client items with database records upon customer authentication.
- **Secure Authentication & Access Control:** Securing user sessions using short-lived JWTs and HttpOnly cookies while enforcing Role-Based Access Control (RBAC) across customer and admin endpoints.
- **Transaction & Inventory Consistency:** Ensuring inventory integrity through atomic stock deductions during order placement and signature verification for digital payments.

---

## Key Features

- **👗 10 Dedicated Fashion & Apparel Departments:**
  - **T-Shirts:** Classic crewnecks, oversized streetwear graphics, and mercerized polos.
  - **Shirts:** Formal Egyptian poplin, check flannels, summer linens, and Oxford button-downs.
  - **Jeans:** Indigo stretch, jet black, vintage distressed, relaxed straight, and light wash denim.
  - **Pants & Trousers:** Slim stretch chinos, tactical cargos, pleated wide-leg trousers, and joggers.
  - **Jackets:** Denim trucker jackets, lambskin biker jackets, MA-1 bombers, and technical windbreakers.
  - **Hoodies:** Fleece pullovers, oversized drop-shoulder hoodies, and full-zip warm hoodies.
  - **Sweaters:** Aran cable knits, cashmere crewnecks, merino turtlenecks, and mohair cardigans.
  - **Sneakers:** Leather low-tops, performance runners, and retro chunky streetwear sneakers.
  - **Shoes:** Glossy leather derbies, Italian suede loafers, walking slip-ons, and Chelsea boots.
  - **Full Sets / Outfits:** Coordinated loungewear, summer linen resort sets, and winter overcoat ensembles.

- **⚡ Instant Filter & State Navigation:** Seamless department switching, real-time price range sliders, customer rating filters, and instant sorting without empty states or page reloads.
- **🔐 Dual-Token Authentication & Security:** Short-lived JWT access tokens held in memory paired with HttpOnly refresh cookies, automatic silent refresh interceptors, and bcrypt password hashing.
- **🛒 Persistent Cart & Wishlist Sync:** Guest cart stored in Zustand state and automatically synchronized with PostgreSQL database records upon customer login.
- **🎟️ Promotional Coupon Engine:** Percentage and flat-rate discount codes (`WELCOME10`, `FASHION500`, `SUMMER20`) with minimum cart value validation.
- **💳 Dual Payment Workflow:** Cash on Delivery (COD) and Razorpay integration with HMAC-SHA256 signature verification and sandbox mock fallback.
- **📦 Complete Order Lifecycle:** Milestone tracking (`PENDING` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `CANCELLED`) with automatic inventory restoration upon cancellation.
- **⭐ Customer Reviews & Ratings:** Verified customer reviews (1–5 stars) with average rating recalculation.
- **🤖 AI-Powered Recommendation Engine:** Hybrid recommendation system combining candidate retrieval, Google Gemini AI structured ranking, contextual explanations, and a resilient deterministic heuristic fallback.
- **📊 Admin Analytics Portal:** Interactive revenue charts (Recharts) over 6 months, order status distribution, product CRUD with image upload, and user status controls.

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 18, TypeScript, Vite | Single-page client with strict typing and fast HMR |
| Styling & UI | Tailwind CSS, Lucide React | Responsive UI design, modern layout, and clean iconography |
| Animations | Framer Motion, CSS Animations | Smooth page transitions and micro-interactions |
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
  ├── Controllers (Auth, Product, Cart, Order, Coupon, Admin)
  └── Services
       ├── Razorpay Payment Gateway (HMAC SHA-256 Verification)
       ├── Cloudinary Image Service (Product Image Assets)
       ├── Nodemailer Email Service (Verification & Password Reset)
       ├── Gemini Recommendation Engine (AI Semantic Re-ranking)
       └── Prisma ORM Client (PostgreSQL Connection Pooling)
               │
               ▼
       PostgreSQL Database (Neon Cloud)
```

---

## Application Flow

1. **Product Discovery:** Customer browses 10 specialized apparel departments, applies price range and rating filters, or searches fashion keywords.
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
│   │   └── seed.ts            # Complete 50-product fashion catalog seed script
│   ├── src/
│   │   ├── controllers/       # Auth, Product, Cart, Order, Coupon, Admin controllers
│   │   ├── middleware/        # JWT auth, RBAC guards, Multer upload, error handling
│   │   ├── routes/            # REST API endpoints
│   │   ├── services/          # Cloudinary, Email, Razorpay, Recommendation services
│   │   ├── utils/             # catalogFallback.ts, Zod validation schemas
│   │   └── server.ts          # Express app entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, Footer, ProductCard, CartDrawer, AdminLayout
│   │   ├── pages/             # Home, ProductList, ProductDetails, Cart, Checkout, Orders, Admin
│   │   ├── store/             # Zustand stores (useAuthStore, useCartStore, useWishlistStore)
│   │   ├── services/          # Axios API clients with auto-refresh interceptors
│   │   ├── utils/             # imageHelper.ts, priceHelper.ts
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

Run database migrations and seed the fashion catalog:

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
