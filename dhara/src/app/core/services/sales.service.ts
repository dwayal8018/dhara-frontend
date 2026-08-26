import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { SavedInvoice, PaymentMode, InvoiceStatus } from '../../features/sales/sales/sales.data';
import { ProductService } from './product.service';

const SK_INVOICES = 'dh_invoices';
const SK_INV_COUNTER = 'dh_invoice_counter';

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

export interface SaleLineItem {
  productId: number;
  sku: string;
  name: string;
  unit: string;
  qty: number;
  price: number;
  discount: number;  // line discount %
  gst: number;       // GST %
}

export interface InvoiceRecord extends SavedInvoice {
  lineItems: SaleLineItem[];
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class SalesService {

  private readonly productService = inject(ProductService);

  // ── Persisted state ───────────────────────────────────────────────────────
  readonly invoices = signal<InvoiceRecord[]>(load(SK_INVOICES, []));
  private _counter = signal<number>(load(SK_INV_COUNTER, 241));

  constructor() {
    effect(() => save(SK_INVOICES, this.invoices()));
    effect(() => save(SK_INV_COUNTER, this._counter()));
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  readonly nextInvoiceNumber = computed(() => `INV-${String(this._counter() + 1).padStart(4, '0')}`);

  readonly todaySales = computed(() => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return this.invoices().filter(i => i.date === today);
  });

  readonly todaysRevenue = computed(() =>
    this.todaySales().reduce((s, i) => s + i.total, 0)
  );

  readonly todaysCollected = computed(() =>
    this.todaySales().reduce((s, i) => s + i.paid, 0)
  );

  readonly monthlyRevenue = computed(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return this.invoices()
      .filter(i => {
        const d = this._parseDate(i.date);
        return d && d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((s, i) => s + i.total, 0);
  });

  readonly monthlyProfit = computed(() => {
    // Approximate profit: total - cost (we use 70% of total as rough cost estimate)
    // In a real app, we'd track cost per line item
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthInvoices = this.invoices().filter(i => {
      const d = this._parseDate(i.date);
      return d && d.getMonth() === month && d.getFullYear() === year;
    });
    // Calculate profit from line items where we can look up purchase price
    let profit = 0;
    for (const inv of monthInvoices) {
      for (const line of inv.lineItems) {
        const product = this.productService.getById(line.productId);
        const costPrice = product ? product.purchasePrice : line.price * 0.7;
        const lineRevenue = line.qty * line.price * (1 - line.discount / 100);
        const lineCost = line.qty * costPrice;
        profit += lineRevenue - lineCost;
      }
    }
    return profit;
  });

  readonly pendingInvoices = computed(() =>
    this.invoices().filter(i => i.status === 'Pending' || i.status === 'Partial')
  );

  readonly totalOutstanding = computed(() =>
    this.invoices().reduce((s, i) => s + Math.max(0, i.total - i.paid), 0)
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  saveSale(data: {
    customer: string;
    phone: string;
    lineItems: SaleLineItem[];
    subtotal: number;
    gstAmt: number;
    discount: number;
    total: number;
    paid: number;
    paymentMode: PaymentMode;
    notes: string;
  }): InvoiceRecord {
    this._counter.update(c => c + 1);
    const invoiceNum = `INV-${String(this._counter()).padStart(4, '0')}`;

    const now = new Date();
    const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let status: InvoiceStatus = 'Paid';
    if (data.paid === 0) status = 'Pending';
    else if (data.paid < data.total) status = 'Partial';

    const record: InvoiceRecord = {
      id: this._counter(),
      invoice: invoiceNum,
      customer: data.customer,
      phone: data.phone,
      items: data.lineItems.length,
      subtotal: data.subtotal,
      gstAmt: data.gstAmt,
      discount: data.discount,
      total: Math.round(data.total),
      paid: Math.round(data.paid),
      paymentMode: data.paymentMode,
      status,
      date,
      time,
      lineItems: data.lineItems,
      notes: data.notes,
    };

    // Deduct stock for each line item
    for (const line of data.lineItems) {
      this.productService.deductStock(line.productId, line.qty);
    }

    this.invoices.update(list => [record, ...list]);
    return record;
  }

  recordPartialPayment(invoiceId: number, amount: number, mode: PaymentMode): void {
    this.invoices.update(list =>
      list.map(inv => {
        if (inv.id !== invoiceId) return inv;
        const newPaid = inv.paid + amount;
        const newStatus: InvoiceStatus = newPaid >= inv.total ? 'Paid' : 'Partial';
        return { ...inv, paid: newPaid, status: newStatus };
      })
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _parseDate(dateStr: string): Date | null {
    // Parses "DD Mon YYYY" format (e.g., "05 Jul 2026")
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }
}
