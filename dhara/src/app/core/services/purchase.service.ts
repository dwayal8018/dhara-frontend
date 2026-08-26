import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  PurchaseOrder, PurchaseItem, PURCHASE_ORDERS,
  PaymentMode, PurchaseStatus, PaymentStatus
} from '../../features/purchases/purchases/purchases.data';
import { ProductService } from './product.service';
import { SupplierService } from './supplier.service';

const SK_PURCHASES = 'dh_purchases';
const SK_PO_COUNTER = 'dh_po_counter';

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
export class PurchaseService {

  private readonly productService = inject(ProductService);
  private readonly supplierService = inject(SupplierService);

  readonly orders = signal<PurchaseOrder[]>(load(SK_PURCHASES, [...PURCHASE_ORDERS]));
  private _counter = signal<number>(load(SK_PO_COUNTER, 241));

  constructor() {
    effect(() => save(SK_PURCHASES, this.orders()));
    effect(() => save(SK_PO_COUNTER, this._counter()));
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  readonly nextPoNumber = computed(() => `PUR-${String(this._counter() + 1).padStart(4, '0')}`);

  readonly totalDue = computed(() =>
    this.orders().reduce((s, o) => s + Math.max(0, o.grandTotal - o.paid), 0)
  );

  readonly pendingDeliveries = computed(() =>
    this.orders().filter(o => o.status === 'Pending').length
  );

  readonly thisMonthValue = computed(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return this.orders()
      .filter(o => {
        try {
          const d = new Date(o.date);
          return d.getMonth() === month && d.getFullYear() === year;
        } catch { return false; }
      })
      .reduce((s, o) => s + o.grandTotal, 0);
  });

  readonly stats = computed(() => [
    { label: 'Total Orders', value: String(this.orders().length), icon: 'shopping_bag', color: '#2563eb' },
    { label: 'This Month Value', value: '₹' + this.thisMonthValue().toLocaleString('en-IN'), icon: 'currency_rupee', color: '#7c3aed' },
    { label: 'Supplier Dues', value: '₹' + this.totalDue().toLocaleString('en-IN'), icon: 'account_balance_wallet', color: '#dc2626' },
    { label: 'Pending Deliveries', value: this.pendingDeliveries() + ' Order' + (this.pendingDeliveries() !== 1 ? 's' : ''), icon: 'local_shipping', color: '#ea580c' },
  ]);

  // ── Actions ───────────────────────────────────────────────────────────────

  createPurchaseOrder(data: {
    supplier: string;
    supplierId: number;
    supplierPhone: string;
    dueDate: string;
    items: { productId: number; sku: string; name: string; unit: string; qty: number; rate: number; gst: number }[];
    paymentMode: PaymentMode;
    notes: string;
    invoiceRef: string;
  }): PurchaseOrder {
    this._counter.update(c => c + 1);
    const poNumber = `PUR-${String(this._counter()).padStart(4, '0')}`;

    const purchaseItems: PurchaseItem[] = data.items.map(item => ({
      productId: item.productId,
      sku: item.sku,
      name: item.name,
      unit: item.unit,
      qty: item.qty,
      rate: item.rate,
      gst: item.gst,
      total: item.qty * item.rate,
    }));

    const subtotal = purchaseItems.reduce((s, i) => s + i.total, 0);
    const gstAmount = purchaseItems.reduce((s, i) => s + i.total * (i.gst / 100), 0);
    const grandTotal = subtotal + gstAmount;

    const now = new Date();
    const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const order: PurchaseOrder = {
      id: this._counter(),
      poNumber,
      supplier: data.supplier,
      supplierId: data.supplierId,
      supplierPhone: data.supplierPhone,
      date,
      dueDate: data.dueDate || date,
      items: purchaseItems,
      subtotal,
      gstAmount: Math.round(gstAmount),
      grandTotal: Math.round(grandTotal),
      paid: 0,
      paymentMode: data.paymentMode,
      status: 'Received',
      paymentStatus: 'Unpaid',
      notes: data.notes,
      invoiceRef: data.invoiceRef,
    };

    // Add stock for each item
    for (const item of purchaseItems) {
      this.productService.addStock(item.productId, item.qty);
    }

    // Record purchase against supplier
    this.supplierService.recordPurchase(data.supplierId, Math.round(grandTotal), poNumber, data.invoiceRef);

    this.orders.update(list => [order, ...list]);
    return order;
  }

  recordPayment(orderId: number, amount: number, mode: PaymentMode): void {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return;

    const newPaid = order.paid + amount;
    const newPayStatus: PaymentStatus = newPaid >= order.grandTotal ? 'Paid' : 'Partial';

    this.orders.update(list =>
      list.map(o => o.id !== orderId ? o : {
        ...o,
        paid: newPaid,
        paymentStatus: newPayStatus,
        paymentMode: mode,
      })
    );

    // Also record payment at supplier level
    this.supplierService.recordPayment(order.supplierId, amount, mode);
  }
}
