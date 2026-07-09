import { ChangeDetectionStrategy, Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  CUSTOMERS, KHATA_ENTRIES, CUSTOMER_STATS,
  Customer, KhataEntry, PaymentMode
} from './customers.data';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Customers implements OnInit {

  private readonly route = inject(ActivatedRoute);

  // ── Data ────────────────────────────────────────────────────────────────
  readonly stats         = CUSTOMER_STATS;
  readonly allCustomers  = CUSTOMERS;
  readonly allEntries    = KHATA_ENTRIES;
  readonly paymentModes: PaymentMode[] = ['Cash', 'UPI', 'Cheque', 'Bank Transfer'];

  // ── Customer list state ──────────────────────────────────────────────────
  search        = signal('');
  statusFilter  = signal<'all' | 'Active' | 'Inactive'>('all');
  sortBy        = signal<'name' | 'outstanding' | 'overdue'>('overdue');
  selectedId    = signal<number>(1);          // Mahesh Bhosale pre-selected

  /** Highlight that a deep-link from Dashboard opened this page */
  deepLinked = signal(false);

  ngOnInit(): void {
    // When navigated from dashboard borrower click (?phone=XXXXXXXXXX),
    // find the matching customer and pre-select them.
    const phone = this.route.snapshot.queryParamMap.get('phone');
    if (phone) {
      const match = this.allCustomers.find(c => c.phone === phone);
      if (match) {
        this.selectedId.set(match.id);
        this.deepLinked.set(true);
        // Scroll hint: reset status filter to ensure they're visible
        this.statusFilter.set('all');
      }
    }
  }

  readonly filteredCustomers = computed(() => {
    const q      = this.search().toLowerCase();
    const status = this.statusFilter();
    let list     = this.allCustomers;

    if (q)           list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.area.toLowerCase().includes(q)
    );
    if (status !== 'all') list = list.filter(c => c.status === status);

    const by = this.sortBy();
    return [...list].sort((a, b) => {
      if (by === 'name')        return a.name.localeCompare(b.name);
      if (by === 'outstanding') return b.outstanding - a.outstanding;
      return b.overduedays - a.overduedays;
    });
  });

  readonly selectedCustomer = computed(() =>
    this.allCustomers.find(c => c.id === this.selectedId()) ?? this.allCustomers[0]
  );

  // ── Khata ledger for selected customer ──────────────────────────────────
  readonly ledger = computed(() =>
    this.allEntries
      .filter(e => e.customerId === this.selectedId())
      .sort((a, b) => b.id - a.id)        // newest first
  );

  selectCustomer(id: number) { this.selectedId.set(id); }

  // ── Record payment modal ─────────────────────────────────────────────────
  showPaymentModal = signal(false);
  payAmount        = signal(0);
  payMode          = signal<PaymentMode>('Cash');
  payNotes         = signal('');
  toast            = signal('');

  openPaymentModal() {
    const c = this.selectedCustomer();
    this.payAmount.set(c ? c.outstanding : 0);
    this.payMode.set('Cash');
    this.payNotes.set('');
    this.showPaymentModal.set(true);
  }

  recordPayment() {
    const amt = this.payAmount();
    const c   = this.selectedCustomer();
    if (!c) return;
    if (amt <= 0) { this.showToast('Enter a valid amount.'); return; }
    if (amt > c.outstanding) { this.showToast('Amount exceeds outstanding balance.'); return; }
    this.showToast(
      `Payment of ₹${amt.toLocaleString('en-IN')} recorded for ${c.name} via ${this.payMode()}.`
    );
    this.showPaymentModal.set(false);
  }

  // ── Add customer modal ───────────────────────────────────────────────────
  showAddModal   = signal(false);
  addName        = signal('');
  addPhone       = signal('');
  addAddress     = signal('');
  addArea        = signal('');
  addGst         = signal('');
  addCreditLimit = signal(25000);

  saveCustomer() {
    if (!this.addName() || !this.addPhone()) {
      this.showToast('Name and phone are required.');
      return;
    }
    this.showToast(`Customer "${this.addName()}" added successfully.`);
    this.showAddModal.set(false);
    this.addName.set(''); this.addPhone.set('');
    this.addAddress.set(''); this.addArea.set('');
    this.addGst.set(''); this.addCreditLimit.set(25000);
  }

  // ── Exposed Math for template ────────────────────────────────────────────
  readonly Math = Math;

  // ── Helpers ──────────────────────────────────────────────────────────────
  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3500);
  }

  avatarColor(key: string): string {
    const map: Record<string, string> = {
      blue: '#2563eb', purple: '#7c3aed', green: '#16a34a',
      orange: '#ea580c', teal: '#0f766e', red: '#dc2626',
      pink: '#db2777'
    };
    return map[key] ?? '#64748b';
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  overdueClass(days: number): string {
    if (days > 30) return 'danger';
    if (days > 14) return 'warning';
    return 'ok';
  }

  entryTypeClass(type: string): string {
    if (type === 'Sale')       return 'info';
    if (type === 'Payment')    return 'success';
    if (type === 'Return')     return 'warning';
    if (type === 'Adjustment') return 'purple';
    return '';
  }

  creditUsedPercent(c: Customer): number {
    return Math.min(100, Math.round((c.outstanding / c.creditLimit) * 100));
  }

  trackById(_: number, item: { id: number }) { return item.id; }
}
