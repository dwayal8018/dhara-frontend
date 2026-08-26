import { computed, effect, Injectable, signal } from '@angular/core';
import { Product, PRODUCTS, Category, StockStatus } from '../../features/inventory/inventory/inventory.data';

const SK_PRODUCTS = 'dh_products';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

@Injectable({ providedIn: 'root' })
export class ProductService {

  // ── Products signal — seeded from mock data on first run ──────────────────
  readonly products = signal<Product[]>(load(SK_PRODUCTS, [...PRODUCTS]));

  // ── Persist on every change ───────────────────────────────────────────────
  constructor() {
    effect(() => save(SK_PRODUCTS, this.products()));
  }

  // ── Derived computeds ─────────────────────────────────────────────────────
  readonly totalCount = computed(() => this.products().length);

  readonly lowStockProducts = computed(() =>
    this.products().filter(p => p.stock > 0 && p.stock <= p.minStock)
  );

  readonly outOfStockProducts = computed(() =>
    this.products().filter(p => p.stock === 0)
  );

  readonly totalInventoryValue = computed(() =>
    this.products().reduce((sum, p) => sum + p.stock * p.purchasePrice, 0)
  );

  readonly categories = computed(() => {
    const cats = new Map<string, number>();
    for (const p of this.products()) {
      cats.set(p.category, (cats.get(p.category) ?? 0) + 1);
    }
    return cats;
  });

  // ── CRUD ──────────────────────────────────────────────────────────────────

  private nextId(): number {
    const max = this.products().reduce((m, p) => Math.max(m, p.id), 0);
    return max + 1;
  }

  private computeStatus(stock: number, minStock: number): StockStatus {
    if (stock === 0) return 'Out of Stock';
    if (stock <= minStock) return 'Low Stock';
    return 'In Stock';
  }

  addProduct(data: Omit<Product, 'id' | 'status'>): Product {
    const newProduct: Product = {
      ...data,
      id: this.nextId(),
      status: this.computeStatus(data.stock, data.minStock),
    };
    this.products.update(list => [...list, newProduct]);
    return newProduct;
  }

  updateProduct(id: number, data: Partial<Omit<Product, 'id'>>): void {
    this.products.update(list =>
      list.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, ...data };
        updated.status = this.computeStatus(updated.stock, updated.minStock);
        return updated;
      })
    );
  }

  deleteProduct(id: number): void {
    this.products.update(list => list.filter(p => p.id !== id));
  }

  getById(id: number): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  // ── Stock operations (used by Sales and Purchases) ────────────────────────

  deductStock(productId: number, qty: number): void {
    this.products.update(list =>
      list.map(p => {
        if (p.id !== productId) return p;
        const newStock = Math.max(0, p.stock - qty);
        return { ...p, stock: newStock, status: this.computeStatus(newStock, p.minStock) };
      })
    );
  }

  addStock(productId: number, qty: number): void {
    this.products.update(list =>
      list.map(p => {
        if (p.id !== productId) return p;
        const newStock = p.stock + qty;
        return { ...p, stock: newStock, status: this.computeStatus(newStock, p.minStock) };
      })
    );
  }

  // ── Helpers for Sales component (converts Product → SaleProduct format) ───

  readonly saleProducts = computed(() =>
    this.products().map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      unit: p.unit,
      sellingPrice: p.sellingPrice,
      wholesalePrice: p.wholesalePrice,
      gst: p.gst,
      stock: p.stock,
    }))
  );
}
