import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Supplier, SupplierTransaction, PaymentMode } from './suppliers.data';
import { SupplierService } from '../../../core/services/supplier.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Suppliers {

  private readonly supplierService = inject(SupplierService);
  readonly router = inject(Router);

  // ── Data from service ─────────────────────────────────────────────────────
  readonly stats        = computed(() => this.supplierService.stats());
  readonly allSuppliers = computed(() => this.supplierService.suppliers());
  readonly paymentModes: PaymentMode[] = ['Cash', 'UPI', 'Cheque', 'Bank Transfer', 'Credit'];

  // ── List state ────────────────────────────────────────────────────────────
  search       = signal('');
  statusFilter = signal<'all' | 'Active' | 'Inactive'>('all');
  sortBy       = signal<'name' | 'outstanding' | 'orders'>('outstanding');
  selectedId   = signal<number>(1);

  readonly filteredSuppliers = computed(() => {
    const q      = this.search().toLowerCase();
    const status = this.statusFilter();
    let list     = this.allSuppliers();
    if (q) list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q) ||
      s.gst.toLowerCase().includes(q)
    );
    if (status !== 'all') list = list.filter(s => s.status === status);
    const by = this.sortBy();
    return [...list].sort((a, b) => {
      if (by === 'name')        return a.name.localeCompare(b.name);
      if (by === 'orders')      return b.totalOrders - a.totalOrders;
      return b.outstanding - a.outstanding;
    });
  });

  readonly selected = computed(() =>
    this.allSuppliers().find(s => s.id === this.selectedId()) ?? this.allSuppliers()[0]
  );

  // ── Transaction ledger for selected supplier ──────────────────────────────
  readonly ledger = computed(() =>
    this.supplierService.getLedger(this.selectedId())
  );

  selectSupplier(id: number) { this.selectedId.set(id); }

  // ── Record payment modal ──────────────────────────────────────────────────
  showPayModal  = signal(false);
  payAmount     = signal(0);
  payMode       = signal<PaymentMode>('Cash');
  payRef        = signal('');

  readonly Math = Math;

  openPayModal() {
    const s = this.selected();
    this.payAmount.set(s ? Math.round(s.outstanding) : 0);
    this.payMode.set('Cash');
    this.payRef.set('');
    this.showPayModal.set(true);
  }

  recordPayment() {
    const s = this.selected();
    if (!s) return;
    if (this.payAmount() <= 0)              { this.showToast('Enter a valid amount.'); return; }
    if (this.payAmount() > s.outstanding)   { this.showToast('Amount exceeds outstanding dues.'); return; }
    this.supplierService.recordPayment(s.id, this.payAmount(), this.payMode(), this.payRef());
    this.showToast(`₹${this.payAmount().toLocaleString('en-IN')} paid to ${s.name} via ${this.payMode()}.`);
    this.showPayModal.set(false);
  }

  // ── Add supplier modal ────────────────────────────────────────────────────
  showAddModal    = signal(false);
  addName         = signal('');
  addContact      = signal('');
  addPhone        = signal('');
  addEmail        = signal('');
  addAddress      = signal('');
  addArea         = signal('');
  addGst          = signal('');
  addCreditDays   = signal(30);
  addCreditLimit  = signal(500000);

  saveSupplier() {
    if (!this.addName() || !this.addPhone()) {
      this.showToast('Supplier name and phone are required.');
      return;
    }
    this.supplierService.addSupplier({
      name: this.addName(),
      contactPerson: this.addContact(),
      phone: this.addPhone(),
      email: this.addEmail() || undefined,
      address: this.addAddress(),
      area: this.addArea(),
      gst: this.addGst(),
      creditDays: this.addCreditDays(),
      creditLimit: this.addCreditLimit(),
    });
    this.showToast(`Supplier "${this.addName()}" added successfully.`);
    this.showAddModal.set(false);
    this.addName.set(''); this.addContact.set(''); this.addPhone.set('');
    this.addEmail.set(''); this.addAddress.set(''); this.addArea.set('');
    this.addGst.set(''); this.addCreditDays.set(30); this.addCreditLimit.set(500000);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  toast = signal('');

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3500);
  }

  avatarColor(key: string): string {
    const map: Record<string, string> = {
      blue: '#2563eb', purple: '#7c3aed', teal: '#0f766e',
      orange: '#ea580c', red: '#dc2626', green: '#16a34a'
    };
    return map[key] ?? '#64748b';
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  stars(n: number): number[] { return Array.from({ length: n }); }

  txTypeClass(type: string): string {
    if (type === 'Purchase')    return 'info';
    if (type === 'Payment')     return 'success';
    if (type === 'Return')      return 'warning';
    if (type === 'Debit Note')  return 'danger';
    return '';
  }

  creditUsedPercent(s: Supplier): number {
    return Math.min(100, Math.round((s.outstanding / s.creditLimit) * 100));
  }

  daysClass(days: number): string {
    const pct = (days / 45) * 100;
    if (pct > 80) return 'danger';
    if (pct > 50) return 'warning';
    return 'ok';
  }

  trackById(_: number, item: { id: number }) { return item.id; }
}
