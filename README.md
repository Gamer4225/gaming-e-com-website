# GameVault — Gaming E-Commerce Mini Project

A modern, dark neon-themed **gaming e-commerce demo** for hardware, accessories, consoles, and PC components.  
Built as an academic mini project with **browse → cart → checkout → order** flow, user authentication, and admin/customer roles.

![Stack](https://img.shields.io/badge/React-19-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6) ![Vite](https://img.shields.io/badge/Vite-7-646cff) ![Express](https://img.shields.io/badge/Express-5-lightgrey) ![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-blue)

---

## Features

### Authentication & Roles 🔐 *(Local only — see note below)*
- **Login / Signup** with password hashing (bcrypt) and JWT tokens
- **Admin role** — separate account type for managing products (in development)
- **Customer role** — default for all new signups
- **Default admin account** seeded on first server start
- ⚠️ **Auth works only when the backend server is running locally.**  
  The GitHub Pages deployment is a **static build** — browse, cart, and wishlist work there, but login/signup requires `npm run dev`.

### Catalog & discovery
- 260+ demo products across 15 categories (CPU, GPU, RAM, SSD, laptops, consoles, peripherals, furniture, tablets, …)
- Category sidebar + homepage category grid
- Search (name, brand, category, description)
- Multi-filters: brand (**scoped to selected category**), condition, warranty, price, rating, stock, discount, sort
- Product cards with stock badges, ratings, warranty tags
- Product detail page with full **specifications** table
- **Related products** (same category)
- Image error **fallback** when a remote photo fails

### Cart & commerce rules
- Add to cart with quantity (new items only)
- **Pre-owned** items: unique, qty locked at 1; no +/- on cards
- **Sold out**: no quantity picker; clear Sold Out state
- Stock-aware quantity limits
- Cart summary: subtotal, savings, free shipping, **GST 18%**, grand total
- Cart persisted in `localStorage`
- **Frequently bought together** — compatible product recommendations in cart drawer

### Checkout & orders
- Guest checkout (no account required)
- Shipping address form with validation (phone, PIN, required fields)
- Demo payments: COD / UPI / Card (simulated)
- Order confirmation with order ID + delivery estimate
- **Order history** (last 20 orders on this device)
- **Buy Now** from product detail (add + go to checkout)

### Wishlist & extras
- Heart on product cards + wishlist page (`localStorage`)
- About, Contact (demo form), FAQ pages
- Working footer + navbar links (Orders, Wishlist, Contact, FAQ, About)
- **GitHub icon** in footer linking to the source repository
- Responsive layout, neon GameVault branding

---

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19 + TypeScript |
| Build | Vite 7 + `vite-plugin-singlefile` |
| Styling | Custom CSS (dark gaming theme) + Tailwind CSS 4 |
| State | React Context (`Cart`, `Wishlist`, `ProductDetail`, `Auth`) |
| Persistence | `localStorage` |
| Data | **SQLite** (`server/gamevault.db`) + Express API |
| Auth | bcrypt + JWT (JSON Web Tokens) |
| Fallback | Static `src/data/products.json` if API offline |

### Backend (mini)
- Express API on port **3001**
- SQLite tables: `products`, `orders`, `order_items`, `users`
- **Stock decreases only after order/payment** (`POST /api/orders`)
- **bcrypt** password hashing (10 salt rounds)
- **JWT** authentication with 7-day token expiry
- Adding to cart only reserves qty in the browser cart — does **not** mark Sold Out

**Still demo-only:** payments are simulated (COD/UPI/Card), no real gateway, no real payment processing.

---

## Getting started

### Requirements
- Node.js 18+ recommended  
- npm

### Install & run (development)

```bash
cd gaming-e-com-website
npm install
npm run dev
```

This starts **both**:
- API: `http://localhost:3001` (SQLite + Express)
- Web: Vite (usually `http://localhost:5173`) with `/api` proxied to the backend

> **Windows users:** If `better-sqlite3` fails with a native module error, run:
> ```bash
> npm rebuild better-sqlite3
> ```
> If that doesn't work, install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022) with "Desktop development with C++".

Run API only:
```bash
npm run server
```

### Production build

```bash
npm run build
npm run preview
```

- Build output: **`dist/index.html`** (single self-contained HTML file)
- You can open that file directly in a browser, or use `npm run preview` for a local server.

### Default Admin Account

On first server start, a default admin is automatically seeded:

| Field | Value |
|-------|-------|
| **Email** | `admin@gamevault.com` |
| **Password** | `admin123` |
| **Role** | `admin` |

> Change the password immediately if deploying anywhere public.

### ⚠️ GitHub Pages vs Local

| Feature | GitHub Pages | Local (`npm run dev`) |
|---------|-------------|----------------------|
| Browse products | ✅ | ✅ |
| Search & filters | ✅ | ✅ |
| Cart & Wishlist | ✅ | ✅ |
| Checkout (guest) | ✅ | ✅ |
| **Login / Signup** | ❌ | ✅ |
| **Authenticated orders** | ❌ | ✅ |
| **Admin panel** | ❌ | ✅ (coming soon) |

> The GitHub Pages build is a **static single-file HTML**. Auth, orders, and product management require the Express + SQLite backend running locally.

---

## Project structure

```
gaming-e-com-website/
├── index.html
├── package.json
├── vite.config.ts
├── public/                 # logo assets, favicon
├── server/
│   ├── index.js            # Express + SQLite backend
│   └── gamevault.db        # SQLite database (auto-generated)
├── src/
│   ├── App.tsx             # page routing (state-based)
│   ├── main.tsx
│   ├── data/products.json  # catalog
│   ├── context/            # Cart, Wishlist, ProductDetail, Auth
│   ├── pages/              # Home, Products, Checkout, Orders, Login, Signup, …
│   ├── components/         # Navbar, Sidebar, ProductCard, Footer, …
│   ├── assets/             # logo data URL, brand logos
│   └── styles/global.css
└── dist/index.html         # production single-file build
```

---

## User flows

1. **Shop** — Home / Products → filters → product detail  
2. **Save** — ♡ wishlist on card or detail  
3. **Cart** — add items → adjust qty (new stock only)  
4. **Checkout** — address + payment method → Place Order  
5. **Confirm** — order success screen  
6. **History** — My Orders (local to this browser)

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | DB status |
| GET | `/api/products` | List products (`category`, `brand`, `q`) |
| GET | `/api/products/:id` | Single product |
| GET | `/api/meta` | Counts by category/brand |
| POST | `/api/orders` | Place order (**deducts stock**) |
| GET | `/api/orders` | Recent orders |
| GET | `/api/orders/:orderId` | Single order details |
| POST | `/api/auth/signup` | Create account (name, email, phone, password) |
| POST | `/api/auth/login` | Log in (email, password) → returns JWT |
| GET | `/api/auth/me` | Get current user (requires `Authorization` header) |
| POST | `/api/recommendations/cart` | Compatible product recommendations |

Database file: `server/gamevault.db`

## localStorage keys

| Key | Purpose |
|-----|---------|
| `gamevault_cart` | Cart lines (does not change stock) |
| `gamevault_last_order` | Latest order (success page) |
| `gamevault_order_history` | Recent orders list (local cache) |
| `gamevault_wishlist` | Wishlist product IDs |
| `gamevault_last_contact` | Last contact form submit (demo) |
| `gamevault_token` | JWT auth token |
| `gamevault_user` | Logged-in user object (id, name, email, role) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production single-file build |
| `npm run preview` | Serve `dist/` locally |

---

## Notes for evaluators

- Front-end only; payments are **demo**.
- Product photos are **stock images** for UI demonstration.
- Prices and specs are illustrative for a learning project.
- Pre-owned uniqueness and stock caps demonstrate business rules without a server.
- **Login / Signup** requires the local backend (`npm run dev`) — does not work on the GitHub Pages static deployment.
- **Admin features** (product management, user management) are planned and in development.

## Roadmap

- [x] Product catalog with search & filters
- [x] Cart + Wishlist (localStorage)
- [x] Guest checkout with simulated payments
- [x] Login / Signup with JWT auth
- [x] Admin & Customer role separation
- [ ] Admin dashboard — add/edit/remove products
- [ ] Admin user management
- [ ] Stock management panel
- [ ] Discount & pricing controls

---

## Author

**GameVault** — Academic Mini Project  
© 2026 GameVault  
[GitHub Repository](https://github.com/Gamer4225/gaming-e-com-website)

<img width="1917" height="902" alt="image" src="https://github.com/user-attachments/assets/afe5b077-272f-46c4-8aa2-ed204349a39c" />
<img width="1917" height="867" alt="image" src="https://github.com/user-attachments/assets/46752945-1c84-4437-a6d3-97684ba17348" />
https://www.behance.net/gallery/198525953/E-Commerce-Admin-Web-App/modules/1124739089
