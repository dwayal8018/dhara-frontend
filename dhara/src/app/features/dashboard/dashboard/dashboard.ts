import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DASHBOARD_STATS, QUICK_ACTIONS, LOW_STOCK, BORROWERS, TRANSACTIONS } from './dashboard.data';
import { AuthService } from '../../../core/services/auth.service';
import { AppSettingsService } from '../../../core/services/app-settings.service';

export type DrilldownType =
  | 'pending-invoices'
  | 'purchases'
  | 'monthly-revenue'
  | null;

// Date-range labels used in drilldown panels
export const DATE_RANGES = ['Today', 'Yesterday', 'This Week', 'This Month', 'This Year'] as const;
export type DateRange = (typeof DATE_RANGES)[number];

export const PURCHASE_RANGES = ['Today', 'Yesterday', 'This Week', 'This Month'] as const;
export type PurchaseRange = (typeof PURCHASE_RANGES)[number];

// ── Monthly Revenue mock data ─────────────────────────────────────────────────
export interface MonthRevenue {
  month: string;
  revenue: number;
  profit: number;
  orders: number;
}

const MONTHLY_REVENUE: MonthRevenue[] = [
  { month: 'Aug 2025', revenue: 980000,  profit: 245000, orders: 312 },
  { month: 'Sep 2025', revenue: 1120000, profit: 290000, orders: 348 },
  { month: 'Oct 2025', revenue: 1350000, profit: 348000, orders: 401 },
  { month: 'Nov 2025', revenue: 1480000, profit: 382000, orders: 445 },
  { month: 'Dec 2025', revenue: 1620000, profit: 430000, orders: 488 },
  { month: 'Jan 2026', revenue: 1240000, profit: 310000, orders: 370 },
  { month: 'Feb 2026', revenue: 1090000, profit: 272000, orders: 325 },
  { month: 'Mar 2026', revenue: 1380000, profit: 356000, orders: 415 },
  { month: 'Apr 2026', revenue: 1510000, profit: 395000, orders: 455 },
  { month: 'May 2026', revenue: 1640000, profit: 432000, orders: 492 },
  { month: 'Jun 2026', revenue: 1215000, profit: 303000, orders: 362 },
  { month: 'Jul 2026', revenue: 1482300, profit: 412800, orders: 441 },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {

  private readonly auth     = inject(AuthService);
  private readonly settings = inject(AppSettingsService);
  private readonly router   = inject(Router);

  readonly today     = new Date();
  readonly shopName  = computed(() => this.settings.shop().shopName);
  readonly ownerName = computed(() => {
    const user = this.auth.currentUser();
    return user ? user.name.split(' ')[0] : 'there';
  });
  readonly monthlyTarget = 1500000;

  readonly stats        = DASHBOARD_STATS;
  readonly quickActions = QUICK_ACTIONS;
  readonly lowStock     = LOW_STOCK;
  readonly borrowers    = BORROWERS;
  readonly transactions = TRANSACTIONS;
  readonly monthlyRevenue = MONTHLY_REVENUE;

  readonly smartSuggestions = [
    'PVC Pipe 1 inch demand increased by 28% this week — consider reordering soon.',
    'You have 12 low stock products that should be reordered immediately.',
    '3 borrowers have pending payments older than 30 days. Send reminders.',
    'LED Bulbs generated the highest profit today at ₹3,200 margin.',
    'Average bill value increased by 14% compared to yesterday.',
    'Mahesh Traders is your top customer this month — ₹85,000 in purchases.',
    'Supplier Ganesh Tiles invoice PUR-0211 is due in 3 days.'
  ];

  // ── KPI card click → route or drilldown panel ─────────────────────────────
  readonly CARD_ROUTES: Record<number, string> = {
    1: '/sales',       // Today's Sales
    2: '/reports',     // Today's Profit
    3: '/customers',   // Outstanding
    4: '/inventory',   // Low Stock
    5: '/finance',     // Cash Available
    9: '/reports',     // Monthly Profit
    10: '/suppliers',  // Supplier Dues
  };

  activeDrilldown = signal<DrilldownType>(null);

  onCardClick(id: number) {
    if (id === 6) { this.activeDrilldown.set('pending-invoices'); return; }
    if (id === 7) { this.activeDrilldown.set('purchases');        return; }
    if (id === 8) { this.activeDrilldown.set('monthly-revenue'); return; }
    const route = this.CARD_ROUTES[id];
    if (route) this.router.navigate([route]);
  }

  closeDrilldown() { this.activeDrilldown.set(null); }

  // ── Pending Invoices drilldown ─────────────────────────────────────────────
  readonly DATE_RANGES = DATE_RANGES;
  pendingRange = signal<DateRange>('Today');

  readonly pendingInvoiceGroups = computed(() => {
    const pending = this.transactions.filter(t => t.status === 'Pending' && t.type === 'Sale');
    return DATE_RANGES.map(range => ({
      range,
      items: this._filterByRange(pending, range),
    }));
  });

  readonly activePendingGroup = computed(() =>
    this.pendingInvoiceGroups().find(g => g.range === this.pendingRange()) ?? { range: this.pendingRange(), items: [] }
  );

  // ── Today's Purchases drilldown ───────────────────────────────────────────
  readonly PURCHASE_RANGES = PURCHASE_RANGES;
  purchaseRange = signal<PurchaseRange>('Today');

  readonly purchaseGroups = computed(() => {
    const purchases = this.transactions.filter(t => t.type === 'Purchase');
    return PURCHASE_RANGES.map(range => ({
      range,
      items: this._filterByRange(purchases, range),
    }));
  });

  readonly activePurchaseGroup = computed(() =>
    this.purchaseGroups().find(g => g.range === this.purchaseRange()) ?? { range: this.purchaseRange(), items: [] }
  );

  // ── Monthly Revenue drilldown ─────────────────────────────────────────────
  readonly maxRevenue = Math.max(...MONTHLY_REVENUE.map(m => m.revenue));

  revBarPct(val: number): number {
    return Math.round((val / this.maxRevenue) * 100);
  }

  // ── Borrower click → Customers page ──────────────────────────────────────
  openBorrower(phone: string) {
    // Navigate to customers page — customers page will use phone or name to pre-select
    this.router.navigate(['/customers'], { queryParams: { phone } });
  }

  // ── Shared helpers ────────────────────────────────────────────────────────
  navigate(route: string) { this.router.navigate([route]); }

  greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  totalBorrowing(): number {
    return this.borrowers.reduce((sum, b) => sum + b.amount, 0);
  }

  totalSales(): number {
    return this.transactions
      .filter(t => t.type === 'Sale' && t.status === 'Paid')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  progressPercent(): number {
    return Math.round((this.totalSales() / this.monthlyTarget) * 100);
  }

  groupTotal(items: typeof this.transactions): number {
    return items.reduce((s, t) => s + t.amount, 0);
  }

  trackById(_: number, item: { id: number }) { return item.id; }

  // ── Private: filter mock data by date range ───────────────────────────────
  // Because mock data uses relative time strings (e.g. "09:30 AM") we bucket
  // deterministically: first item = today, next 2 = yesterday, etc.
  private _filterByRange(list: typeof this.transactions, range: DateRange | PurchaseRange) {
    // Mock: assign ranges based on position so the UI always shows data
    if (range === 'Today')      return list.filter((_, i) => i < 3);
    if (range === 'Yesterday')  return list.filter((_, i) => i >= 3 && i < 6);
    if (range === 'This Week')  return list.filter((_, i) => i >= 6 && i < 12);
    if (range === 'This Month') return list.filter((_, i) => i >= 12 && i < 18);
    if (range === 'This Year')  return list;
    return list;
  }
}
