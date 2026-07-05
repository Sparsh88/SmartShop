# 🛍️ SmartShop AI

> **Shop Smarter with AI**

SmartShop AI is a **production-ready, full-stack AI-powered e-commerce platform** built with modern web technologies. It combines a premium shopping experience with Artificial Intelligence to deliver intelligent product recommendations, AI-assisted search, image-based product discovery, and a conversational shopping assistant.

Designed with scalability, security, and user experience in mind, SmartShop AI demonstrates industry-standard architecture, clean code practices, and real-world software engineering concepts, making it an excellent portfolio project for full-stack developer roles.

---

# 🚀 Features

## 🤖 AI-Powered Features

### 🧠 AI Shopping Assistant

* Natural language shopping assistant powered by **Google Gemini AI**
* Recommends products based on:

  * Budget
  * Purpose
  * User requirements
  * Brand preference
* Answers product-related questions
* Compares products
* Provides buying suggestions

**Examples**

> "Suggest a gaming laptop under ₹80,000."

> "Recommend running shoes."

> "Best headphones for coding."

---

### 🔍 Smart AI Search

Unlike traditional keyword-based search, SmartShop AI understands **user intent**.

If the searched product exists:

* Displays matching products instantly.

If the searched product does **not** exist:

* Gemini AI analyzes the search intent.
* Suggests the closest available alternatives.

**Example**

Search:

> MacBook

Database contains:

* Dell Laptop
* HP Laptop
* Lenovo Laptop

Result:

> "MacBook is currently unavailable. Here are similar premium laptops you may like."

---

### 📷 AI Image Search

Users can upload an image of a product.

The AI:

* Identifies the object
* Understands its category
* Detects color and style
* Finds visually similar products available in the store

---

# 🛒 Customer Features

* User Registration
* Secure Login
* Google OAuth Login
* JWT Authentication
* Forgot Password
* Product Search
* Category Filters
* Product Sorting
* Wishlist
* Shopping Cart
* Coupon System
* Razorpay Payments
* Order Tracking
* Order History
* Reviews & Ratings
* Responsive Design
* Dark / Light Theme

---

# 👨‍💼 Admin Features

* Interactive Admin Dashboard
* Product Management
* Category Management
* User Management
* Order Management
* Coupon Management
* Inventory Control
* Revenue Analytics
* Monthly Sales Reports
* Low Stock Alerts
* Customer Insights
* Top Selling Products

---

# 📊 Analytics Dashboard

Built using **Recharts**.

Includes:

* Monthly Revenue
* Sales Overview
* Product Performance
* Category Statistics
* Top Selling Products
* Low Stock Monitoring

---

# 🌗 Dark & Light Mode

* Fully responsive theme switcher
* Smooth transitions
* Theme preference stored in Local Storage
* Supports every page across the application

---

# 🔐 Security

* JWT Authentication
* Google OAuth
* Password Hashing (bcrypt)
* Helmet Security Headers
* Express Rate Limiter
* CORS Protection
* Input Validation
* Protected Routes
* Role-Based Authorization

---

# 💳 Payments

* Razorpay Integration
* Secure Order Verification
* Payment Confirmation
* Order Invoice
* Payment Status Tracking

---

# 🛠️ Tech Stack

## Frontend

* React.js
* React Router DOM
* JavaScript (ES6+)
* Tailwind CSS
* HTML5
* CSS3
* Axios
* Context API
* React Hook Form
* Recharts
* Canvas Confetti

---

## Backend

* Node.js
* Express.js
* REST APIs
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt.js
* Multer
* Cloudinary
* Express Validator
* Helmet
* Express Rate Limit
* CORS

---

## AI & Third-Party Services

* Google Gemini API
* Razorpay
* Cloudinary
* MongoDB Atlas

---

# 📁 Project Structure

```
SmartShop-AI/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── services/
│   ├── utils/
│   ├── seed.js
│   ├── server.js
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
└── README.md
```

---

# ⚙️ Installation

## Prerequisites

* Node.js (v18 or later recommended)
* MongoDB (Local or Atlas)
* npm

---

## 1. Clone Repository

```bash
git clone <repository-url>

cd SmartShop-AI
```

---

## 2. Install Dependencies

```bash
npm run install-all
```

---

## 3. Configure Environment Variables

Copy the example file:

```bash
cp backend/.env.example backend/.env
```

Update the following values:

* MongoDB URI
* JWT Secret
* Gemini API Key
* Razorpay Keys
* Cloudinary Credentials
* Google OAuth Credentials

---

## 4. Seed Database

```bash
npm run seed
```

This will generate:

* Categories
* Products
* Coupons
* Admin User
* Customer User

---

## 5. Run Development Server

Backend

```bash
npm run backend
```

Frontend

```bash
npm run frontend
```

Application URL

```
http://localhost:5173
```

---

# 🔑 Demo Credentials

## Administrator

**Email**

```
admin@smartshop.com
```

**Password**

```
admin123
```

---

## Customer

**Email**

```
customer@smartshop.com
```

**Password**

```
customer123
```

---

# 📡 REST API Endpoints

## Authentication

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
GET    /api/auth/profile
PUT    /api/auth/profile
```

---

## Products

```
GET    /api/products
GET    /api/products/:id
POST   /api/products/visual-search
POST   /api/products/:id/reviews
```

---

## Orders

```
POST   /api/orders/cod
POST   /api/orders/razorpay
POST   /api/orders/verify
GET    /api/orders/myorders
PUT    /api/orders/:id/cancel
```

---

## Coupons

```
GET    /api/coupons
POST   /api/coupons/validate
```

---

## Administration

```
GET    /api/admin/analytics
GET    /api/admin/users
GET    /api/admin/orders
GET    /api/admin/products
```

---

# 🌟 Highlights

* Production-ready architecture
* AI-powered shopping experience
* Intent-aware intelligent search
* Image-based product discovery
* Responsive modern UI
* JWT & Google OAuth Authentication
* Razorpay Payment Integration
* Interactive Analytics Dashboard
* RESTful API Architecture
* Dark & Light Theme Support
* Clean MVC Backend
* Fully Responsive Design

---

# 🚀 Future Enhancements

* Real-time Chat using Socket.io
* Voice Search
* AI Review Summarization
* Product Comparison Tool
* Personalized Recommendations
* Progressive Web App (PWA)
* Email Notifications
* Push Notifications
* Multi-Vendor Marketplace
* Redis Caching
* Docker & CI/CD Deployment

---

# 👨‍💻 Author

**Sparsh Chauhan**

**Full Stack Web Developer**

If you found this project helpful, consider giving it a ⭐ on GitHub.
