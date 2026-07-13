// Client-side frequently-bought-together / compatibility helpers
import type { Product } from "../context/ProductDetailContext";

/** Maps a cart category → complementary categories (different category, fewer bottlenecks) */
export const COMPAT_MAP: Record<string, string[]> = {
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
  "Gaming Mouse": ["Gaming Keyboard", "Gaming Headset", "PC Cabinet"],
  "Gaming Keyboard": ["Gaming Mouse", "Gaming Headset", "PC Cabinet"],
  "Gaming Headset": ["Gaming Mouse", "Gaming Keyboard", "Console", "Monitor"],
  "Gaming Chair": ["Gaming Desk", "Monitor", "PC Cabinet"],
  "Gaming Desk": ["Gaming Chair", "Monitor", "PC Cabinet"],
  Tablet: ["Gaming Headset", "SSD"],
};

export function getFrequentlyBoughtTogether(
  cartItems: { id: number; category?: string }[],
  catalog: Product[],
  limit = 4
): Product[] {
  if (!cartItems.length || !catalog.length) return [];

  const cartIds = new Set(cartItems.map((i) => i.id));
  const cartCategories = cartItems
    .map((i) => i.category || catalog.find((p) => p.id === i.id)?.category)
    .filter(Boolean) as string[];

  const targetCats: string[] = [];
  for (const cat of cartCategories) {
    for (const t of COMPAT_MAP[cat] || []) {
      if (!cartCategories.includes(t) && !targetCats.includes(t)) targetCats.push(t);
    }
  }

  const componentCats = ["CPU", "GPU", "RAM", "SSD"];
  if (
    cartCategories.some((c) => componentCats.includes(c)) &&
    !cartCategories.includes("PC Cabinet") &&
    !targetCats.includes("PC Cabinet")
  ) {
    targetCats.unshift("PC Cabinet");
  }

  if (!targetCats.length) {
    targetCats.push("PC Cabinet", "SSD", "RAM", "Gaming Headset");
  }

  const recs: Product[] = [];
  const seen = new Set(cartIds);

  for (const cat of targetCats) {
    const pool = catalog
      .filter((p) => p.category === cat && p.stock > 0 && !seen.has(p.id))
      .sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
    for (const p of pool) {
      seen.add(p.id);
      recs.push(p);
      if (recs.length >= limit) return recs;
    }
  }

  if (recs.length < limit) {
    const pool = [...catalog]
      .filter((p) => p.stock > 0 && !seen.has(p.id) && !cartCategories.includes(p.category))
      .sort((a, b) => b.rating - a.rating);
    for (const p of pool) {
      seen.add(p.id);
      recs.push(p);
      if (recs.length >= limit) break;
    }
  }

  return recs;
}
