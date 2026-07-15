# 🎮 GameVault — Gaming E-Commerce Platform

> A full-stack gaming hardware marketplace with **5 role types**, admin dashboard, product management, orders, wishlist, reviews, coupons, and analytics.

![Stack](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite)
![Express](https://img.shields.io/badge/Express-5-lightgrey?style=for-the-badge&logo=express)
![SQLite](https://img.shields.io/badge/SQLite-3-003b57?style=for-the-badge&logo=sqlite)
![JWT](https://img.shields.io/badge/JWT-Auth-black?style=for-the-badge&logo=jsonwebtokens)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs)

---

## 📸 Screenshots

<p align="center">
  <em>Screenshots coming soon — run <code>npm run dev</code> to explore the live app</em>
</p>

> **To capture screenshots:** Open `http://localhost:5173` in Chrome, press `F12` → `Ctrl+Shift+P` → "Capture full size screenshot"

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    GameVault                         │
├───────────────┬─────────────────────────────────────┤
│  Customer     │          Admin Panel                │
│  (Store)      │  ┌─────┬─────┬──────┬──────┐       │
│               │  │Admin│Sub  │Merch │Seller│       │
│  • Browse     │  │     │Admin│ant   │      │       │
│  • Cart       │  │Full │Ltd  │Brand │Own   │       │
│  • Wishlist   │  │Ctrl │Ctrl │Scope │List  │       │
│  • Checkout   │  └─────┴─────┴──────┴──────┘       │
│  • Orders     │                                     │
│               │  Shared Product Catalog (SQLite)    │
├───────────────┴─────────────────────────────────────┤
│  Express API  │  SQLite  │  JWT Auth  │  bcrypt     │
└─────────────────────────────────────────────────────┘
```

### Permission System

All permissions are centralized in `src/context/PermissionContext.tsx` — a single source of truth:

```ts
const perms = getPermissions(user.role);
if (perms.canAddProduct) { /* show add button */ }
```

| Permission | Admin | Sub-Admin | Merchant | Seller | Customer |
|-----------|:---:|:---:|:---:|:---:|:---:|
| View all products | ✅ | ✅ | Own brand | Own | Browse |
| Add/Edit/Delete | ✅ | ✅ | Own brand | Own | ❌ |
| Feature products | ✅ | ✅ | ❌ | ❌ | ❌ |
| Export CSV | ✅ | ✅ | ❌ | ❌ | ❌ |
| View all orders | ✅ | ✅ | Brand | ❌ | Own |
| Update order status | ✅ | ❌ | ❌ | ❌ | ❌ |
| View accounts | ✅ | ❌ | ❌ | ❌ | ❌ |
| Most Ordered | ✅ | ✅ | ✅ | ❌ | ❌ |
| Most Wishlisted | ✅ | ✅ | ❌ | ❌ | ❌ |
| Reviews | ✅ | ✅ | ❌ | ❌ | ❌ |
| Coupons | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ | ❌ |
| Activity Logs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Bulk Discount | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reseed DB | ✅ | ❌ | ❌ | ❌ | ❌ |
| Purchase products | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## ✨ Features

### 🛍️ Customer Store

| Feature | Description |
|---------|-------------|
| **Product Catalog** | 260+ products across 15 categories (CPU, GPU, RAM, SSD, PC Cabinet, Laptops, Consoles, etc.) |
| **Category Sidebar** | Expandable grouped navigation (PC Components, Gaming, Displays, Accessories) |
| **Advanced Search** | Search by name, brand, category, description |
| **Multi-Filters** | Brand (scoped to selected category), condition, warranty, price range, rating, stock, discount, sort |
| **Product Cards** | Glass hover effect, stock badges, discount tags, warranty info, rating stars |
| **Product Detail** | Full specifications table, related products, Buy Now button |
| **Cart Drawer** | Slide-over cart with quantity picker, GST calculation, "Frequently Bought Together" recommendations |
| **Wishlist** | Heart toggle on cards + dedicated wishlist page, synced to server |
| **Checkout** | Shipping address form with Indian states validation, COD/UPI/Card payment simulation |
| **Order History** | Last 20 orders saved locally |
| **Brand Marquee** | Animated horizontal scroll of partner brand logos |

### 🛒 Commerce Rules

- Pre-owned items: qty locked at 1 (unique)
- New items: quantity picker with stock-aware limits
- Sold out: clear visual state, no purchase option
- Stock decreases only after payment (backend transaction)
- GST 18% calculated on subtotal
- Free shipping on all orders

### 🔐 Authentication

- **bcrypt** password hashing (10 salt rounds)
- **JWT** tokens with 7-day expiry
- **Auto-redirect** to role-specific dashboard on login
- **Protected routes** — admin/staff never see customer pages
- **Cart cleared** on admin login

### 📊 Admin Dashboard

- **10 stat cards:** Revenue, Orders, Customers, Products, Pending, Cancelled, Refunds, OOS, Avg Order Value, Conversion Rate
- **Revenue bar chart:** Last 30 days with 7/15/30 day toggle
- **Most Sold** + **Most Wishlisted** side-by-side ranking tables
- **Recent Orders** table with status badges
- **Live Activity Feed** — last 12 orders with timestamps
- **Bulk Discount** — apply % discount to entire category in one click
- **Category Breakdown** — products per category with out-of-stock counts

### 📦 Products Management

- Add/Edit/Delete with modal form (name, brand, category, price, discount, stock, condition, warranty, rating, image, description)
- **Inline stock edit** — click the stock number, type new value
- **+1 / -1 quick buttons** for inventory adjustments
- Brand dropdown filter + stock filter (All/Low/Out)
- Featured toggle (★ star)
- Export CSV
- Reseed database from `products.json`

### 🏷️ Categories

- Per-category product count, inventory value, out-of-stock count, top rating

### 📋 Orders

- All orders table with expandable items
- **Status dropdown:** Processing → Shipped → Delivered → Cancelled
- Filter by status
- Customer details, address, payment method, line items

### 👥 Accounts

- Aggregate view of all non-admin accounts
- **Role filter cards:** Sub-Admin, Merchant, Seller, Customer — click to filter
- Table shows name, email, phone, role badge, brand, join date

### 🎫 Coupons & Promotions

- Create percentage discount coupons
- Min cart value, max uses, expiry date
- Pause/Activate toggle
- Delete

### ⭐ Reviews

- Seed demo reviews (40 random 3-5 star reviews)
- Approve/Hide moderation
- Star ratings, product name, verified purchase badge

### 🔥 Analytics

| Page | Content |
|------|---------|
| **Most Ordered** | Top products by units sold, ascending/descending sort |
| **Most Wishlisted** | Server-tracked wishlist counts (real DB data) |
| **Reports** | Revenue by brand, total revenue/orders/avg order |

### 📝 Activity Logs

- Every admin action logged: product created/updated/deleted, review status changes, coupon creation, settings updates
- Searchable

### ⚙️ Settings

- Store name, contact email, phone, tax rate, currency, low stock threshold
- Persisted to SQLite

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `products` | Product catalog (id, name, brand, category, price, stock, specs, etc.) |
| `orders` | Order headers (orderId, totals, address, status, userId) |
| `order_items` | Order line items (productId, quantity, price at time of order) |
| `users` | All accounts (name, email, passwordHash, role, brand, sellerId) |
| `wishlists` | Server-side wishlist tracking (productId, count) |
| `reviews` | Product reviews (rating, comment, status, verified) |
| `coupons` | Discount codes (code, discountValue, minCart, maxUses, expiresAt) |
| `activity_logs` | Admin action log (userId, action, details, timestamp) |
| `settings` | Key-value store settings |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (v22 recommended)
- **npm**

### Quick Start

```bash
# Clone
git clone https://github.com/Gamer4225/gaming-e-com-website.git
cd gaming-e-com-website/gaming-e-com-website

# Install
npm install

# Windows: rebuild native SQLite module
npm rebuild better-sqlite3

# Run (starts API on :3001 + Vite on :5173)
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)**

### Default Accounts

On first run, 4 accounts are auto-created (all share password: **`admin123`**):

| Email | Role | Notes |
|-------|------|-------|
| `admin@gamevault.com` | Admin | Full platform control |
| `subadmin@gamevault.com` | Sub-Admin | Product & order management |
| `merchant@gamevault.com` | Merchant | Brand: ASUS |
| `seller@gamevault.com` | Seller | Can sell & buy |

### Creating More Accounts

1. Login as `admin@gamevault.com`
2. Go to **Signup** page
3. Fill in details + select **Account Role** from dropdown
4. For Merchants, enter a **Brand Name**

---

## 📁 Project Structure

```
gaming-e-com-website/
├── .gitignore
├── README.md
├── index.html                    # Built single-file deploy artifact
├── public/
│   ├── favicon.png
│   └── brands/                   # Brand SVG logos (17 brands)
├── server/
│   ├── index.js                  # Express API (1500+ lines, all endpoints)
│   └── gamevault.db              # SQLite (auto-generated, gitignored)
└── gaming-e-com-website/
    ├── package.json
    ├── vite.config.ts
    ├── index.html                 # Dev entry point
    └── src/
        ├── App.tsx                # Root router: Admin Panel vs Customer Store
        ├── main.tsx
        ├── assets/                # Logo data URL, brand logoS paths
        ├── context/
        │   ├── AuthContext.tsx    # Login/Signup/JWT state
        │   ├── CartContext.tsx    # Cart, checkout, place order
        │   ├── WishlistContext.tsx# Wishlist with server sync
        │   ├── ProductCatalogContext.tsx
        │   ├── ProductDetailContext.tsx
        │   ├── PermissionContext.tsx  # Centralized role-based permissions
        │   └── AdminContext.ts    # Shared admin fetch helper
        ├── pages/
        │   ├── Home.tsx           # Landing page with hero, categories, deals
        │   ├── Products.tsx       # Catalog with filters
        │   ├── Checkout.tsx       # Shipping + payment form
        │   ├── Login.tsx          # Auth with auto-redirect
        │   ├── Signup.tsx         # Signup with role selector (admin only)
        │   ├── CustomerAccount.tsx# Profile + password change
        │   ├── AdminDashboard.tsx # CEO dashboard with 10 stat cards
        │   ├── ProductManagement.tsx  # Unified product CRUD (all roles)
        │   ├── AdminCategories.tsx
        │   ├── AdminOrders.tsx
        │   ├── AdminAccounts.tsx
        │   ├── AdminMostOrdered.tsx
        │   ├── AdminMostWishlisted.tsx
        │   ├── AdminReviews.tsx
        │   ├── AdminCoupons.tsx
        │   ├── AdminReports.tsx
        │   ├── AdminActivityLogs.tsx
        │   ├── AdminSettings.tsx
        │   ├── AdminChangePassword.tsx
        │   ├── SubAdminDashboard.tsx
        │   ├── MerchantDashboard.tsx
        │   └── SellerDashboard.tsx
        ├── components/
        │   ├── Navbar/            # Glass morphism navbar
        │   ├── Sidebar/           # Category sidebar
        │   ├── Footer/            # Footer with GitHub link
        │   ├── ProductCard/       # Product card with qty picker
        │   ├── ProductDetail/     # Full detail + specs + related
        │   ├── ProductGrid/
        │   ├── CartDrawer/        # Slide-over cart
        │   ├── CartItem/
        │   ├── Filters/
        │   ├── BrandMarquee/
        │   └── Icons/             # All inline SVG icons
        ├── data/
        │   └── products.json      # 272 product seed data
        └── styles/
            └── global.css         # CSS variables, animations, base styles
```

---

## 🔌 API Endpoints

### Public

| Method | Path | Auth | Description |
|--------|------|:---:|-------------|
| `GET` | `/api/health` | ❌ | Database status, counts |
| `GET` | `/api/products` | ❌ | List with `?category=&brand=&q=&featured=` |
| `GET` | `/api/products/:id` | ❌ | Single product |
| `GET` | `/api/meta` | ❌ | Category/brand counts |
| `POST` | `/api/orders` | ❌ | Place order (deducts stock) |
| `GET` | `/api/orders` | ❌ | Recent orders |
| `GET` | `/api/orders/:orderId` | ❌ | Single order details |
| `POST` | `/api/recommendations/cart` | ❌ | Compatible product suggestions |

### Auth

| Method | Path | Auth | Description |
|--------|------|:---:|-------------|
| `POST` | `/api/auth/signup` | ❌ | Create account |
| `POST` | `/api/auth/login` | ❌ | Login → JWT token + user object |
| `GET` | `/api/auth/me` | ✅ | Get current user from token |

### Admin (all require `admin` role)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/stats` | Full dashboard stats |
| `GET` | `/api/admin/products` | All products with `?q=&brand=&filter=` |
| `POST` | `/api/admin/products` | Add product |
| `PUT` | `/api/admin/products/:id` | Update product |
| `DELETE` | `/api/admin/products/:id` | Delete product |
| `PATCH` | `/api/admin/products/:id/feature` | Toggle featured |
| `PATCH` | `/api/admin/products/:id/stock` | Update stock |
| `GET` | `/api/admin/brands` | Distinct brand list |
| `POST` | `/api/admin/bulk-discount` | Apply discount to category |
| `POST` | `/api/admin/reseed` | Re-import from products.json |
| `GET` | `/api/admin/orders` | All orders with `?status=` |
| `PATCH` | `/api/admin/orders/:orderId/status` | Update order status |
| `GET` | `/api/admin/users` | All users |
| `GET` | `/api/admin/customers` | Customer-only users |
| `GET` | `/api/admin/accounts` | Non-admin accounts with `?role=` |
| `GET` | `/api/admin/most-ordered` | Top products by sales |
| `GET` | `/api/admin/most-wishlisted` | Top wishlisted products |
| `GET` | `/api/admin/categories` | Category stats |
| `GET` | `/api/admin/reviews` | Reviews with `?status=&productId=` |
| `PATCH` | `/api/admin/reviews/:id/status` | Approve/hide review |
| `GET` | `/api/admin/coupons` | All coupons |
| `POST` | `/api/admin/coupons` | Create coupon |
| `PATCH` | `/api/admin/coupons/:id` | Pause/activate coupon |
| `DELETE` | `/api/admin/coupons/:id` | Delete coupon |
| `GET` | `/api/admin/activity-logs` | Admin action log |
| `GET` | `/api/admin/settings` | Store settings |
| `PUT` | `/api/admin/settings` | Update settings |
| `GET` | `/api/admin/reports/sales` | Sales report |

### Staff (sub-admin, merchant, seller)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/sub-admin/dashboard` | Sub-admin dashboard stats |
| `GET` | `/api/merchant/dashboard` | Merchant brand stats |
| `GET` | `/api/seller/dashboard` | Seller listings + earnings |
| `GET` | `/api/staff/products` | Role-scoped products |
| `POST` | `/api/staff/products` | Add product (scoped) |
| `PUT` | `/api/staff/products/:id` | Update product (scoped) |
| `DELETE` | `/api/staff/products/:id` | Delete product (scoped) |
| `PATCH` | `/api/staff/products/:id/stock` | Update stock (scoped) |

### Customer

| Method | Path | Description |
|--------|------|-------------|
| `PUT` | `/api/customer/profile` | Update name/phone |
| `PUT` | `/api/customer/change-password` | Change password |

### Wishlist

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/wishlist` | Get wishlist IDs |
| `POST` | `/api/wishlist/:id` | Toggle add/remove |
| `POST` | `/api/wishlist/sync` | Bulk sync from client |

---

## 🔐 Permission Model

```
src/context/PermissionContext.tsx
         │
         ├── getPermissions(role) → Permissions object (25 boolean flags)
         │
         ├── AppRouter → redirects staff to dashboard
         ├── AdminLayout → builds sidebar from permissions
         ├── ProductManagement → shows/hides buttons per permission
         ├── Navbar → role-aware navigation links
         └── CartDrawer/Checkout → blocks purchase for staff
```

---

## 🌐 Deployment

### GitHub Pages (Static)

The `index.html` at the repo root is a **single-file build** served via GitHub Pages at [gamer4225.github.io/gaming-e-com-website](https://gamer4225.github.io/gaming-e-com-website).

⚠️ **Login/Signup/Admin do NOT work on GitHub Pages** — only the Express backend provides auth. Browse, cart, and wishlist work fully.

### Local Development

```bash
npm run dev     # Full stack (API + Vite)
npm run server  # API only on :3001
npm run build   # Production single-file build
npm run preview # Serve build locally
```

---

## 📝 Notes

- Payments are **simulated** (COD/UPI/Card) — no real payment gateway.
- Product images are **Unsplash stock photos**.
- Prices and specifications are **illustrative demo data**.
- The SQLite database auto-seeds from `src/data/products.json`.
- Delete `server/gamevault.db*` to reset the database.

---

## 🗺️ Roadmap

- [x] Product catalog with search & multi-filters
- [x] Cart + Wishlist with server sync
- [x] Guest checkout with simulated payments
- [x] Login/Signup with JWT + bcrypt
- [x] 5 role types: Admin, Sub-Admin, Merchant, Seller, Customer
- [x] Centralized permission system
- [x] Admin dashboard with revenue chart
- [x] Product management (CRUD + inventory)
- [x] Order management with status lifecycle
- [x] Accounts management
- [x] Most Ordered & Most Wishlisted analytics
- [x] Reviews with moderation
- [x] Coupons & promotions
- [x] Activity logs
- [x] Reports
- [x] Settings
- [x] Role-specific dashboards
- [ ] Product variants & SKU system
- [ ] Compare products
- [ ] Order tracking notifications
- [ ] Returns & refunds workflow
- [ ] Hardware compatibility checker
- [ ] PC Builder
- [ ] Multi-language support

---

## 👨‍💻 Author

**GameVault** — Academic Mini Project  
© 2026 GameVault  
[GitHub Repository](https://github.com/Gamer4225/gaming-e-com-website)

---

*Built with React, TypeScript, Vite, Express, SQLite, and lots of ☕*
