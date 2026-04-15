# Flipkart Clone

A full-stack Flipkart clone built with React (Vite) + Node.js (Express) + PostgreSQL.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Zustand, React Router, Lucide Icons |
| Backend | Node.js, Express, pg (PostgreSQL) |
| Database | PostgreSQL |
| Styling | Vanilla CSS (no Tailwind) |

## Features

- 🏠 Home page with hero banner, category grid, deal banners, brand showcase
- 🛍️ Product listing with category, search, and featured filters
- 📦 Product detail with image gallery, specs table, quantity selector
- 🛒 Shopping cart with quantity controls and order summary
- ❤️ Wishlist (persisted to localStorage)
- 📋 Orders page with checkout form and order history
- 🔔 Navbar with Login dropdown, Wishlist badge, cart count

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flipkart_clone
DB_USER=postgres
DB_PASSWORD=your_password
PORT=5000
NODE_ENV=development
```

```bash
# Create the database first (in psql):
# CREATE DATABASE flipkart_clone;

npm run seed    # Seeds 30 products across 5 categories
npm run dev     # Starts on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Starts on http://localhost:5173
```

## Project Structure

```
Flipkart Clone/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── routes/
│   │   │   ├── products.js
│   │   │   ├── cart.js
│   │   │   └── orders.js
│   │   ├── seed/seed.js
│   │   └── index.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProductCard.jsx
    │   │   └── HeroBanner.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── ProductsPage.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── OrdersPage.jsx
    │   │   └── WishlistPage.jsx
    │   ├── store/
    │   │   ├── cartStore.js
    │   │   └── wishlistStore.js
    │   └── App.jsx
    └── package.json
```
