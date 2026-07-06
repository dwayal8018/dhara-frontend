import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  REPORT_STATS, DAILY_SALES, CATEGORY_SALES, PAYMENT_SPLIT,
  TOP_PRODUCTS, TOP_CUSTOMERS, STOCK_ALERTS, TopProduct, TopCustomer
} from './reports.data';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Reports {

  // ── Static data ──────────────────────────────────────────────────────────
  readonly stats         = REPORT_STATS;
  readonly dailySales    = DAILY_SALES;
  readonly categorySales = CATEGORY_SALES;
  readonly paymentSplit  = PAYMENT_SPLIT;
  readonly topProducts   = TOP_PRODUCTS;
  readonly topCustomers  = TOP_CUSTOMERS;
  readonly stockAlerts   = STOCK_ALERTS;

  // ── Tab ───────────────────────────────────────────────────────────────────
  activeTab = signal<'sales' | 'products' | 'customers' | 'stock'>('sales');

  // ── Sales tab ─────────────────────────────────────────────────────────────
  readonly maxDailyRevenue = Math.max(...this.dailySales.map(d => d.revenue));
  readonly totalDailyRev   = this.dailySales.reduce((s, d) => s + d.revenue, 0);
  readonly totalDailyOrds  = this.dailySales.reduce((s, d) => s + d.orders, 0);
  readonly maxCatRevenue   = Math.max(...this.categorySales.map(c => c.revenue));
  readonly catTotalRevenue = this.categorySales.reduce((s, c) => s + c.revenue, 0);

  dayBarPct(val: number): number {
    return Math.round((val / this.maxDailyRevenue) * 100);
  }

  catBarPct(val: number): number {
    return Math.round((val / this.maxCatRevenue) * 100);
  }

  // ── Products tab ──────────────────────────────────────────────────────────
  productSearch  = signal('');
  productSortBy  = signal<'revenue' | 'units' | 'profit' | 'margin'>('revenue');

  readonly filteredProducts = computed(() => {
    const q  = this.productSearch().toLowerCase();
    const by = this.productSortBy();
    let list = this.topProducts;
    if (q) list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => {
      if (by === 'units')  return b.unitsSold - a.unitsSold;
      if (by === 'profit') return b.profit - a.profit;
      if (by === 'margin') return b.margin - a.margin;
      return b.revenue - a.revenue;
    });
  });

  // ── Customers tab ─────────────────────────────────────────────────────────
  customerSearch = signal('');
  customerSortBy = signal<'purchases' | 'invoices' | 'outstanding' | 'avgBill'>('purchases');

  readonly filteredCustomers = computed(() => {
    const q  = this.customerSearch().toLowerCase();
    const by = this.customerSortBy();
    let list = this.topCustomers;
    if (q) list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.area.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
    return [...list].sort((a, b) => {
      if (by === 'invoices')    return b.invoices - a.invoices;
      if (by === 'outstanding') return b.outstanding - a.outstanding;
      if (by === 'avgBill')     return b.avgBill - a.avgBill;
      return b.totalPurchases - a.totalPurchases;
    });
  });

  // ── Stock tab ─────────────────────────────────────────────────────────────
  stockFilter = signal<'all' | 'Critical' | 'Low'>('all');

  readonly filteredAlerts = computed(() => {
    const f = this.stockFilter();
    if (f === 'all') return this.stockAlerts;
    return this.stockAlerts.filter(a => a.status === f);
  });

  readonly criticalCount = this.stockAlerts.filter(a => a.status === 'Critical').length;
  readonly lowCount      = this.stockAlerts.filter(a => a.status === 'Low').length;
  readonly totalReorderValue = this.stockAlerts.reduce((s, a) => s + a.reorderValue, 0);

  // ── Helpers ───────────────────────────────────────────────────────────────
  toast = signal('');

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3500);
  }

  trendIcon(t: string): string {
    if (t === 'up')     return 'trending_up';
    if (t === 'down')   return 'trending_down';
    return 'trending_flat';
  }

  trendClass(t: string): string {
    if (t === 'up')   return 'up';
    if (t === 'down') return 'down';
    return 'flat';
  }

  alertClass(s: string): string {
    return s === 'Critical' ? 'danger' : 'warning';
  }

  stockPct(stock: number, min: number): number {
    return Math.min(100, Math.round((stock / min) * 100));
  }

  avatarColor(key: string): string {
    const map: Record<string, string> = {
      blue: '#2563eb', purple: '#7c3aed', teal: '#0f766e',
      orange: '#ea580c', red: '#dc2626', green: '#16a34a', pink: '#db2777'
    };
    return map[key] ?? '#64748b';
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  trackById(_: number, item: { rank: number }) { return item.rank; }
}
