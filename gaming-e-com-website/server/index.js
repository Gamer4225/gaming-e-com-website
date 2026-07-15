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
      specs TEXT,
      sellerId INTEGER,
      sku TEXT,
      slug TEXT,
      weight REAL DEFAULT 0,
      images TEXT,
      stockReserved INTEGER DEFAULT 0,
      stockIncoming INTEGER DEFAULT 0,
      totalSold INTEGER DEFAULT 0
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
      status TEXT NOT NULL DEFAULT 'Processing',
      userId INTEGER
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
      brand TEXT,
      sellerId TEXT,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE TABLE IF NOT EXISTS wishlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL UNIQUE,
      count INTEGER NOT NULL DEFAULT 1,
      lastAdded TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      userId INTEGER,
      userName TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      verified INTEGER NOT NULL DEFAULT 0,
      helpfulVotes INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (productId) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discountType TEXT NOT NULL DEFAULT 'percentage',
      discountValue INTEGER NOT NULL,
      minCart INTEGER NOT NULL DEFAULT 0,
      maxUses INTEGER,
      currentUses INTEGER NOT NULL DEFAULT 0,
      category TEXT,
      expiresAt TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      userName TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_productId ON reviews(productId);
    CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_createdAt ON activity_logs(createdAt);
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
  if (!ocols.includes("userId")) {
    try { db.exec("ALTER TABLE orders ADD COLUMN userId INTEGER"); } catch {}
  }

  // New tables migration (for existing DBs that don't have these)
  try { db.exec("CREATE TABLE IF NOT EXISTS wishlists (id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER NOT NULL UNIQUE, count INTEGER NOT NULL DEFAULT 1, lastAdded TEXT NOT NULL)"); } catch(e) { console.log("wishlists migration:", e.message); }
  try { db.exec("CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER NOT NULL, userId INTEGER, userName TEXT NOT NULL, rating INTEGER NOT NULL, comment TEXT, status TEXT DEFAULT 'pending', verified INTEGER DEFAULT 0, helpfulVotes INTEGER DEFAULT 0, createdAt TEXT NOT NULL)"); } catch {}
  try { db.exec("CREATE TABLE IF NOT EXISTS coupons (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE, discountType TEXT DEFAULT 'percentage', discountValue INTEGER, minCart INTEGER DEFAULT 0, maxUses INTEGER, currentUses INTEGER DEFAULT 0, category TEXT, expiresAt TEXT, status TEXT DEFAULT 'active', createdAt TEXT NOT NULL)"); } catch {}
  try { db.exec("CREATE TABLE IF NOT EXISTS activity_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, userName TEXT NOT NULL, action TEXT NOT NULL, details TEXT, createdAt TEXT NOT NULL)"); } catch {}
  try { db.exec("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)"); } catch {}
  
  // Users table migrations
  const ucols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  if (!ucols.includes("brand")) { try { db.exec("ALTER TABLE users ADD COLUMN brand TEXT"); } catch {} }
  if (!ucols.includes("sellerId")) { try { db.exec("ALTER TABLE users ADD COLUMN sellerId TEXT"); } catch {} }

  // Products table migrations
  const pcols = db.prepare("PRAGMA table_info(products)").all().map(c => c.name);
  if (!pcols.includes("sellerId")) { try { db.exec("ALTER TABLE products ADD COLUMN sellerId INTEGER"); } catch {} }
  if (!pcols.includes("sku")) { try { db.exec("ALTER TABLE products ADD COLUMN sku TEXT"); } catch {} }
  if (!pcols.includes("slug")) { try { db.exec("ALTER TABLE products ADD COLUMN slug TEXT"); } catch {} }
  if (!pcols.includes("weight")) { try { db.exec("ALTER TABLE products ADD COLUMN weight REAL DEFAULT 0"); } catch {} }
  if (!pcols.includes("images")) { try { db.exec("ALTER TABLE products ADD COLUMN images TEXT"); } catch {} }
  if (!pcols.includes("stockReserved")) { try { db.exec("ALTER TABLE products ADD COLUMN stockReserved INTEGER DEFAULT 0"); } catch {} }
  if (!pcols.includes("stockIncoming")) { try { db.exec("ALTER TABLE products ADD COLUMN stockIncoming INTEGER DEFAULT 0"); } catch {} }
  if (!pcols.includes("totalSold")) { try { db.exec("ALTER TABLE products ADD COLUMN totalSold INTEGER DEFAULT 0"); } catch {} }
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
    sku: row.sku || "",
    slug: row.slug || "",
    weight: row.weight || 0,
    images: row.images || "",
    stockReserved: row.stockReserved || 0,
    stockIncoming: row.stockIncoming || 0,
    totalSold: row.totalSold || 0,
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
    brand: row.brand || "",
    createdAt: row.createdAt,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role || "customer", brand: user.brand || "" },
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

function subAdminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== "sub-admin" && req.user.role !== "admin") return res.status(403).json({ error: "Sub-admin access required" });
    next();
  });
}

function staffRequired(req, res, next) {
  authRequired(req, res, () => {
    if (!["admin", "sub-admin", "merchant", "seller"].includes(req.user.role)) return res.status(403).json({ error: "Staff access required" });
    next();
  });
}

function merchantRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== "merchant") return res.status(403).json({ error: "Merchant access required" });
    next();
  });
}

function sellerRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== "seller") return res.status(403).json({ error: "Seller access required" });
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
  const h = bcrypt.hashSync("admin123", 10);
  const ins = db.prepare("INSERT INTO users (name, email, phone, passwordHash, role, brand, sellerId, createdAt) VALUES (?,?,?,?,?,?,?,?)");
  ins.run("Admin", "admin@gamevault.com", "", h, "admin", "", "", new Date().toISOString());
  ins.run("Sub Admin", "subadmin@gamevault.com", "", h, "sub-admin", "", "", new Date().toISOString());
  ins.run("ASUS Rep", "merchant@gamevault.com", "", h, "merchant", "ASUS", "", new Date().toISOString());
  ins.run("Seller One", "seller@gamevault.com", "", h, "seller", "", "S001", new Date().toISOString());
  console.log("Default accounts seeded (all password: admin123)");
  console.log("  admin@gamevault.com | subadmin@gamevault.com | merchant@gamevault.com | seller@gamevault.com");
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

function logActivity(db, userId, userName, action, details) {
  db.prepare("INSERT INTO activity_logs (userId, userName, action, details, createdAt) VALUES (?,?,?,?,?)").run(
    userId || null, userName || "System", action, details || "", new Date().toISOString()
  );
}

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
app.post("/api/orders", authOptional, (req, res) => {
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
      @city, @state, @pincode, @userId
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
      // Track order metrics
      db.prepare("UPDATE products SET stockReserved = MAX(0, stockReserved - ?), totalSold = totalSold + ? WHERE id = ?").run(qty, qty, id);
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
      const orderUserId = req.user ? req.user.id : null;

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
        userId: orderUserId,
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

      // Log the order
      logActivity(db, req.user?.id, req.user?.name || req.body.address?.fullName || "Guest", "order_placed", `Order ${orderId} - ₹${grandTotal}`);

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

  // Role gating: admin can create any role; others default to customer
  let userRole = "customer";
  if (req.user && req.user.role === "admin" && role && ["admin", "sub-admin", "merchant", "seller", "customer"].includes(String(role))) {
    userRole = String(role);
  }
  const userBrand = req.user && req.user.role === "admin" && role === "merchant" ? (req.body.brand || "") : "";
  const userSellerId = userRole === "seller" ? "S" + Date.now().toString(36).toUpperCase() : null;

  const passwordHash = bcrypt.hashSync(String(password), 10);
  const createdAt = new Date().toISOString();
  const info = db
    .prepare(
      "INSERT INTO users (name, email, phone, passwordHash, role, brand, sellerId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      String(name).trim(),
      cleanEmail,
      phone ? String(phone).trim() : "",
      passwordHash,
      userRole,
      userBrand,
      userSellerId,
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

// Reserve stock when adding to cart (prevents overselling)
app.post("/api/cart/reserve", (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) return res.status(400).json({ error: "items array required" });
  for (const { id, quantity } of items) {
    if (!id || !quantity) continue;
    db.prepare("UPDATE products SET stockReserved = stockReserved + ? WHERE id = ? AND stock - stockReserved >= ?").run(Number(quantity), Number(id), Number(quantity));
  }
  res.json({ ok: true });
});

app.post("/api/cart/release", (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) return res.status(400).json({ error: "items array required" });
  for (const { id, quantity } of items) {
    if (!id || !quantity) continue;
    db.prepare("UPDATE products SET stockReserved = MAX(0, stockReserved - ?) WHERE id = ?").run(Number(quantity), Number(id));
  }
  res.json({ ok: true });
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
  const completedOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'Delivered'").get().c;
  const pendingOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'Processing'").get().c;
  const cancelledOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'Cancelled'").get().c;
  const avgOrderValue = completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0;
  const catStats = db.prepare("SELECT category, COUNT(*) as total, SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as outOfStock FROM products GROUP BY category ORDER BY total DESC").all();
  const recentOrders = db.prepare("SELECT orderId, grandTotal, placedAt, status, fullName FROM orders ORDER BY id DESC LIMIT 10").all();
  const recentActivity = db.prepare("SELECT orderId, grandTotal, placedAt, status, fullName FROM orders ORDER BY id DESC LIMIT 12").all();
  const topProducts = db.prepare("SELECT oi.productId as id, oi.name, oi.brand, oi.image, p.category, p.stock, p.price, SUM(oi.quantity) as sold, COUNT(DISTINCT oi.orderId) as timesOrdered FROM order_items oi JOIN products p ON p.id = oi.productId GROUP BY oi.productId ORDER BY sold DESC LIMIT 8").all();
  const wishlistTop = db.prepare("SELECT p.id, p.name, p.brand, p.category, p.price, p.stock, p.rating, p.featured, COALESCE(w.count,0) as wishlistCount FROM products p LEFT JOIN wishlists w ON w.productId = p.id ORDER BY w.count DESC, p.rating DESC LIMIT 8").all();
  // Revenue per day (last 30 days)
  const revPerDay = db.prepare("SELECT DATE(placedAt) as day, COALESCE(SUM(grandTotal),0) as revenue FROM orders WHERE placedAt > date('now','-30 days') GROUP BY DATE(placedAt) ORDER BY day").all();
  res.json({ totalProducts, totalOrders, totalUsers, outOfStock, lowStock, totalRevenue, completedOrders, pendingOrders, cancelledOrders, avgOrderValue, catStats, recentOrders, recentActivity, topProducts, wishlistTop, revPerDay });
});

app.get("/api/admin/products", adminRequired, (req, res) => {
  const { q, brand, filter } = req.query;
  let sql = "SELECT * FROM products WHERE 1=1";
  const params = {};
  if (q && String(q).trim()) {
    sql += " AND (LOWER(name) LIKE @q OR LOWER(brand) LIKE @q OR LOWER(category) LIKE @q)";
    params.q = "%" + String(q).trim().toLowerCase() + "%";
  }
  if (brand && brand !== "All") { sql += " AND brand = @brand"; params.brand = String(brand); }
  if (filter === "low") sql += " AND stock > 0 AND stock <= 5";
  if (filter === "out") sql += " AND stock = 0";
  sql += " ORDER BY id ASC";
  res.json(db.prepare(sql).all(params).map(mapProduct));
});

app.get("/api/admin/products-stats", adminRequired, (_req, res) => {
  const total = db.prepare("SELECT COUNT(*) as c FROM products").get().c;
  const totalValue = db.prepare("SELECT COALESCE(SUM(price*stock),0) as c FROM products").get().c;
  const low = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock > 0 AND stock <= 5").get().c;
  const oos = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock = 0").get().c;
  res.json({ total, totalValue, low, oos });
});

// Old products endpoint (replaced)
app.get("/api/admin/products_old", adminRequired, (req, res) => {
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

// ---------- Wishlist ----------
app.get("/api/wishlist", (req, res) => {
  const ids = db.prepare("SELECT productId FROM wishlists ORDER BY lastAdded DESC").all().map(r => r.productId);
  res.json({ ids });
});

// Customer review submission (anyone can submit)
app.post("/api/reviews", (req, res) => {
  const { productId, rating, comment, userName } = req.body || {};
  if (!productId || !rating || !userName) return res.status(400).json({ error: "productId, rating, userName required" });
  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(Number(productId));
  if (!product) return res.status(404).json({ error: "Product not found" });
  db.prepare("INSERT INTO reviews (productId, userId, userName, rating, comment, status, verified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    Number(productId), req.user?.id || null, String(userName), Number(rating), String(comment || ""), "pending", 0, new Date().toISOString()
  );
  logActivity(db, req.user?.id, req.user?.name || String(userName), "review_submitted", `Review for product #${productId} - ${rating} stars`);
  res.status(201).json({ ok: true, msg: "Review submitted for moderation" });
});

// Get reviews for a specific product (public)
app.get("/api/reviews/:productId", (req, res) => {
  const rows = db.prepare("SELECT id, userName, rating, comment, status, verified, createdAt FROM reviews WHERE productId = ? AND status = 'approved' ORDER BY id DESC LIMIT 50").all(Number(req.params.productId));
  res.json(rows);
});

app.post("/api/wishlist/:id", (req, res) => {
  const productId = Number(req.params.id);
  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const existing = db.prepare("SELECT * FROM wishlists WHERE productId = ?").get(productId);
  if (existing) {
    db.prepare("DELETE FROM wishlists WHERE productId = ?").run(productId);
    res.json({ added: false, productId });
  } else {
    db.prepare("INSERT INTO wishlists (productId, count, lastAdded) VALUES (?, 1, ?)").run(productId, new Date().toISOString());
    res.json({ added: true, productId });
  }
  console.log("Wishlist toggle: product " + productId + (existing ? " removed, count=" + (db.prepare("SELECT COUNT(*) as c FROM wishlists").get().c) : " added, count=" + db.prepare("SELECT COUNT(*) as c FROM wishlists").get().c));
});

app.post("/api/wishlist/sync", (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids)) return res.status(400).json({ error: "ids array required" });
  const existing = new Set(db.prepare("SELECT productId FROM wishlists").all().map(r => r.productId));
  const newIds = new Set(ids.filter(id => typeof id === "number"));
  // Remove items no longer in client list
  for (const eid of existing) { if (!newIds.has(eid)) db.prepare("DELETE FROM wishlists WHERE productId = ?").run(eid); }
  // Add new items
  const now = new Date().toISOString();
  for (const nid of newIds) { if (!existing.has(nid)) db.prepare("INSERT OR IGNORE INTO wishlists (productId, count, lastAdded) VALUES (?, 1, ?)").run(nid, now); }
  res.json({ ok: true, synced: db.prepare("SELECT COUNT(*) as c FROM wishlists").get().c });
});

// Most ordered products

app.get("/api/admin/most-ordered", adminRequired, (_req, res) => {
  const rows = db.prepare(`
    SELECT oi.productId as id, oi.name, oi.brand, oi.image, p.category, p.stock, p.price,
           SUM(oi.quantity) as orderCount, COUNT(DISTINCT oi.orderId) as timesOrdered
    FROM order_items oi JOIN products p ON p.id = oi.productId
    GROUP BY oi.productId ORDER BY orderCount DESC LIMIT 30
  `).all();
  res.json(rows);
});

// Most wishlisted products (real DB data)
app.get("/api/admin/most-wishlisted", adminRequired, (_req, res) => {
  const rows = db.prepare(`
    SELECT p.id, p.name, p.brand, p.category, p.price, p.stock, p.image, p.rating, p.featured,
           COALESCE(w.count, 0) as wishlistCount
    FROM products p LEFT JOIN wishlists w ON w.productId = p.id
    ORDER BY w.count DESC, p.rating DESC LIMIT 30
  `).all();
  res.json(rows);
});

// Staff-role overview stats (scoped by role)
app.get("/api/staff/stats", staffRequired, (req, res) => {
  let productFilter = "";
  let orderFilter = "";
  const params = {};
  if (req.user.role === "merchant") {
    const u = db.prepare("SELECT brand FROM users WHERE id = ?").get(req.user.id);
    productFilter = " AND brand = @brand";
    params.brand = u?.brand || "";
  }
  if (req.user.role === "seller") {
    productFilter = " AND sellerId = @sid";
    params.sid = req.user.id;
  }
  const totalProducts = db.prepare("SELECT COUNT(*) as c FROM products WHERE 1=1" + productFilter).get(params).c;
  const outOfStock = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock = 0" + productFilter).get(params).c;
  const lowStock = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock > 0 AND stock <= 3" + productFilter).get(params).c;
  res.json({ totalProducts, outOfStock, lowStock });
});

// Staff products (scoped)
app.get("/api/staff/products", staffRequired, (req, res) => {
  let filter = "";
  const params = {};
  if (req.user.role === "merchant") {
    const u = db.prepare("SELECT brand FROM users WHERE id = ?").get(req.user.id);
    filter = " AND brand = @brand";
    params.brand = u?.brand || "";
  }
  if (req.user.role === "seller") {
    filter = " AND sellerId = @sid";
    params.sid = req.user.id;
  }
  const { q } = req.query;
  if (q && String(q).trim()) {
    filter += " AND (LOWER(name) LIKE @q OR LOWER(brand) LIKE @q)";
    params.q = "%" + String(q).trim().toLowerCase() + "%";
  }
  res.json(db.prepare("SELECT * FROM products WHERE 1=1" + filter + " ORDER BY id ASC").all(params).map(mapProduct));
});

// Staff add product (merchant = their brand, seller = auto pre-owned + sellerId)
app.post("/api/staff/products", staffRequired, (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.brand || !b.category || !b.price || !b.description || !b.image) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const maxId = db.prepare("SELECT MAX(id) as m FROM products").get().m || 0;
  const newId = maxId + 1;
  let brand = String(b.brand);
  let condition = String(b.condition || "New");
  let sellerId = null;
  if (req.user.role === "merchant") {
    const u = db.prepare("SELECT brand FROM users WHERE id = ?").get(req.user.id);
    brand = u?.brand || brand;
  }
  if (req.user.role === "seller") {
    condition = "Pre-Owned";
    sellerId = req.user.id;
  }
  db.prepare("INSERT INTO products (id,name,brand,category,price,originalPrice,discount,condition,warranty,rating,stock,description,image,featured,specs,sellerId) VALUES (@id,@n,@b,@c,@p,@op,@d,@cd,@w,@r,@s,@desc,@img,@f,@sp,@sid)").run({
    id: newId, n: String(b.name).trim(), b: brand, c: String(b.category).trim(),
    p: Number(b.price), op: Number(b.originalPrice || b.price), d: Number(b.discount || 0),
    cd: condition, w: String(b.warranty || "1 Year"), r: Number(b.rating || 4),
    s: Number(b.stock || 1), desc: String(b.description), img: String(b.image),
    f: 0, sp: b.specs ? JSON.stringify(b.specs) : null, sid: sellerId,
  });
  res.status(201).json(mapProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(newId)));
});

// Staff edit product
app.put("/api/staff/products/:id", staffRequired, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "Product not found" });
  if (req.user.role === "seller" && row.sellerId !== req.user.id) return res.status(403).json({ error: "Not your listing" });
  if (req.user.role === "merchant") { const u = db.prepare("SELECT brand FROM users WHERE id = ?").get(req.user.id); if (row.brand !== u?.brand) return res.status(403).json({ error: "Not your brand" }); }
  const b = req.body || {};
  db.prepare("UPDATE products SET name=@n,brand=@b,category=@c,price=@p,originalPrice=@op,discount=@d,warranty=@w,rating=@r,stock=@s,description=@desc,image=@img WHERE id=@id").run({
    id, n: b.name ?? row.name, b: b.brand ?? row.brand, c: b.category ?? row.category,
    p: b.price ?? row.price, op: b.originalPrice ?? row.originalPrice, d: b.discount ?? row.discount,
    w: b.warranty ?? row.warranty, r: b.rating ?? row.rating, s: b.stock ?? row.stock,
    desc: b.description ?? row.description, img: b.image ?? row.image,
  });
  res.json(mapProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(id)));
});

// Staff update stock
app.patch("/api/staff/products/:id/stock", staffRequired, (req, res) => {
  const id = Number(req.params.id);
  const { stock } = req.body || {};
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "Product not found" });
  // Seller can only touch their own
  if (req.user.role === "seller" && row.sellerId !== req.user.id) return res.status(403).json({ error: "Not your listing" });
  if (req.user.role === "merchant") { const u = db.prepare("SELECT brand FROM users WHERE id = ?").get(req.user.id); if (row.brand !== u?.brand) return res.status(403).json({ error: "Not your brand" }); }
  db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(Number(stock), id);
  res.json({ id, stock: Number(stock) });
});

// Staff delete product
app.delete("/api/staff/products/:id", staffRequired, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "Product not found" });
  if (req.user.role === "seller" && row.sellerId !== req.user.id) return res.status(403).json({ error: "Not your listing" });
  if (req.user.role === "merchant") { const u = db.prepare("SELECT brand FROM users WHERE id = ?").get(req.user.id); if (row.brand !== u?.brand) return res.status(403).json({ error: "Not your brand" }); }
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  res.json({ ok: true, deleted: id });
});

// Most ordered (scoped for merchant/seller)
app.get("/api/staff/most-ordered", staffRequired, (req, res) => {
  let filter = "";
  const params = {};
  if (req.user.role === "merchant") {
    const u = db.prepare("SELECT brand FROM users WHERE id = ?").get(req.user.id);
    filter = " AND oi.brand = @brand";
    params.brand = u?.brand || "";
  }
  if (req.user.role === "seller") {
    filter = " AND p.sellerId = @sid";
    params.sid = req.user.id;
  }
  const rows = db.prepare("SELECT oi.productId as id, oi.name, oi.brand, oi.image, p.category, p.stock, p.price, SUM(oi.quantity) as orderCount, COUNT(DISTINCT oi.orderId) as timesOrdered FROM order_items oi JOIN products p ON p.id = oi.productId WHERE 1=1" + filter + " GROUP BY oi.productId ORDER BY orderCount DESC LIMIT 30").all(params);
  res.json(rows);
});

// Sub-admin dashboard
app.get("/api/sub-admin/dashboard", subAdminRequired, (_req, res) => {
  const totalProducts = db.prepare("SELECT COUNT(*) as c FROM products").get().c;
  const outOfStock = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock = 0").get().c;
  const lowStock = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock > 0 AND stock <= 3").get().c;
  const totalOrders = db.prepare("SELECT COUNT(*) as c FROM orders").get().c;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(grandTotal),0) as c FROM orders").get().c;
  const catStats = db.prepare("SELECT category, COUNT(*) as total, SUM(CASE WHEN stock=0 THEN 1 ELSE 0 END) as oos FROM products GROUP BY category ORDER BY total DESC").all();
  const recentOrders = db.prepare("SELECT orderId, grandTotal, placedAt, status, fullName FROM orders ORDER BY id DESC LIMIT 10").all();
  const topProducts = db.prepare("SELECT oi.productId as id, oi.name, oi.brand, SUM(oi.quantity) as sold FROM order_items oi GROUP BY oi.productId ORDER BY sold DESC LIMIT 5").all();
  res.json({ totalProducts, outOfStock, lowStock, totalOrders, totalRevenue, catStats, recentOrders, topProducts });
});

// Merchant dashboard
app.get("/api/merchant/dashboard", merchantRequired, (req, res) => {
  const u = db.prepare("SELECT brand FROM users WHERE id = ?").get(req.user.id);
  const brand = u?.brand || "";
  const totalProducts = db.prepare("SELECT COUNT(*) as c FROM products WHERE brand = ?").get(brand).c;
  const outOfStock = db.prepare("SELECT COUNT(*) as c FROM products WHERE brand = ? AND stock = 0").get(brand).c;
  const lowStock = db.prepare("SELECT COUNT(*) as c FROM products WHERE brand = ? AND stock > 0 AND stock <= 3").get(brand).c;
  const catStats = db.prepare("SELECT category, COUNT(*) as total, SUM(CASE WHEN stock=0 THEN 1 ELSE 0 END) as oos FROM products WHERE brand = ? GROUP BY category ORDER BY total DESC").all(brand);
  // Revenue from orders containing their brand
  const brandRevenue = db.prepare("SELECT COALESCE(SUM(o.grandTotal),0) as c FROM orders o JOIN order_items oi ON oi.orderId = o.orderId WHERE oi.brand = ?").get(brand).c;
  // Total units sold
  const unitsSold = db.prepare("SELECT COALESCE(SUM(oi.quantity),0) as c FROM order_items oi WHERE oi.brand = ?").get(brand).c;
  const recentOrders = db.prepare("SELECT DISTINCT o.orderId, o.grandTotal, o.placedAt, o.status, o.fullName FROM orders o JOIN order_items oi ON oi.orderId = o.orderId WHERE oi.brand = ? ORDER BY o.id DESC LIMIT 10").all(brand);
  const topProducts = db.prepare("SELECT oi.productId as id, oi.name, SUM(oi.quantity) as sold FROM order_items oi WHERE oi.brand = ? GROUP BY oi.productId ORDER BY sold DESC LIMIT 5").all(brand);
  try { const allBrands = db.prepare("SELECT DISTINCT brand FROM products ORDER BY brand").all().map(r => r.brand); return res.json({ brand, totalProducts, outOfStock, lowStock, catStats, totalRevenue: brandRevenue, unitsSold, recentOrders, topProducts, allBrands }); } catch { res.json({ brand, totalProducts, outOfStock, lowStock, catStats, totalRevenue: brandRevenue, unitsSold, recentOrders, topProducts }); }
});

// Seller dashboard
app.get("/api/seller/dashboard", sellerRequired, (req, res) => {
  const sid = req.user.id;
  const totalListed = db.prepare("SELECT COUNT(*) as c FROM products WHERE sellerId = ?").get(sid).c;
  const active = db.prepare("SELECT COUNT(*) as c FROM products WHERE sellerId = ? AND stock > 0").get(sid).c;
  const soldUnits = db.prepare("SELECT COALESCE(SUM(oi.quantity),0) as c FROM order_items oi JOIN products p ON p.id = oi.productId WHERE p.sellerId = ?").get(sid).c;
  const earnings = db.prepare("SELECT COALESCE(SUM(oi.price * oi.quantity),0) as c FROM order_items oi JOIN products p ON p.id = oi.productId WHERE p.sellerId = ?").get(sid).c;
  const myProducts = db.prepare("SELECT id, name, brand, category, price, stock FROM products WHERE sellerId = ? ORDER BY stock ASC").all(sid);
  const recentSales = db.prepare("SELECT oi.name, oi.price, oi.quantity, o.orderId, o.placedAt FROM order_items oi JOIN orders o ON o.orderId = oi.orderId JOIN products p ON p.id = oi.productId WHERE p.sellerId = ? ORDER BY o.id DESC LIMIT 10").all(sid);
  res.json({ totalListed, active, soldUnits, earnings, myProducts, recentSales });
});

// Customer profile + change password
app.put("/api/customer/profile", authRequired, (req, res) => {
  const { name, phone } = req.body || {};
  if (name) db.prepare("UPDATE users SET name = ? WHERE id = ?").run(String(name).trim(), req.user.id);
  if (phone !== undefined) db.prepare("UPDATE users SET phone = ? WHERE id = ?").run(String(phone).trim(), req.user.id);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  res.json({ user: publicUser(user) });
});

app.put("/api/customer/change-password", authRequired, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || String(newPassword).length < 6) return res.status(400).json({ error: "Current and new password (min 6 chars) required" });
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!bcrypt.compareSync(String(currentPassword), user.passwordHash)) return res.status(401).json({ error: "Current password is incorrect" });
  db.prepare("UPDATE users SET passwordHash = ? WHERE id = ?").run(bcrypt.hashSync(String(newPassword), 10), req.user.id);
  res.json({ ok: true });
});

// ---------- Reviews ----------
// Customers only (no admins/sub-admins/merchants)
app.get("/api/admin/customers", adminRequired, (_req, res) => {
  const users = db.prepare("SELECT id, name, email, phone, role, createdAt FROM users WHERE role = 'customer' ORDER BY id ASC").all();
  res.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone || "", role: u.role, createdAt: u.createdAt })));
});

// All accounts with role filter
app.get("/api/admin/accounts", adminRequired, (req, res) => {
  const { role } = req.query;
  let sql = "SELECT id, name, email, phone, role, brand, createdAt FROM users WHERE role != 'admin'";
  const params = {};
  if (role && role !== "All") { sql += " AND role = @role"; params.role = String(role); }
  sql += " ORDER BY id ASC";
  res.json(db.prepare(sql).all(params));
});

app.get("/api/admin/reviews", adminRequired, (req, res) => {
  const { status, productId } = req.query;
  let sql = "SELECT r.*, p.name as productName FROM reviews r LEFT JOIN products p ON p.id = r.productId WHERE 1=1";
  const params = {};
  if (status && status !== "All") { sql += " AND r.status = @status"; params.status = String(status); }
  if (productId) { sql += " AND r.productId = @pid"; params.pid = Number(productId); }
  sql += " ORDER BY r.id DESC LIMIT 200";
  res.json(db.prepare(sql).all(params));
});

app.patch("/api/admin/reviews/:id/status", adminRequired, (req, res) => {
  const { status } = req.body || {};
  if (!["approved", "hidden", "deleted"].includes(String(status))) return res.status(400).json({ error: "Invalid status" });
  db.prepare("UPDATE reviews SET status = ? WHERE id = ?").run(String(status), Number(req.params.id));
  logActivity(db, req.user.id, req.user.name, "review_status", `Review #${req.params.id} → ${status}`);
  res.json({ ok: true });
});

app.post("/api/admin/reviews/seed", adminRequired, (_req, res) => {
  const count = db.prepare("SELECT COUNT(*) as c FROM reviews").get().c;
  if (count > 0) return res.json({ ok: true, msg: `${count} reviews already exist` });
  const prods = db.prepare("SELECT id, name FROM products ORDER BY RANDOM() LIMIT 40").all();
  if (prods.length === 0) return res.json({ ok: false, error: "No products found" });
  const users = db.prepare("SELECT id, name FROM users LIMIT 10").all();
  if (users.length === 0) return res.json({ ok: false, error: "No users found" });
  const stmt = db.prepare("INSERT INTO reviews (productId, userId, userName, rating, comment, status, verified, createdAt) VALUES (?,?,?,?,?,?,?,?)");
  const now = new Date();
  let n = 0;
  for (const p of prods) {
    const u = users[Math.floor(Math.random() * users.length)];
    const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
    stmt.run(p.id, u.id, u.name, rating, `Great ${p.name}! Works perfectly for gaming.`, "approved", 1, new Date(now - Math.random() * 30*86400000).toISOString());
    n++;
  }
  logActivity(db, _req.user.id, _req.user.name, "reviews_seeded", `Seeded ${n} demo reviews`);
  res.json({ ok: true, seeded: n });
});

// ---------- Coupons ----------
app.get("/api/admin/coupons", adminRequired, (req, res) => {
  const { status } = req.query;
  let sql = "SELECT * FROM coupons WHERE 1=1";
  const params = {};
  if (status && status !== "All") { sql += " AND status = @s"; params.s = String(status); }
  sql += " ORDER BY id DESC";
  res.json(db.prepare(sql).all(params));
});

app.post("/api/admin/coupons", adminRequired, (req, res) => {
  const b = req.body || {};
  if (!b.code || !b.discountValue) return res.status(400).json({ error: "Code and discountValue required" });
  const exists = db.prepare("SELECT id FROM coupons WHERE code = ?").get(String(b.code).toUpperCase());
  if (exists) return res.status(409).json({ error: "Coupon code already exists" });
  db.prepare("INSERT INTO coupons (code, discountType, discountValue, minCart, maxUses, category, expiresAt, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?)").run(
    String(b.code).toUpperCase(), String(b.discountType || "percentage"), Number(b.discountValue),
    Number(b.minCart || 0), b.maxUses ? Number(b.maxUses) : null, b.category || null,
    b.expiresAt || null, "active", new Date().toISOString()
  );
  logActivity(db, req.user.id, req.user.name, "coupon_created", `Coupon ${String(b.code).toUpperCase()} created`);
  res.status(201).json({ ok: true });
});

app.patch("/api/admin/coupons/:id", adminRequired, (req, res) => {
  const { status } = req.body || {};
  const c = db.prepare("SELECT * FROM coupons WHERE id = ?").get(Number(req.params.id));
  if (!c) return res.status(404).json({ error: "Coupon not found" });
  db.prepare("UPDATE coupons SET status = ? WHERE id = ?").run(String(status || "active"), c.id);
  logActivity(db, req.user.id, req.user.name, "coupon_updated", `Coupon ${c.code} → ${status}`);
  res.json({ ok: true });
});

app.delete("/api/admin/coupons/:id", adminRequired, (req, res) => {
  const c = db.prepare("SELECT * FROM coupons WHERE id = ?").get(Number(req.params.id));
  if (!c) return res.status(404).json({ error: "Not found" });
  db.prepare("DELETE FROM coupons WHERE id = ?").run(c.id);
  res.json({ ok: true });
});

// ---------- Activity Logs ----------
app.get("/api/admin/activity-logs", adminRequired, (req, res) => {
  const { q } = req.query;
  let sql = "SELECT * FROM activity_logs WHERE 1=1";
  const params = {};
  if (q) { sql += " AND (LOWER(action) LIKE @q OR LOWER(details) LIKE @q OR LOWER(userName) LIKE @q)"; params.q = "%" + String(q).toLowerCase() + "%"; }
  sql += " ORDER BY id DESC LIMIT 200";
  res.json(db.prepare(sql).all(params));
});

// ---------- Settings ----------
app.get("/api/admin/settings", adminRequired, (_req, res) => {
  const rows = db.prepare("SELECT * FROM settings").all();
  const obj = {};
  rows.forEach((r) => { obj[r.key] = r.value; });
  res.json(obj);
});

app.put("/api/admin/settings", adminRequired, (req, res) => {
  const data = req.body || {};
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  for (const [k, v] of Object.entries(data)) {
    stmt.run(String(k), String(v));
  }
  logActivity(db, req.user.id, req.user.name, "settings_updated", "Settings updated");
  res.json({ ok: true });
});

// ---------- Reports ----------
// Inventory overview (with reserved/available/incoming)
app.get("/api/admin/inventory-stats", adminRequired, (_req, res) => {
  const totalStock = db.prepare("SELECT COALESCE(SUM(stock),0) as c FROM products").get().c;
  const totalReserved = db.prepare("SELECT COALESCE(SUM(stockReserved),0) as c FROM products").get().c;
  const totalIncoming = db.prepare("SELECT COALESCE(SUM(stockIncoming),0) as c FROM products").get().c;
  const totalSold = db.prepare("SELECT COALESCE(SUM(totalSold),0) as c FROM products").get().c;
  const totalAvailable = totalStock - totalReserved;
  const totalValue = db.prepare("SELECT COALESCE(SUM(price*stock),0) as c FROM products").get().c;
  const lowStock = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock > 0 AND (stock - stockReserved) <= 5").get().c;
  const outOfStock = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock = 0 OR (stock - stockReserved) <= 0").get().c;
  const warehouseBreakdown = db.prepare("SELECT category, COUNT(*) as products, SUM(stock) as totalStock, SUM(stockReserved) as reserved, SUM(stockIncoming) as incoming FROM products GROUP BY category ORDER BY products DESC").all();
  res.json({ totalStock, totalReserved, totalIncoming, totalSold, totalAvailable, totalValue, lowStock, outOfStock, warehouseBreakdown });
});

app.get("/api/admin/reports/sales", adminRequired, (_req, res) => {
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(grandTotal),0) as c FROM orders").get().c;
  const totalOrders = db.prepare("SELECT COUNT(*) as c FROM orders").get().c;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const byCategory = db.prepare("SELECT oi.brand as category, COUNT(DISTINCT oi.orderId) as orders, SUM(oi.quantity) as units, SUM(oi.price * oi.quantity) as revenue FROM order_items oi GROUP BY oi.brand ORDER BY revenue DESC LIMIT 15").all();
  const byDay = db.prepare("SELECT DATE(placedAt) as day, COUNT(*) as orders, COALESCE(SUM(grandTotal),0) as revenue FROM orders WHERE placedAt > date('now','-30 days') GROUP BY DATE(placedAt) ORDER BY day").all();
  res.json({ totalRevenue, totalOrders, avgOrder, byCategory, byDay });
});

// =========== Categories Management ===========
app.get("/api/admin/categories", adminRequired, (_req, res) => {
  const rows = db.prepare("SELECT category as name, COUNT(*) as productCount, SUM(CASE WHEN stock=0 THEN 1 ELSE 0 END) as oos, SUM(price*stock) as inventoryValue, MAX(rating) as topRating FROM products GROUP BY category ORDER BY productCount DESC").all();
  res.json(rows);
});


app.get("/api/admin/brand-stats", adminRequired, (_req, res) => {
  const rows = db.prepare(`
    SELECT p.brand,
      COUNT(DISTINCT p.id) as products,
      SUM(CASE WHEN p.stock > 0 THEN 1 ELSE 0 END) as stock,
      SUM(CASE WHEN p.stock = 0 THEN 1 ELSE 0 END) as oos,
      COALESCE(SUM(oi.quantity), 0) as sold,
      COALESCE(SUM(oi.price * oi.quantity), 0) as revenue,
      ROUND(AVG(p.rating), 1) as rating
    FROM products p
    LEFT JOIN order_items oi ON oi.productId = p.id
    GROUP BY p.brand
    ORDER BY products DESC
  `).all();
  res.json(rows);
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
