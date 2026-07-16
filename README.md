# 🛒 SmartShop – Full Stack E-Commerce Platform

A modern, responsive, and scalable **Full Stack E-Commerce application** built with the **MERN ecosystem (React + Node.js)** using **TypeScript**, **Prisma ORM**, and **PostgreSQL**. The application provides a complete online shopping experience with secure authentication, product management, shopping cart, online payments, and an admin dashboard.

This project was developed to demonstrate industry-standard full-stack development practices, including authentication, REST APIs, database management, state management, and deployment.

---

## 🚀 Live Demo

**Frontend:** https://smart-shop-ten-nu.vercel.app/

**Backend API:** https://smartshop-backend-kvyp.onrender.com

---


# ✨ Features

## 👤 Authentication

- User Registration
- Secure Login & Logout
- JWT Authentication
- HttpOnly Refresh Tokens
- Email Verification
- Forgot Password
- Reset Password
- Change Password
- User Profile Management
- Avatar Upload

---

## 🛍️ Shopping Experience

- Browse Products
- Product Categories
- Brand Filtering
- Search Products
- Product Details
- Related Products
- Responsive Product Grid
- Wishlist
- Shopping Cart
- Quantity Management
- Persistent Cart
- Guest Cart Support

---

## 💳 Checkout & Payments

- Multiple Shipping Addresses
- Cash on Delivery
- Razorpay Payment Gateway
- Secure Payment Verification
- Order Placement
- Order History
- Order Cancellation

---

## 👨‍💼 Admin Features

- Secure Admin Authentication
- Add Products
- Update Products
- Delete Products
- Upload Multiple Product Images
- Manage Categories
- Manage Orders
- Dashboard Analytics

---

## 🔒 Security Features

- JWT Access Tokens
- HttpOnly Refresh Cookies
- Password Hashing using bcrypt
- Helmet Security Headers
- Rate Limiting
- Protected Routes
- Role-Based Authorization
- CORS Protection
- Input Validation
- Secure File Uploads

---

# 🛠️ Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- TanStack Query
- Axios
- React Hook Form
- Zod
- Framer Motion
- Recharts

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- bcryptjs
- Multer
- Cloudinary
- Nodemailer
- Razorpay

---

# 📂 Project Structure

```
SmartShop
│
├── backend
│   ├── prisma
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── routes
│   │   ├── utils
│   │   └── index.ts
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── store
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Sparsh88/smartshop.git
```

```bash
cd smartshop
```

---

## Backend Setup

```bash
cd backend

npm install

cp .env.example .env

npx prisma generate

npx prisma migrate dev

npm run seed

npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Open

```
http://localhost:5173
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
DATABASE_URL=

JWT_SECRET=

JWT_REFRESH_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

EMAIL_USER=

EMAIL_PASS=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=

CLIENT_URL=
```

---

# 📡 API Modules

### Authentication

- Register User
- Verify Email
- Login
- Refresh Token
- Logout
- Forgot Password
- Reset Password
- Update Profile
- Change Password

---

### Products

- Product Listing
- Product Details
- Categories
- Brands
- Search
- Pagination
- Admin CRUD

---

### Cart

- Add to Cart
- Update Quantity
- Remove Product
- Clear Cart

---

### Wishlist

- Add to Wishlist
- Remove from Wishlist

---

### Orders

- Address Management
- Place Order
- Order History
- Cancel Order

---

### Payments

- Create Razorpay Order
- Verify Payment Signature

---

# 💻 Database

The application uses **PostgreSQL** with **Prisma ORM**.

Main entities include:

- Users
- Products
- Categories
- Brands
- Cart
- Wishlist
- Orders
- Addresses
- Coupons
- Payments

---

# 📈 Future Improvements

- Product Reviews & Ratings
- AI Product Recommendations
- Real-time Order Tracking
- Inventory Management
- Sales Reports
- Multi-vendor Support
- Product Comparison
- Dark Mode
- PWA Support
- Internationalization (i18n)

---

# 📚 What I Learned

Through this project, I gained hands-on experience with:

- Building scalable REST APIs
- JWT Authentication & Authorization
- Prisma ORM with PostgreSQL
- Full CRUD Operations
- Cloudinary Image Uploads
- Payment Gateway Integration
- React State Management
- API Caching using React Query
- Form Validation using Zod
- Secure Backend Development
- Deployment on Vercel & Render

---

# 🤝 Contributing

Contributions, suggestions, and feedback are always welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# 👨‍💻 Author

**Sparsh Chauhan**

B.Tech CSE Student

Full Stack Web Developer

GitHub: https://github.com/Sparsh88

LinkedIn: https://linkedin.com/in/sparshchauhan08

---

⭐ If you found this project helpful, consider giving it a **Star** on GitHub!