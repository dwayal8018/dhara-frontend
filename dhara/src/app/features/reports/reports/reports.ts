import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DAILY_SALES, CATEGORY_SALES, PAYMENT_SPLIT,
  TOP_PRODUCTS, TOP_CUSTOMERS, TopProduct, TopCustomer
} from './reports.data';
import { ProductService } from '../../../core/services/product.service';
import { SalesService } from '../../../core/services/sales.service';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Reports {

  private readonly productService  = inject(ProductService);
  private readonly salesService    = inject(SalesService);
  private readonly customerService = inject(CustomerService);

  // ── Dynamic KPI stats ─────────────────────────────────────────────────────
  readonly stats = computed(() => {
    const revenue = this.salesService.monthlyRevenue();
    const invoices = this.salesService.invoices();
    const avgBill = invoices.length > 0 ? Math.round(revenue / invoices.length) : 0;
    return [
      { label: 'Monthly Revenue', value: '₹' + revenue.toLocaleString('en-IN'), change: 0, trend: 'up' as const, icon: 'trending_up', color: '#2563eb' },
      { label: 'Total Orders', value: String(invoices.length), change: 0, trend: 'up' as const, icon: 'receipt_long', color: '#7c3aed' },
      { label: 'Avg Bill Value', value: '₹' + avgBill.toLocaleString('en-IN'), change: 0, trend: 'up' as const, icon: 'payments', color: '#16a34a' },
      { label: 'Total Products', value: String(this.productService.totalCount()), change: 0, trend: 'up' as const, icon: 'inventory_2', color: '#0f766e' },
      { label: 'Low Stock Items', value: String(this.productService.lowStockProducts().length), change: 0, trend: 'down' as const, icon: 'warning', color: '#dc2626' },
      { label: 'Customers', value: String(this.customerService.customers().length), change: 0, trend: 'up' as const, icon: 'people', color: '#ea580c' },
    ];
  });

  readonly dailySales    = DAILY_SALES;
  readonly categorySales = CATEGORY_SALES;
  readonly paymentSplit  = PAYMENT_SPLIT;
  readonly topProducts   = TOP_PRODUCTS;
  readonly topCustomers  = TOP_CUSTOMERS;

  // ── Stock alerts from real product data ────────────────────────────────────
  readonly stockAlerts = computed(() =>
    this.productService.products()
      .filter(p => p.stock <= p.minStock)
      .sort((a, b) => (a.stock / a.minStock) - (b.stock / b.minStock))
      .map(p => ({
        sku: p.sku,
        name: p.name,
        category: p.category,
        stock: p.stock,
        minStock: p.minStock,
        maxStock: p.maxStock,
        status: (p.stock <= p.minStock * 0.3 ? 'Critical' : 'Low') as 'Critical' | 'Low',
        daysLeft: Math.max(1, Math.round((p.stock / Math.max(1, p.minStock)) * 14)),
        reorderQty: p.maxStock - p.stock,
        lastPurchaseRate: p.purchasePrice,
        reorderValue: (p.maxStock - p.stock) * p.purchasePrice,
      }))
  );

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
    const alerts = this.stockAlerts();
    if (f === 'all') return alerts;
    return alerts.filter(a => a.status === f);
  });

  readonly criticalCount = computed(() => this.stockAlerts().filter(a => a.status === 'Critical').length);
  readonly lowCount      = computed(() => this.stockAlerts().filter(a => a.status === 'Low').length);
  readonly totalReorderValue = computed(() => this.stockAlerts().reduce((s, a) => s + a.reorderValue, 0));

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
