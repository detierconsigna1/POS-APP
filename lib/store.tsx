import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import * as DB from '../src/services/db';
import type { Product, Sale, Settings, Method, Group, ProductInput } from '../src/services/db';

export type { Product, Sale, Settings, Method, Group, ProductInput };
export const LOW_STOCK = 8;
export const GROUPS: Group[] = ['Essentials', 'Apparel', 'Snacks'];
type Sheet = null | 'menu' | 'scan' | 'notif';

export const ago = (t: number) => {
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} minute${m > 1 ? 's' : ''} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  return `${Math.floor(h / 24)} day(s) ago`;
};

const money = (n: number) => '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export const receiptText = (s: Sale, st: Settings) =>
  [
    st.storeName + ' — ' + st.storeLocation,
    `Receipt #${s.id}  ${new Date(s.date).toLocaleString()}`,
    '------------------------------',
    ...s.lines.map((l) => `${l.name} x${l.qty}  ${money(l.price * l.qty)}`),
    '------------------------------',
    `Subtotal  ${money(s.subtotal)}`,
    `Tax       ${money(s.tax)}`,
    `Discount  -${money(s.discount)}`,
    `TOTAL     ${money(s.total)}  (${s.method})`,
    '',
    st.footer,
  ].join('\n');

type Ctx = {
  ready: boolean; version: number;
  products: Product[]; sales: Sale[]; settings: Settings;
  cart: Record<number, number>; search: string; sheet: Sheet; locked: boolean;
  setSearch: (s: string) => void; open: (s: Sheet) => void; unlock: () => void;
  saveProduct: (p: ProductInput) => string | null;
  deleteProduct: (id: number) => void;
  adjustStock: (id: number, d: number) => void;
  addToCart: (id: number, d: number) => boolean;
  clearCart: () => void;
  cartLines: (Product & { qty: number })[];
  totals: { subtotal: number; tax: number; discount: number; total: number; count: number };
  checkout: (m: Method) => Sale;
  voidSale: (id: number) => void;
  update: (patch: Partial<Omit<Settings, 'members'>>) => void;
  addMember: (name: string, role: string) => void;
  removeMember: (id: number) => void;
  resetAll: () => void;
  exportJson: () => string;
};

const C = createContext<Ctx>(null as any);
export const useApp = () => useContext(C);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<Settings>(null as any);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [search, setSearch] = useState('');
  const [sheet, open] = useState<Sheet>(null);
  const [locked, setLocked] = useState(false);

  /** Re-read everything from SQLite and tell screens to refresh. */
  const reload = () => {
    setProducts(DB.getProducts());
    setSales(DB.getSales());
    setSettings(DB.getSettings());
    setVersion((v) => v + 1);
  };

  useEffect(() => {
    DB.initDatabase();
    const st = DB.getSettings();
    setProducts(DB.getProducts());
    setSales(DB.getSales());
    setSettings(st);
    if (st.pin) setLocked(true);
    if (st.quickScan) open('scan');
    setReady(true);
  }, []);

  const cartLines = useMemo(
    () => products.filter((p) => cart[p.id]).map((p) => ({ ...p, qty: cart[p.id] })),
    [products, cart]
  );
  const totals = useMemo(() => {
    const subtotal = cartLines.reduce((s, l) => s + l.price * l.qty, 0);
    const rate = settings?.taxRate ?? 0, disc = settings?.discountRate ?? 0;
    const tax = (subtotal * rate) / 100;
    const discount = (subtotal * disc) / 100;
    return { subtotal, tax, discount, total: subtotal + tax - discount, count: cartLines.reduce((s, l) => s + l.qty, 0) };
  }, [cartLines, settings]);

  if (!ready) return null;

  const saveProduct: Ctx['saveProduct'] = (p) => {
    try {
      if (p.id) DB.updateProduct(p as any); else DB.insertProduct(p);
      reload();
      return null;
    } catch (e: any) {
      return String(e?.message).includes('UNIQUE') ? 'That SKU already exists.' : 'Could not save product.';
    }
  };
  const deleteProduct = (id: number) => {
    DB.deleteProduct(id);
    setCart((c) => { const n = { ...c }; delete n[id]; return n; });
    reload();
  };
  const addToCart = (id: number, d: number) => {
    const p = products.find((x) => x.id === id);
    if (!p) return false;
    const q = (cart[id] ?? 0) + d;
    if (d > 0 && q > p.stock) {
      Alert.alert('Not enough stock', `Only ${p.stock} ${p.unit} of ${p.name} left.`);
      return false;
    }
    setCart((c) => { const n = { ...c }; if (q <= 0) delete n[id]; else n[id] = q; return n; });
    return true;
  };
  const checkout = (method: Method) => {
    const sale = DB.insertSale({
      date: Date.now(), method, subtotal: totals.subtotal, tax: totals.tax, discount: totals.discount, total: totals.total,
      lines: cartLines.map((l) => ({ id: l.id, name: l.name, qty: l.qty, price: l.price })),
    });
    setCart({});
    reload();
    return sale;
  };

  return (
    <C.Provider
      value={{
        ready, version, products, sales, settings, cart, search, sheet, locked,
        setSearch, open, unlock: () => setLocked(false),
        saveProduct, deleteProduct,
        adjustStock: (id, d) => { DB.adjustStock(id, d); reload(); },
        addToCart, clearCart: () => setCart({}), cartLines, totals, checkout,
        voidSale: (id) => { DB.voidSale(id); reload(); },
        update: (patch) => { Object.entries(patch).forEach(([k, v]) => DB.setSetting(k, v)); reload(); },
        addMember: (n, r) => { DB.addMember(n, r); reload(); },
        removeMember: (id) => { DB.removeMember(id); reload(); },
        resetAll: () => { DB.resetAll(); setCart({}); setLocked(false); reload(); },
        exportJson: () => JSON.stringify({ products, sales, settings: { ...settings, pin: '' } }, null, 2),
      }}
    >
      {children}
    </C.Provider>
  );
}
