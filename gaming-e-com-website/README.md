# GameVault — Gaming E-Commerce Mini Project

A modern, dark neon-themed **front-end e-commerce demo** for gaming hardware and accessories.  
Built as an academic mini project with a complete **browse → cart → checkout → order** flow (guest checkout, no real payments).

![Stack](https://img.shields.io/badge/React-19-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6) ![Vite](https://img.shields.io/badge/Vite-7-646cff)

---

## Features

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

### Checkout & orders
- Guest checkout (no account)
- Shipping address form with validation (phone, PIN, required fields)
- Demo payments: COD / UPI / Card (simulated)
- Order confirmation with order ID + delivery estimate
- **Order history** (last 20 orders on this device)
- **Buy Now** from product detail (add + go to checkout)

### Wishlist & extras
- Heart on product cards + wishlist page (`localStorage`)
- About, Contact (demo form), FAQ pages
- Working footer + navbar links (Orders, Wishlist, Contact, FAQ, About)
- Responsive layout, neon GameVault branding

---

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19 + TypeScript |
| Build | Vite 7 + `vite-plugin-singlefile` |
| Styling | Custom CSS (dark gaming theme) |
| State | React Context (`Cart`, `Wishlist`, `ProductDetail`) |
| Persistence | `localStorage` |
| Data | **SQLite** (`server/gamevault.db`) + Express API |
| Fallback | Static `src/data/products.json` if API offline |

### Backend (mini)
- Express API on port **3001**
- SQLite tables: `products`, `orders`, `order_items`
- **Stock decreases only after order/payment** (`POST /api/orders`)
- Adding to cart only reserves qty in the browser cart — does **not** mark Sold Out

**Still demo-only:** payments are simulated (COD/UPI/Card), no real gateway, no auth/admin email.

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
- API: `http://localhost:3001` (SQLite)
- Web: Vite (usually `http://localhost:5173`) with `/api` proxied to the backend

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

---

## Project structure

```
gaming-e-com-website/
├── index.html
├── package.json
├── vite.config.ts
├── public/                 # logo assets, favicon
├── src/
│   ├── App.tsx             # page routing (state-based)
│   ├── main.tsx
│   ├── data/products.json  # catalog
│   ├── context/            # Cart, Wishlist, ProductDetail
│   ├── pages/              # Home, Products, Cart, Checkout, Orders, …
│   ├── components/         # Navbar, Sidebar, ProductCard, …
│   ├── assets/             # logo data URL
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

Database file: `server/gamevault.db`

## localStorage keys

| Key | Purpose |
|-----|---------|
| `gamevault_cart` | Cart lines (does not change stock) |
| `gamevault_last_order` | Latest order (success page) |
| `gamevault_order_history` | Recent orders list (local cache) |
| `gamevault_wishlist` | Wishlist product IDs |
| `gamevault_last_contact` | Last contact form submit (demo) |

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

---

## Author

**GameVault** — Academic Mini Project  
© 2026 GameVault
