// Lab 05 — Offline-first SQLite service (expo-sqlite, synchronous API)
import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('pos_inventory.db');

export type Group = 'Essentials' | 'Apparel' | 'Snacks';
export type Method = 'Cash' | 'Card' | 'E-wallet';
export type Product = {
  id: number; name: string; sku: string; category: string; group: Group;
  unit: string; stock: number; price: number; buy: number; updatedAt: number;
};
export type SaleLine = { id: number; name: string; qty: number; price: number };
export type Sale = {
  id: number; date: number; lines: SaleLine[]; subtotal: number; tax: number;
  discount: number; total: number; method: Method;
};
export type Member = { id: number; name: string; role: string };
export type Settings = {
  name: string; email: string; storeName: string; storeLocation: string;
  taxRate: number; discountRate: number; footer: string;
  push: boolean; dark: boolean; quickScan: boolean; pin: string; lastSync: number;
  members: Member[];
};

type Row = {
  id: number; name: string; category: string; price: number; stock: number;
  sku: string; grp: Group; unit: string; buy: number; updated_at: number;
};
const toProduct = (r: Row): Product => ({
  id: r.id, name: r.name, category: r.category, price: r.price, stock: r.stock,
  sku: r.sku, group: r.grp, unit: r.unit, buy: r.buy, updatedAt: r.updated_at,
});

/** DDL + indexes + auto-seed. Safe to call on every launch. */
export function initDatabase() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      sku TEXT NOT NULL,
      grp TEXT NOT NULL DEFAULT 'Essentials',
      unit TEXT NOT NULL DEFAULT 'pcs',
      buy REAL NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date INTEGER NOT NULL,
      subtotal REAL NOT NULL, tax REAL NOT NULL, discount REAL NOT NULL, total REAL NOT NULL,
      method TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      name TEXT NOT NULL, qty INTEGER NOT NULL, price REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL
    );
  `);
  seedIfEmpty();
}

function seedIfEmpty() {
  const t = Date.now();
  const pc = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM products;');
  if (pc && pc.count === 0) {
    db.runSync(
      `INSERT INTO products (name, category, price, stock, sku, grp, unit, buy, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?), (?,?,?,?,?,?,?,?,?), (?,?,?,?,?,?,?,?,?), (?,?,?,?,?,?,?,?,?);`,
      [
        'AA Battery 4 Pack', 'Electronics', 281.21, 22, 'BAT-AA4-24', 'Essentials', 'pack', 109.36, t - 1000,
        'Antibacterial Soap', 'Personal Care', 203.1, 8, 'SOAP-ANT-12', 'Essentials', 'bottles', 109.36, t - 2000,
        'Basic Crew Tee', 'Apparel', 1124.84, 16, 'TEE-CRW-BLK', 'Apparel', 'pcs', 574.92, t - 3000,
        'Butter Biscuits', 'Snacks', 174.97, 5, 'BISC-BTR-08', 'Snacks', 'packs', 87.49, t - 4000,
      ]
    );
  }
  const mc = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM members;');
  if (mc && mc.count === 0) {
    db.runSync('INSERT INTO members (name, role) VALUES (?,?),(?,?),(?,?),(?,?);', [
      'Dethier Consigna', 'Owner', 'Maria Santos', 'Manager', 'Juan Dela Cruz', 'Cashier', 'Ana Reyes', 'Cashier',
    ]);
  }
  db.runSync("INSERT OR IGNORE INTO settings (key, value) VALUES ('lastSync', ?);", [JSON.stringify(t)]);
}

// ---------- Products (CRUD) ----------
// ORDER BY can't be parameterized, so it's chosen from a fixed whitelist (no user text reaches SQL).
const ORDER: Record<string, string> = {
  Name: 'name COLLATE NOCASE ASC',
  Stock: 'stock ASC',
  Price: 'price DESC',
  'Recently updated': 'updated_at DESC',
  Category: 'category COLLATE NOCASE ASC, name ASC',
};

export function getProducts(): Product[] {
  return db.getAllSync<Row>('SELECT * FROM products ORDER BY id DESC;').map(toProduct);
}

/** SQL-level search: parameterized LIKE ? */
export function searchProducts(q = '', sort = 'Recently updated'): Product[] {
  const order = ORDER[sort] ?? ORDER['Recently updated'];
  const s = q.trim();
  if (!s) return db.getAllSync<Row>(`SELECT * FROM products ORDER BY ${order};`).map(toProduct);
  const like = `%${s}%`;
  return db
    .getAllSync<Row>(
      `SELECT * FROM products WHERE name LIKE ? OR sku LIKE ? OR category LIKE ? ORDER BY ${order};`,
      [like, like, like]
    )
    .map(toProduct);
}

export type ProductInput = Omit<Product, 'id' | 'updatedAt'> & { id?: number };

export function insertProduct(p: ProductInput) {
  db.runSync(
    'INSERT INTO products (name, category, price, stock, sku, grp, unit, buy, updated_at) VALUES (?,?,?,?,?,?,?,?,?);',
    [p.name, p.category, p.price, p.stock, p.sku, p.group, p.unit, p.buy, Date.now()]
  );
}
export function updateProduct(p: ProductInput & { id: number }) {
  db.runSync(
    'UPDATE products SET name=?, category=?, price=?, stock=?, sku=?, grp=?, unit=?, buy=?, updated_at=? WHERE id=?;',
    [p.name, p.category, p.price, p.stock, p.sku, p.group, p.unit, p.buy, Date.now(), p.id]
  );
}
export function deleteProduct(id: number) {
  db.runSync('DELETE FROM products WHERE id = ?;', [id]);
}
export function adjustStock(id: number, delta: number) {
  db.runSync('UPDATE products SET stock = MAX(stock + ?, 0), updated_at = ? WHERE id = ?;', [delta, Date.now(), id]);
}

// ---------- Sales ----------
export function insertSale(s: Omit<Sale, 'id'>): Sale {
  let id = 0;
  db.withTransactionSync(() => {
    const r = db.runSync(
      'INSERT INTO sales (date, subtotal, tax, discount, total, method) VALUES (?,?,?,?,?,?);',
      [s.date, s.subtotal, s.tax, s.discount, s.total, s.method]
    );
    id = r.lastInsertRowId;
    for (const l of s.lines) {
      db.runSync('INSERT INTO sale_items (sale_id, product_id, name, qty, price) VALUES (?,?,?,?,?);', [id, l.id, l.name, l.qty, l.price]);
      db.runSync('UPDATE products SET stock = MAX(stock - ?, 0), updated_at = ? WHERE id = ?;', [l.qty, Date.now(), l.id]);
    }
  });
  return { ...s, id };
}
export function getSales(): Sale[] {
  const rows = db.getAllSync<any>('SELECT * FROM sales ORDER BY date DESC;');
  return rows.map((r) => ({
    id: r.id, date: r.date, subtotal: r.subtotal, tax: r.tax, discount: r.discount, total: r.total, method: r.method,
    lines: db
      .getAllSync<any>('SELECT product_id, name, qty, price FROM sale_items WHERE sale_id = ?;', [r.id])
      .map((i) => ({ id: i.product_id, name: i.name, qty: i.qty, price: i.price })),
  }));
}
export function voidSale(id: number) {
  db.withTransactionSync(() => {
    const items = db.getAllSync<any>('SELECT product_id, qty FROM sale_items WHERE sale_id = ?;', [id]);
    for (const i of items) db.runSync('UPDATE products SET stock = stock + ?, updated_at = ? WHERE id = ?;', [i.qty, Date.now(), i.product_id]);
    db.runSync('DELETE FROM sale_items WHERE sale_id = ?;', [id]);
    db.runSync('DELETE FROM sales WHERE id = ?;', [id]);
  });
}

// ---------- Settings & team ----------
const DEFAULTS = {
  name: 'Dethier Consigna', email: 'dethierconsigna.store.com', storeName: 'Northstar Market',
  storeLocation: 'Downtown', taxRate: 8, discountRate: 5, footer: 'Thank you for shopping with us!',
  push: true, dark: true, quickScan: false, pin: '', lastSync: Date.now(),
};
export function getSettings(): Settings {
  const out: any = { ...DEFAULTS };
  for (const r of db.getAllSync<{ key: string; value: string }>('SELECT key, value FROM settings;')) {
    try { out[r.key] = JSON.parse(r.value); } catch {}
  }
  out.members = db.getAllSync<Member>('SELECT id, name, role FROM members ORDER BY id ASC;');
  return out;
}
export function setSetting(key: string, value: unknown) {
  db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);', [key, JSON.stringify(value)]);
}
export function addMember(name: string, role: string) {
  db.runSync('INSERT INTO members (name, role) VALUES (?, ?);', [name, role]);
}
export function removeMember(id: number) {
  db.runSync('DELETE FROM members WHERE id = ?;', [id]);
}

export function resetAll() {
  db.withTransactionSync(() => {
    for (const t of ['sale_items', 'sales', 'products', 'settings', 'members']) db.runSync(`DELETE FROM ${t};`);
  });
  seedIfEmpty();
}
