import { computed, effect, Injectable, signal } from '@angular/core';
import {
  Customer, KhataEntry, CUSTOMERS, KHATA_ENTRIES,
  PaymentMode, EntryType
} from '../../features/customers/customers/customers.data';

const SK_CUSTOMERS = 'dh_customers';
const SK_KHATA = 'dh_khata_entries';

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
export class CustomerService {

  readonly customers = signal<Customer[]>(load(SK_CUSTOMERS, [...CUSTOMERS]));
  readonly khataEntries = signal<KhataEntry[]>(load(SK_KHATA, [...KHATA_ENTRIES]));

  constructor() {
    effect(() => save(SK_CUSTOMERS, this.customers()));
    effect(() => save(SK_KHATA, this.khataEntries()));
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  readonly totalOutstanding = computed(() =>
    this.customers().reduce((s, c) => s + c.outstanding, 0)
  );

  readonly activeCount = computed(() =>
    this.customers().filter(c => c.status === 'Active').length
  );

  readonly overdueCount = computed(() =>
    this.customers().filter(c => c.overduedays > 30).length
  );

  readonly stats = computed(() => [
    { label: 'Total Customers', value: String(this.customers().length), icon: 'people', color: '#2563eb' },
    { label: 'Total Outstanding', value: '₹' + this.totalOutstanding().toLocaleString('en-IN'), icon: 'account_balance_wallet', color: '#dc2626' },
    { label: 'Active Customers', value: String(this.activeCount()), icon: 'verified', color: '#16a34a' },
    { label: 'Overdue (>30 days)', value: this.overdueCount() + ' Accounts', icon: 'warning', color: '#ea580c' },
  ]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  addCustomer(data: { name: string; phone: string; address: string; area: string; gst?: string; creditLimit: number }): Customer {
    const newCustomer: Customer = {
      id: Date.now(),
      name: data.name,
      phone: data.phone,
      address: data.address,
      area: data.area,
      gst: data.gst,
      creditLimit: data.creditLimit,
      outstanding: 0,
      totalPurchases: 0,
      totalPaid: 0,
      lastActivity: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      joinDate: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      status: 'Active',
      avatar: ['blue', 'purple', 'green', 'orange', 'teal', 'red', 'pink'][Math.floor(Math.random() * 7)],
      overduedays: 0,
    };
    this.customers.update(list => [...list, newCustomer]);
    return newCustomer;
  }

  // ── Record a sale against a customer (increases outstanding) ───────────────
  recordSale(customerPhone: string, amount: number, invoiceNumber: string): void {
    const customer = this.customers().find(c => c.phone === customerPhone);
    if (!customer) return;

    this.customers.update(list =>
      list.map(c => c.id !== customer.id ? c : {
        ...c,
        outstanding: c.outstanding + amount,
        totalPurchases: c.totalPurchases + amount,
        lastActivity: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      })
    );

    const now = new Date();
    const entry: KhataEntry = {
      id: Date.now(),
      customerId: customer.id,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      type: 'Sale',
      invoice: invoiceNumber,
      description: `Sale: ${invoiceNumber}`,
      debit: amount,
      credit: 0,
      balance: customer.outstanding + amount,
    };
    this.khataEntries.update(list => [entry, ...list]);
  }

  // ── Record payment from a customer (decreases outstanding) ────────────────
  recordPayment(customerId: number, amount: number, mode: PaymentMode, notes?: string): void {
    const customer = this.customers().find(c => c.id === customerId);
    if (!customer) return;

    const newOutstanding = Math.max(0, customer.outstanding - amount);

    this.customers.update(list =>
      list.map(c => c.id !== customerId ? c : {
        ...c,
        outstanding: newOutstanding,
        totalPaid: c.totalPaid + amount,
        lastActivity: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        overduedays: newOutstanding === 0 ? 0 : c.overduedays,
      })
    );

    const now = new Date();
    const entry: KhataEntry = {
      id: Date.now(),
      customerId,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      type: 'Payment',
      description: `Payment received via ${mode}`,
      debit: 0,
      credit: amount,
      balance: newOutstanding,
      paymentMode: mode,
      notes: notes || '',
    };
    this.khataEntries.update(list => [entry, ...list]);
  }

  getById(id: number): Customer | undefined {
    return this.customers().find(c => c.id === id);
  }

  getByPhone(phone: string): Customer | undefined {
    return this.customers().find(c => c.phone === phone);
  }

  getLedger(customerId: number): KhataEntry[] {
    return this.khataEntries().filter(e => e.customerId === customerId).sort((a, b) => b.id - a.id);
  }
}
