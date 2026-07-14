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
      pincode TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Processing'
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
      role TEXT NOT NULL DEFAULT 'customer',
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
  // Migration: add role column if missing
  const cols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  if (!cols.includes("role")) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer'");
  }
  // Migration: add status column if missing
  const ocols = db.prepare("PRAGMA table_info(orders)").all().map(c => c.name);
  if (!ocols.includes("status")) {
    db.exec("ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'Processing'");
  }
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
    role: row.role || "customer",
    createdAt: row.createdAt,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role || "customer" },
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

function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
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

// Seed default admin account if no admin exists
const adminExists = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
if (!adminExists) {
  const adminHash = bcrypt.hashSync("admin123", 10);
  db.prepare(
    "INSERT INTO users (name, email, phone, passwordHash, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
  ).run("Admin", "admin@gamevault.com", "", adminHash, "admin", new Date().toISOString());
  console.log("Default admin seeded: admin@gamevault.com / admin123");
}

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
  const { name, email, phone, password, role } = req.body || {};
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

  // Only allow admin role if caller is a logged-in admin
  const userRole = (role === "admin" && req.user && req.user.role === "admin") ? "admin" : "customer";

  const passwordHash = bcrypt.hashSync(String(password), 10);
  const createdAt = new Date().toISOString();
  const info = db
    .prepare(
      "INSERT INTO users (name, email, phone, passwordHash, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(
      String(name).trim(),
      cleanEmail,
      phone ? String(phone).trim() : "",
      passwordHash,
      userRole,
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


// ---------- Admin ----------
app.get("/api/admin/stats", adminRequired, (_req, res) => {
  const totalProducts = db.prepare("SELECT COUNT(*) as c FROM products").get().c;
  const totalOrders = db.prepare("SELECT COUNT(*) as c FROM orders").get().c;
  const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  const outOfStock = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock = 0").get().c;
  const lowStock = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock > 0 AND stock <= 3").get().c;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(grandTotal),0) as c FROM orders").get().c;
  const catStats = db.prepare(
    "SELECT category, COUNT(*) as total, SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as outOfStock FROM products GROUP BY category ORDER BY category"
  ).all();
  const recentOrders = db.prepare(
    "SELECT orderId, grandTotal, placedAt, status FROM orders ORDER BY id DESC LIMIT 5"
  ).all();
  const recentActivity = db.prepare(
    "SELECT orderId, grandTotal, placedAt, status, 'order' as type FROM orders ORDER BY id DESC LIMIT 10"
  ).all();
  res.json({ totalProducts, totalOrders, totalUsers, outOfStock, lowStock, totalRevenue, catStats, recentOrders, recentActivity });
});

app.get("/api/admin/products", adminRequired, (req, res) => {
  const { q, brand } = req.query;
  let sql = "SELECT * FROM products WHERE 1=1";
  const params = {};
  if (q && String(q).trim()) {
    sql += " AND (LOWER(name) LIKE @q OR LOWER(brand) LIKE @q OR LOWER(category) LIKE @q)";
    params.q = "%" + String(q).trim().toLowerCase() + "%";
  }
  if (brand && brand !== "All") {
    sql += " AND brand = @brand";
    params.brand = String(brand);
  }
  sql += " ORDER BY id ASC";
  res.json(db.prepare(sql).all(params).map(mapProduct));
});

app.post("/api/admin/products", adminRequired, (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.brand || !b.category || !b.price || !b.condition || !b.warranty || !b.description || !b.image) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const maxId = db.prepare("SELECT MAX(id) as m FROM products").get().m || 0;
  const newId = maxId + 1;
  db.prepare("INSERT INTO products (id,name,brand,category,price,originalPrice,discount,condition,warranty,rating,stock,description,image,featured,specs) VALUES (@id,@n,@b,@c,@p,@op,@d,@cd,@w,@r,@s,@desc,@img,@f,@sp)").run({
    id: newId, n: String(b.name).trim(), b: String(b.brand).trim(), c: String(b.category).trim(),
    p: Number(b.price), op: Number(b.originalPrice || b.price), d: Number(b.discount || 0),
    cd: String(b.condition), w: String(b.warranty), r: Number(b.rating || 4),
    s: Number(b.stock || 10), desc: String(b.description), img: String(b.image),
    f: 0, sp: b.specs ? JSON.stringify(b.specs) : null,
  });
  res.status(201).json(mapProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(newId)));
});

app.put("/api/admin/products/:id", adminRequired, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "Product not found" });
  const b = req.body || {};
  db.prepare("UPDATE products SET name=@n,brand=@b,category=@c,price=@p,originalPrice=@op,discount=@d,condition=@cd,warranty=@w,rating=@r,stock=@s,description=@desc,image=@img,specs=@sp WHERE id=@id").run({
    id, n: b.name ?? row.name, b: b.brand ?? row.brand, c: b.category ?? row.category,
    p: b.price ?? row.price, op: b.originalPrice ?? row.originalPrice, d: b.discount ?? row.discount,
    cd: b.condition ?? row.condition, w: b.warranty ?? row.warranty, r: b.rating ?? row.rating,
    s: b.stock ?? row.stock, desc: b.description ?? row.description, img: b.image ?? row.image,
    sp: b.specs !== undefined ? JSON.stringify(b.specs) : row.specs,
  });
  res.json(mapProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(id)));
});

app.delete("/api/admin/products/:id", adminRequired, (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare("SELECT id FROM products WHERE id = ?").get(id)) return res.status(404).json({ error: "Product not found" });
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  res.json({ ok: true, deleted: id });
});

app.patch("/api/admin/products/:id/feature", adminRequired, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare("SELECT featured FROM products WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "Product not found" });
  const newVal = row.featured ? 0 : 1;
  db.prepare("UPDATE products SET featured = ? WHERE id = ?").run(newVal, id);
  res.json({ id, featured: !!newVal });
});

app.patch("/api/admin/products/:id/stock", adminRequired, (req, res) => {
  const id = Number(req.params.id);
  const { stock } = req.body || {};
  if (stock === undefined || Number(stock) < 0) return res.status(400).json({ error: "Valid stock value required" });
  if (!db.prepare("SELECT id FROM products WHERE id = ?").get(id)) return res.status(404).json({ error: "Product not found" });
  db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(Number(stock), id);
  res.json({ id, stock: Number(stock) });
});

app.get("/api/admin/orders", adminRequired, (req, res) => {
  const { status } = req.query;
  let sql = "SELECT * FROM orders WHERE 1=1";
  const params = {};
  if (status && status !== "All") { sql += " AND status = @st"; params.st = String(status); }
  sql += " ORDER BY id DESC";
  const orders = db.prepare(sql).all(params);
  const itemStmt = db.prepare("SELECT * FROM order_items WHERE orderId = ?");
  res.json(orders.map((o) => ({
    orderId: o.orderId, status: o.status || "Processing", paymentMethod: o.paymentMethod, subtotal: o.subtotal, gstAmount: o.gstAmount,
    totalSavings: o.totalSavings, grandTotal: o.grandTotal, itemCount: o.itemCount, placedAt: o.placedAt,
    estimatedDelivery: o.estimatedDelivery,
    address: { fullName: o.fullName, phone: o.phone, email: o.email || "", addressLine1: o.addressLine1, addressLine2: o.addressLine2 || "", city: o.city, state: o.state, pincode: o.pincode },
    items: itemStmt.all(o.orderId).map((i) => ({ id: i.productId, name: i.name, brand: i.brand, image: i.image, price: i.price, originalPrice: i.originalPrice, quantity: i.quantity, condition: i.condition })),
  })));
});

app.get("/api/admin/users", adminRequired, (_req, res) => {
  const users = db.prepare("SELECT id, name, email, phone, role, createdAt FROM users ORDER BY id ASC").all();
  res.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone || "", role: u.role, createdAt: u.createdAt })));
});

app.put("/api/admin/change-password", adminRequired, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || String(newPassword).length < 6) return res.status(400).json({ error: "Current and new password (min 6 chars) required" });
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!bcrypt.compareSync(String(currentPassword), user.passwordHash)) return res.status(401).json({ error: "Current password is incorrect" });
  db.prepare("UPDATE users SET passwordHash = ? WHERE id = ?").run(bcrypt.hashSync(String(newPassword), 10), req.user.id);
  res.json({ ok: true });
});

app.get("/api/admin/brands", adminRequired, (_req, res) => {
  const brands = db.prepare("SELECT DISTINCT brand FROM products ORDER BY brand").all();
  res.json(brands.map((b) => b.brand));
});

app.post("/api/admin/bulk-discount", adminRequired, (req, res) => {
  const { category, discount } = req.body || {};
  if (!category || discount === undefined || Number(discount) < 0 || Number(discount) > 99) {
    return res.status(400).json({ error: "Valid category and discount (0-99) required" });
  }
  const d = Number(discount);
  const rows = db.prepare("SELECT id, price, originalPrice FROM products WHERE category = ?").all(String(category));
  const stmt = db.prepare("UPDATE products SET originalPrice = ?, price = ROUND(? * (100 - ?) / 100), discount = ? WHERE id = ?");
  let count = 0;
  for (const r of rows) {
    const base = r.originalPrice > 0 ? r.originalPrice : r.price;
    stmt.run(base, base, d, d, r.id);
    count++;
  }
  res.json({ ok: true, updated: count, category, discount: d });
});

app.patch("/api/admin/orders/:orderId/status", adminRequired, (req, res) => {
  const { status } = req.body || {};
  const valid = ["Processing", "Shipped", "Delivered", "Cancelled"];
  if (!status || !valid.includes(String(status))) return res.status(400).json({ error: "Invalid status. Use: " + valid.join(", ") });
  const o = db.prepare("SELECT * FROM orders WHERE orderId = ?").get(req.params.orderId);
  if (!o) return res.status(404).json({ error: "Order not found" });
  db.prepare("UPDATE orders SET status = ? WHERE orderId = ?").run(String(status), req.params.orderId);
  res.json({ orderId: req.params.orderId, status: String(status) });
});

app.post("/api/admin/reseed", adminRequired, (_req, res) => {
  if (!fs.existsSync(SEED_PATH)) return res.status(400).json({ error: "Seed file not found" });
  db.prepare("DELETE FROM products").run();
  const products = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  const ins = db.prepare("INSERT INTO products (id,name,brand,category,price,originalPrice,discount,condition,warranty,rating,stock,description,image,featured,specs) VALUES (@id,@n,@b,@c,@p,@op,@d,@cd,@w,@r,@s,@desc,@img,@f,@sp)");
  db.transaction((rows) => { for (const p of rows) ins.run({ id: p.id, n: p.name, b: p.brand, c: p.category, p: p.price, op: p.originalPrice, d: p.discount || 0, cd: p.condition, w: p.warranty, r: p.rating, s: p.stock, desc: p.description, img: p.image, f: p.featured ? 1 : 0, sp: p.specs ? JSON.stringify(p.specs) : null }); })(products);
  res.json({ ok: true, count: products.length });
});

app.listen(PORT, () => {
  console.log(`GameVault API running at http://localhost:${PORT}`);
});
