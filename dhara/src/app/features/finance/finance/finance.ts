import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FINANCE_STATS, MONTHLY_FLOW, EXPENSE_LINES, FINANCE_TRANSACTIONS,
  MonthlyFlow, FinanceTx
} from './finance.data';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrl: './finance.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Finance {

  // ── Static data ──────────────────────────────────────────────────────────
  readonly stats        = FINANCE_STATS;
  readonly monthlyFlow  = MONTHLY_FLOW;
  readonly expenseLines = EXPENSE_LINES;
  readonly allTx        = FINANCE_TRANSACTIONS;

  // ── Tab state ─────────────────────────────────────────────────────────────
  activeTab = signal<'overview' | 'cashflow' | 'expenses'>('overview');

  // ── Cash flow filter ─────────────────────────────────────────────────────
  readonly currentMonth = this.monthlyFlow[this.monthlyFlow.length - 1];
  readonly maxRevenue   = Math.max(...this.monthlyFlow.map(m => m.revenue));

  barPct(val: number): number {
    return Math.round((val / this.maxRevenue) * 100);
  }

  // ── Expense tab filter ───────────────────────────────────────────────────
  expenseSearch = signal('');
  txTypeFilter  = signal<'all' | 'Income' | 'Expense'>('all');

  readonly filteredTx = computed(() => {
    const q  = this.expenseSearch().toLowerCase();
    const tf = this.txTypeFilter();
    return this.allTx.filter(t => {
      const matchQ  = !q || t.description.toLowerCase().includes(q)
                         || t.category.toLowerCase().includes(q)
                         || (t.ref ?? '').toLowerCase().includes(q);
      const matchT  = tf === 'all' || t.type === tf;
      return matchQ && matchT;
    });
  });

  readonly filteredIncome  = computed(() => this.filteredTx().filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0));
  readonly filteredExpense = computed(() => this.filteredTx().filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0));

  // ── Expense category totals (only non-purchase) ───────────────────────────
  readonly overheadLines = this.expenseLines.filter(e => e.category !== 'Purchases');
  readonly totalOverheads = this.overheadLines.reduce((s, e) => s + e.amount, 0);
  readonly maxExpense     = Math.max(...this.expenseLines.map(e => e.amount));

  expBarPct(val: number): number {
    return Math.round((val / this.maxExpense) * 100);
  }

  // ── Cash flow 12-month totals ─────────────────────────────────────────────
  readonly ytdRevenue  = this.monthlyFlow.reduce((s, m) => s + m.revenue, 0);
  readonly ytdProfit   = this.monthlyFlow.reduce((s, m) => s + m.netProfit, 0);
  readonly ytdPurchase = this.monthlyFlow.reduce((s, m) => s + m.purchases, 0);

  // ── Helpers ───────────────────────────────────────────────────────────────
  toast = signal('');

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3500);
  }

  txTypeClass(type: string): string {
    if (type === 'Income')   return 'success';
    if (type === 'Expense')  return 'danger';
    if (type === 'Transfer') return 'info';
    return '';
  }

  trendClass(row: MonthlyFlow, prev?: MonthlyFlow): string {
    if (!prev) return '';
    return row.netProfit >= prev.netProfit ? 'up' : 'down';
  }

  marginPct(m: MonthlyFlow): number {
    return Math.round((m.netProfit / m.revenue) * 100);
  }

  trackById(_: number, item: { id: number }) { return item.id; }
}
