import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DASHBOARD_STATS, QUICK_ACTIONS, LOW_STOCK, BORROWERS, TRANSACTIONS } from './dashboard.data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {

  readonly today = new Date();
  readonly ownerName = 'Dnyaneshwari';
  readonly shopName = 'DHARA Business';
  readonly monthlyTarget = 1500000;

  readonly stats = DASHBOARD_STATS;
  readonly quickActions = QUICK_ACTIONS;
  readonly lowStock = LOW_STOCK;
  readonly borrowers = BORROWERS;
  readonly transactions = TRANSACTIONS;

  readonly smartSuggestions = [
    'PVC Pipe 1 inch demand increased by 28% this week — consider reordering soon.',
    'You have 12 low stock products that should be reordered immediately.',
    '3 borrowers have pending payments older than 30 days. Send reminders.',
    'LED Bulbs generated the highest profit today at ₹3,200 margin.',
    'Average bill value increased by 14% compared to yesterday.',
    'Mahesh Traders is your top customer this month — ₹85,000 in purchases.',
    'Supplier Ganesh Tiles invoice PUR-0211 is due in 3 days.'
  ];

  constructor(private router: Router) {}

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

  pendingInvoices(): number {
    return this.transactions.filter(t => t.status === 'Pending').length;
  }

  totalSales(): number {
    return this.transactions
      .filter(t => t.type === 'Sale' && t.status === 'Paid')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  progressPercent(): number {
    return Math.round((this.totalSales() / this.monthlyTarget) * 100);
  }

  trackById(_: number, item: { id: number }) { return item.id; }
}
