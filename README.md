# 🛍️ NexusShop — AI-Powered Full-Stack E-Commerce Platform

A production-style e-commerce web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js), featuring an AI shopping assistant, secure authentication, a full admin dashboard, and Stripe payments — built end-to-end as a portfolio project.

**🔗 Live Demo:** _[Add your deployed link here once live]_
**🔗 Backend API:** _[Add your deployed backend link here]_

---

## 📸 Screenshots

> _Add 2–4 screenshots or a short GIF here — homepage, product page, cart, and admin dashboard work well. This is one of the first things reviewers look at._

---

## ✨ Key Features

### 🛒 Shopping Experience
- Browse 100+ products across 10+ categories with images, ratings, and detailed specifications
- Smart search, filtering, and sorting
- Shopping cart with live total calculation and free-shipping progress
- Wishlist to save products for later
- Stripe-powered secure checkout
- Order history with real-time status tracking (pending → processing → shipped → delivered)

### 🤖 AI Features
- AI shopping assistant chatbot (powered by Google Gemini) for product recommendations and support
- AI-generated review summaries — auto-extracted pros/cons from customer reviews
- Natural-language product search

### 🔐 Authentication & Security
- JWT-based authentication with secure password hashing (bcrypt)
- Role-based access control (user vs. admin)
- Rate limiting on all API routes, with stricter limits on auth endpoints to prevent brute-force attacks
- Secure HTTP headers via Helmet
- CORS restricted to whitelisted origins only

### 🛠️ Admin Dashboard
- Sales and order analytics
- Product management (create, edit, delete, stock tracking)
- Order management with status updates and tracking numbers
- User management with role promotion/demotion

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, Context API, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT, bcrypt |
| AI | Google Gemini API |
| Payments | Stripe |
| Security | Helmet, express-rate-limit, CORS |
| Hosting (suggested) | Vercel/Netlify (frontend) · Render/Railway (backend) · MongoDB Atlas (database) |

---

## 📂 Project Structure

```
nexusshop-advanced/
└── ecom-final/
    ├── backend/
    │   ├── controllers/      # Route logic (auth, products, orders, payments, analytics)
    │   ├── middleware/       # Auth middleware (JWT verification, admin guard)
    │   ├── models/           # Mongoose schemas (User, Product, Order, Cart, Wishlist)
    │   ├── routes/           # Express route definitions
    │   ├── seeder.js         # Seeds the database with 100+ sample products
    │   └── server.js         # App entry point
    │
    └── frontend/
        └── src/
            ├── components/   # Reusable UI components (Navbar, ProductCard, AI widgets)
            ├── context/      # Global state (Auth, Cart)
            ├── pages/        # Route-level pages (Home, Products, Cart, Checkout, Admin, etc.)
            └── utils/        # API client config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local install or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- A [Stripe](https://stripe.com) account (test mode is fine) for payments
- A free [Google Gemini API key](https://aistudio.google.com/apikey) for AI features

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/nexusshop-advanced.git
cd nexusshop-advanced/ecom-final
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see [Environment Variables](#-environment-variables) below).

Seed the database with sample products:
```bash
node seeder.js
```

Start the backend server:
```bash
npm start
```
Backend runs on `http://localhost:5000` by default.

### 3. Frontend setup
Open a new terminal:
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` (see below).

Start the frontend:
```bash
npm start
```
Frontend runs on `http://localhost:3000`.

---

## 🔑 Environment Variables

### `backend/.env`
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_stripe_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### `frontend/.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

> ⚠️ Never commit your `.env` files — they're already excluded via `.gitignore`.

---

## 👑 Creating an Admin Account

1. Register a normal account through the app.
2. Open MongoDB Atlas (or `mongosh` for a local instance) and run:
```js
use nexusshop
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```
3. Log back in — you'll now have access to the admin dashboard.

---

## 📡 API Overview

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Log in, returns JWT | Public |
| GET | `/api/products` | List products (filter/search/paginate) | Public |
| GET | `/api/products/:id` | Get single product details | Public |
| GET | `/api/cart` | Get current user's cart | User |
| POST | `/api/orders` | Place a new order | User |
| GET | `/api/orders/mine` | Get logged-in user's orders | User |
| GET | `/api/orders` | Get all orders | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |
| GET | `/api/admin/users` | List all users | Admin |
| GET | `/api/analytics` | Sales/order analytics | Admin |

> Full route definitions are available in `backend/routes/`.

---

## 🗺️ Roadmap

- [ ] Unit and integration tests (Jest + Supertest)
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Docker support for one-command local setup
- [ ] API documentation via Swagger/OpenAPI
- [ ] Email notifications for order updates

---

## 📄 License

This project is open source and available for learning purposes.

---

## 🙋 Author

**Mohini Ganjare**
📧 mohiniganjare44@gmail.com
🔗 [GitHub](https://github.com/mohiniganjare12) · [LinkedIn](https://www.linkedin.com/in/mohini-ganjare-07398731a)
"# Ecommerce-project" 
