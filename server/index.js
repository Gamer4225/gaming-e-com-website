// GameVault mini backend — Express + SQLite
// Products & stock live in server/gamevault.db
// Stock decreases only after a successful order (payment).

import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "gamevault-mini-secret-change-me";
const JWT_EXPIRES = "7d";
const DB_PATH = path.join(__dirname, "gamevault.db");
const SEED_PATH = path.join(__dirname, "..", "src", "data", "products.json");

function openDb() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

function ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      originalPrice INTEGER NOT NULL,
      discount INTEGER NOT NULL DEFAULT 0,
      condition TEXT NOT NULL,
      warranty TEXT NOT NULL,
      rating REAL NOT NULL,
      stock INTEGER NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      specs TEXT
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT NOT NULL UNIQUE,
      paymentMethod TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      gstAmount INTEGER NOT NULL,
      totalSavings INTEGER NOT NULL,
      grandTotal INTEGER NOT NULL,
      itemCount INTEGER NOT NULL,
      placedAt TEXT NOT NULL,
      estimatedDelivery TEXT NOT NULL,
      fullName TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      addressLine1 TEXT NOT NULL,
      addressLine2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT NOT NULL,
      productId INTEGER NOT NULL,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      image TEXT NOT NULL,
      price INTEGER NOT NULL,
      originalPrice INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      condition TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
    CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId);
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
}

function seedIfEmpty(db) {
  const count = db.prepare("SELECT COUNT(*) as c FROM products").get().c;
  if (count > 0) return count;
  if (!fs.existsSync(SEED_PATH)) {
    console.warn("No seed file found at", SEED_PATH);
    return 0;
  }
  const products = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  const insert = db.prepare(`
    INSERT INTO products (
      id, name, brand, category, price, originalPrice, discount, condition,
      warranty, rating, stock, description, image, featured, specs
    ) VALUES (
      @id, @name, @brand, @category, @price, @originalPrice, @discount, @condition,
      @warranty, @rating, @stock, @description, @image, @featured, @specs
    )
  `);
  const tx = db.transaction((rows) => {
    for (const p of rows) {
      insert.run({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount || 0,
        condition: p.condition,
        warranty: p.warranty,
        rating: p.rating,
        stock: p.stock,
        description: p.description,
        image: p.image,
        featured: p.featured ? 1 : 0,
        specs: p.specs ? JSON.stringify(p.specs) : null,
      });
    }
  });
  tx(products);
  return products.length;
}

function mapProduct(row) {
  if (!row) return null;
  let specs = undefined;
  if (row.specs) {
    try {
      specs = JSON.parse(row.specs);
    } catch {
      specs = undefined;
    }
  }
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    originalPrice: row.originalPrice,
    discount: row.discount,
    condition: row.condition,
    warranty: row.warranty,
    rating: row.rating,
    stock: row.stock,
    description: row.description,
    image: row.image,
    featured: !!row.featured,
    ...(specs ? { specs } : {}),
  };
}


function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    createdAt: row.createdAt,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function authOptional(req, _res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
}

function authRequired(req, res, next) {
  authOptional(req, res, () => {
    if (!req.user) return res.status(401).json({ error: "Login required" });
    next();
  });
}

/** Compatibility pairs for frequently bought together */
const COMPAT_MAP = {
  CPU: ["PC Cabinet", "RAM", "SSD", "GPU", "Monitor"],
  GPU: ["PC Cabinet", "CPU", "Monitor", "RAM", "SSD"],
  RAM: ["CPU", "SSD", "PC Cabinet", "GPU"],
  SSD: ["CPU", "RAM", "PC Cabinet", "GPU"],
  "PC Cabinet": ["CPU", "GPU", "RAM", "SSD", "Gaming Desk"],
  Monitor: ["GPU", "Gaming Desk", "Gaming Chair", "Gaming Headset"],
  "Gaming Laptop": ["Gaming Mouse", "Gaming Headset", "Monitor", "SSD"],
  Console: ["Controller", "Gaming Headset", "Monitor", "SSD"],
  Controller: ["Console", "Gaming Headset", "Handheld Gaming"],
  "Handheld Gaming": ["Controller", "SSD", "Gaming Headset"],
  "Gaming Mouse": ["Gaming Keyboard", "Gaming Headset", "Gaming Mousepad", "PC Cabinet"],
  "Gaming Keyboard": ["Gaming Mouse", "Gaming Headset", "PC Cabinet"],
  "Gaming Headset": ["Gaming Mouse", "Gaming Keyboard", "Console", "Monitor"],
  "Gaming Chair": ["Gaming Desk", "Monitor", "PC Cabinet"],
  "Gaming Desk": ["Gaming Chair", "Monitor", "PC Cabinet"],
  Tablet: ["Gaming Headset", "SSD"],
};

function recommendForCart(db, cartItems, limit = 6) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return [];
  const cartIds = new Set(cartItems.map((i) => Number(i.id)));
  const categories = cartItems
    .map((i) => {
      const row = db.prepare("SELECT category FROM products WHERE id = ?").get(Number(i.id));
      return row?.category;
    })
    .filter(Boolean);

  const targetCats = [];
  for (const cat of categories) {
    for (const t of COMPAT_MAP[cat] || []) {
      if (!categories.includes(t) && !targetCats.includes(t)) targetCats.push(t);
    }
  }
  // Always consider cabinets for PC component carts
  const componentCats = ["CPU", "GPU", "RAM", "SSD"];
  if (categories.some((c) => componentCats.includes(c)) && !targetCats.includes("PC Cabinet") && !categories.includes("PC Cabinet")) {
    targetCats.unshift("PC Cabinet");
  }
  if (targetCats.length === 0) {
    targetCats.push("PC Cabinet", "SSD", "RAM", "Gaming Headset");
  }

  const recs = [];
  const seen = new Set(cartIds);
  for (const cat of targetCats) {
    const rows = db
      .prepare(
        "SELECT * FROM products WHERE category = ? AND stock > 0 ORDER BY featured DESC, rating DESC, stock DESC LIMIT 8"
      )
      .all(cat);
    for (const row of rows) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      recs.push(mapProduct(row));
      if (recs.length >= limit) return recs;
    }
  }
  // fill remaining with top rated other categories
  if (recs.length < limit) {
    const rows = db
      .prepare("SELECT * FROM products WHERE stock > 0 ORDER BY rating DESC LIMIT 30")
      .all();
    for (const row of rows) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      recs.push(mapProduct(row));
      if (recs.length >= limit) break;
    }
  }
  return recs;
}


const db = openDb();
ensureSchema(db);
const seeded = seedIfEmpty(db);
console.log(`SQLite ready: ${db.prepare("SELECT COUNT(*) as c FROM products").get().c} products` + (seeded ? ` (seeded ${seeded})` : ""));

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    products: db.prepare("SELECT COUNT(*) as c FROM products").get().c,
    orders: db.prepare("SELECT COUNT(*) as c FROM orders").get().c,
  });
});

// List products with optional filters
app.get("/api/products", (req, res) => {
  const { category, brand, q, featured } = req.query;
  let sql = "SELECT * FROM products WHERE 1=1";
  const params = {};
  if (category && category !== "All") {
    sql += " AND category = @category";
    params.category = String(category);
  }
  if (brand && brand !== "All") {
    sql += " AND brand = @brand";
    params.brand = String(brand);
  }
  if (featured === "1" || featured === "true") {
    sql += " AND featured = 1";
  }
  if (q && String(q).trim()) {
    sql +=
      " AND (LOWER(name) LIKE @q OR LOWER(brand) LIKE @q OR LOWER(category) LIKE @q OR LOWER(description) LIKE @q)";
    params.q = `%${String(q).trim().toLowerCase()}%`;
  }
  sql += " ORDER BY id ASC";
  const rows = db.prepare(sql).all(params).map(mapProduct);
  res.json(rows);
});

app.get("/api/products/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: "Product not found" });
  res.json(mapProduct(row));
});

app.get("/api/meta", (_req, res) => {
  const categories = db
    .prepare("SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category")
    .all();
  const brands = db
    .prepare("SELECT brand, COUNT(*) as count FROM products GROUP BY brand ORDER BY brand")
    .all();
  const total = db.prepare("SELECT COUNT(*) as c FROM products").get().c;
  const inStock = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock > 0").get().c;
  res.json({ total, inStock, categories, brands });
});

// Place order — stock is reduced only here (after "payment")
app.post("/api/orders", (req, res) => {
  const { items, address, paymentMethod } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }
  if (!address || !address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
    return res.status(400).json({ error: "Incomplete shipping address" });
  }
  if (!paymentMethod || !["cod", "upi", "card"].includes(paymentMethod)) {
    return res.status(400).json({ error: "Invalid payment method" });
  }

  const getProduct = db.prepare("SELECT * FROM products WHERE id = ?");
  const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?");
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      orderId, paymentMethod, subtotal, gstAmount, totalSavings, grandTotal, itemCount,
      placedAt, estimatedDelivery, fullName, phone, email, addressLine1, addressLine2,
      city, state, pincode
    ) VALUES (
      @orderId, @paymentMethod, @subtotal, @gstAmount, @totalSavings, @grandTotal, @itemCount,
      @placedAt, @estimatedDelivery, @fullName, @phone, @email, @addressLine1, @addressLine2,
      @city, @state, @pincode
    )
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (
      orderId, productId, name, brand, image, price, originalPrice, quantity, condition
    ) VALUES (
      @orderId, @productId, @name, @brand, @image, @price, @originalPrice, @quantity, @condition
    )
  `);

  try {
    const result = db.transaction(() => {
      const resolved = [];
      for (const line of items) {
        const id = Number(line.id);
        const qty = Math.max(1, Number(line.quantity) || 1);
        const product = getProduct.get(id);
        if (!product) {
          throw Object.assign(new Error(`Product #${id} not found`), { status: 400 });
        }
        if (product.stock < qty) {
          throw Object.assign(
            new Error(
              product.stock <= 0
                ? `${product.name} is sold out`
                : `Only ${product.stock} left for ${product.name}`
            ),
            { status: 409 }
          );
        }
        if (product.condition === "Pre-Owned" && qty > 1) {
          throw Object.assign(new Error(`${product.name} is unique (pre-owned) — max qty 1`), {
            status: 400,
          });
        }
        resolved.push({ product, qty });
      }

      // Deduct stock only after validation (payment moment)
      for (const { product, qty } of resolved) {
        const info = updateStock.run(qty, product.id, qty);
        if (info.changes !== 1) {
          throw Object.assign(new Error(`Could not reserve stock for ${product.name}`), {
            status: 409,
          });
        }
      }

      const orderItems = resolved.map(({ product, qty }) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: qty,
        condition: product.condition,
      }));

      const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const gstAmount = Math.round(subtotal * 0.18);
      const totalSavings = orderItems.reduce(
        (s, i) => s + (i.originalPrice - i.price) * i.quantity,
        0
      );
      const grandTotal = subtotal + gstAmount;
      const itemCount = orderItems.reduce((s, i) => s + i.quantity, 0);

      const delivery = new Date();
      delivery.setDate(delivery.getDate() + 3 + Math.floor(Math.random() * 3));
      const estimatedDelivery = delivery.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const orderId = `GV-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      const placedAt = new Date().toISOString();

      insertOrder.run({
        orderId,
        paymentMethod,
        subtotal,
        gstAmount,
        totalSavings,
        grandTotal,
        itemCount,
        placedAt,
        estimatedDelivery,
        fullName: String(address.fullName).trim(),
        phone: String(address.phone).trim(),
        email: address.email ? String(address.email).trim() : "",
        addressLine1: String(address.addressLine1).trim(),
        addressLine2: address.addressLine2 ? String(address.addressLine2).trim() : "",
        city: String(address.city).trim(),
        state: String(address.state).trim(),
        pincode: String(address.pincode).trim(),
      });

      for (const item of orderItems) {
        insertItem.run({
          orderId,
          productId: item.id,
          name: item.name,
          brand: item.brand,
          image: item.image,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          condition: item.condition,
        });
      }

      // Return updated stocks for cart items so UI can refresh
      const updatedStocks = resolved.map(({ product }) => {
        const row = getProduct.get(product.id);
        return { id: product.id, stock: row.stock };
      });

      return {
        orderId,
        items: orderItems,
        address: {
          fullName: String(address.fullName).trim(),
          phone: String(address.phone).trim(),
          email: address.email ? String(address.email).trim() : "",
          addressLine1: String(address.addressLine1).trim(),
          addressLine2: address.addressLine2 ? String(address.addressLine2).trim() : "",
          city: String(address.city).trim(),
          state: String(address.state).trim(),
          pincode: String(address.pincode).trim(),
        },
        paymentMethod,
        subtotal,
        gstAmount,
        totalSavings,
        grandTotal,
        itemCount,
        placedAt,
        estimatedDelivery,
        updatedStocks,
      };
    })();

    res.status(201).json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Order failed" });
  }
});

app.get("/api/orders", (_req, res) => {
  const orders = db.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 50").all();
  const itemStmt = db.prepare("SELECT * FROM order_items WHERE orderId = ?");
  res.json(
    orders.map((o) => ({
      orderId: o.orderId,
      paymentMethod: o.paymentMethod,
      subtotal: o.subtotal,
      gstAmount: o.gstAmount,
      totalSavings: o.totalSavings,
      grandTotal: o.grandTotal,
      itemCount: o.itemCount,
      placedAt: o.placedAt,
      estimatedDelivery: o.estimatedDelivery,
      address: {
        fullName: o.fullName,
        phone: o.phone,
        email: o.email || "",
        addressLine1: o.addressLine1,
        addressLine2: o.addressLine2 || "",
        city: o.city,
        state: o.state,
        pincode: o.pincode,
      },
      items: itemStmt.all(o.orderId).map((i) => ({
        id: i.productId,
        name: i.name,
        brand: i.brand,
        image: i.image,
        price: i.price,
        originalPrice: i.originalPrice,
        quantity: i.quantity,
        condition: i.condition,
      })),
    }))
  );
});

app.get("/api/orders/:orderId", (req, res) => {
  const o = db.prepare("SELECT * FROM orders WHERE orderId = ?").get(req.params.orderId);
  if (!o) return res.status(404).json({ error: "Order not found" });
  const items = db
    .prepare("SELECT * FROM order_items WHERE orderId = ?")
    .all(o.orderId)
    .map((i) => ({
      id: i.productId,
      name: i.name,
      brand: i.brand,
      image: i.image,
      price: i.price,
      originalPrice: i.originalPrice,
      quantity: i.quantity,
      condition: i.condition,
    }));
  res.json({
    orderId: o.orderId,
    paymentMethod: o.paymentMethod,
    subtotal: o.subtotal,
    gstAmount: o.gstAmount,
    totalSavings: o.totalSavings,
    grandTotal: o.grandTotal,
    itemCount: o.itemCount,
    placedAt: o.placedAt,
    estimatedDelivery: o.estimatedDelivery,
    address: {
      fullName: o.fullName,
      phone: o.phone,
      email: o.email || "",
      addressLine1: o.addressLine1,
      addressLine2: o.addressLine2 || "",
      city: o.city,
      state: o.state,
      pincode: o.pincode,
    },
    items,
  });
});


// ---------- Auth ----------
app.post("/api/auth/signup", (req, res) => {
  const { name, email, phone, password } = req.body || {};
  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: "Enter your full name" });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return res.status(400).json({ error: "Enter a valid email" });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(cleanEmail);
  if (existing) return res.status(409).json({ error: "Email already registered — please login" });

  const passwordHash = bcrypt.hashSync(String(password), 10);
  const createdAt = new Date().toISOString();
  const info = db
    .prepare(
      "INSERT INTO users (name, email, phone, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)"
    )
    .run(
      String(name).trim(),
      cleanEmail,
      phone ? String(phone).trim() : "",
      passwordHash,
      createdAt
    );
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const cleanEmail = String(email).trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });
  const ok = bcrypt.compareSync(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

app.get("/api/auth/me", authRequired, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(401).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

// Frequently bought together / compatibility recommendations for cart
app.post("/api/recommendations/cart", (req, res) => {
  const items = req.body?.items || [];
  const limit = Math.min(12, Number(req.body?.limit) || 6);
  const recs = recommendForCart(db, items, limit);
  res.json({ items: recs });
});


app.listen(PORT, () => {
  console.log(`GameVault API running at http://localhost:${PORT}`);
});
