import { computed, effect, Injectable, signal } from '@angular/core';
import {
  Supplier, SupplierTransaction, SUPPLIERS, SUPPLIER_TRANSACTIONS,
  PaymentMode, TransactionType
} from '../../features/suppliers/suppliers/suppliers.data';

const SK_SUPPLIERS = 'dh_suppliers';
const SK_SUPPLIER_TXN = 'dh_supplier_transactions';

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
export class SupplierService {

  readonly suppliers = signal<Supplier[]>(load(SK_SUPPLIERS, [...SUPPLIERS]));
  readonly transactions = signal<SupplierTransaction[]>(load(SK_SUPPLIER_TXN, [...SUPPLIER_TRANSACTIONS]));

  constructor() {
    effect(() => save(SK_SUPPLIERS, this.suppliers()));
    effect(() => save(SK_SUPPLIER_TXN, this.transactions()));
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  readonly totalDuesPayable = computed(() =>
    this.suppliers().reduce((s, sup) => s + sup.outstanding, 0)
  );

  readonly activeCount = computed(() =>
    this.suppliers().filter(s => s.status === 'Active').length
  );

  readonly stats = computed(() => [
    { label: 'Total Suppliers', value: String(this.suppliers().length), icon: 'local_shipping', color: '#2563eb' },
    { label: 'Total Dues Payable', value: '₹' + this.totalDuesPayable().toLocaleString('en-IN'), icon: 'account_balance_wallet', color: '#dc2626' },
    { label: 'Active Suppliers', value: this.activeCount() + ' Active', icon: 'verified', color: '#16a34a' },
    { label: 'Total Suppliers', value: String(this.suppliers().length), icon: 'people', color: '#7c3aed' },
  ]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  addSupplier(data: Partial<Supplier> & { name: string; phone: string; area: string; gst: string }): Supplier {
    const newSupplier: Supplier = {
      id: Date.now(),
      name: data.name,
      contactPerson: data.contactPerson || data.name,
      phone: data.phone,
      altPhone: data.altPhone,
      email: data.email,
      address: data.address || '',
      area: data.area,
      state: data.state || 'Maharashtra',
      gst: data.gst,
      pan: data.pan,
      creditDays: data.creditDays || 30,
      creditLimit: data.creditLimit || 500000,
      outstanding: 0,
      totalPurchases: 0,
      totalPaid: 0,
      totalOrders: 0,
      joinDate: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      lastOrder: 'Never',
      status: 'Active',
      avatar: ['blue', 'purple', 'teal', 'orange', 'red', 'green'][Math.floor(Math.random() * 6)],
      categories: data.categories || [],
      rating: data.rating || 3,
    };
    this.suppliers.update(list => [...list, newSupplier]);
    return newSupplier;
  }

  // ── Record purchase against supplier (increases outstanding) ───────────────
  recordPurchase(supplierId: number, amount: number, poNumber: string, invoiceRef: string): void {
    const supplier = this.suppliers().find(s => s.id === supplierId);
    if (!supplier) return;

    this.suppliers.update(list =>
      list.map(s => s.id !== supplierId ? s : {
        ...s,
        outstanding: s.outstanding + amount,
        totalPurchases: s.totalPurchases + amount,
        totalOrders: s.totalOrders + 1,
        lastOrder: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      })
    );

    const now = new Date();
    const entry: SupplierTransaction = {
      id: Date.now(),
      supplierId,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      type: 'Purchase',
      poNumber,
      invoiceRef,
      description: `Purchase: ${poNumber}`,
      debit: amount,
      credit: 0,
      balance: supplier.outstanding + amount,
    };
    this.transactions.update(list => [entry, ...list]);
  }

  // ── Record payment to supplier (decreases outstanding) ────────────────────
  recordPayment(supplierId: number, amount: number, mode: PaymentMode, notes?: string): void {
    const supplier = this.suppliers().find(s => s.id === supplierId);
    if (!supplier) return;

    const newOutstanding = Math.max(0, supplier.outstanding - amount);

    this.suppliers.update(list =>
      list.map(s => s.id !== supplierId ? s : {
        ...s,
        outstanding: newOutstanding,
        totalPaid: s.totalPaid + amount,
      })
    );

    const now = new Date();
    const entry: SupplierTransaction = {
      id: Date.now(),
      supplierId,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      type: 'Payment',
      description: `Payment via ${mode}`,
      debit: 0,
      credit: amount,
      balance: newOutstanding,
      paymentMode: mode,
      notes: notes || '',
    };
    this.transactions.update(list => [entry, ...list]);
  }

  getById(id: number): Supplier | undefined {
    return this.suppliers().find(s => s.id === id);
  }

  getLedger(supplierId: number): SupplierTransaction[] {
    return this.transactions().filter(t => t.supplierId === supplierId).sort((a, b) => b.id - a.id);
  }
}
