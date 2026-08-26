import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PurchaseOrder, PurchaseItem, CatProduct, PaymentMode, PaymentStatus } from './purchases.data';
import { PurchaseService } from '../../../core/services/purchase.service';
import { ProductService } from '../../../core/services/product.service';
import { SupplierService } from '../../../core/services/supplier.service';

export interface CartLine {
  product: CatProduct;
  qty: number;
  rate: number;
}

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchases.html',
  styleUrl: './purchases.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Purchases implements OnInit {

  private readonly purchaseService = inject(PurchaseService);
  private readonly productService = inject(ProductService);
  private readonly supplierService = inject(SupplierService);
  private readonly route = inject(ActivatedRoute);

  readonly Math  = Math;
  readonly today = new Date();

  // ── Data from services ────────────────────────────────────────────────────
  readonly stats     = computed(() => this.purchaseService.stats());
  readonly orders    = computed(() => this.purchaseService.orders());
  readonly suppliers = computed(() => this.supplierService.suppliers());
  readonly catalogue = computed<CatProduct[]>(() =>
    this.productService.products().map(p => ({
      id: p.id, sku: p.sku, name: p.name, unit: p.unit, lastRate: p.purchasePrice, gst: p.gst
    }))
  );
  readonly paymentModes: PaymentMode[] = ['Cash', 'UPI', 'Cheque', 'Bank Transfer', 'Credit'];

  // ── Tab state ─────────────────────────────────────────────────────────────
  activeTab = signal<'orders' | 'new'>('orders');

  ngOnInit(): void {
    const supplierName = this.route.snapshot.queryParamMap.get('supplier');
    if (supplierName) {
      // Switch to "new" tab first so the form renders
      this.activeTab.set('new');
      // Then pre-fill supplier after DOM update
      setTimeout(() => {
        this.newSupplier.set(supplierName);
      }, 50);
    }
  }

  // ── Orders list filters ───────────────────────────────────────────────────
  search          = signal('');
  statusFilter    = signal<string>('all');
  paymentFilter   = signal<string>('all');

  readonly filteredOrders = computed(() => {
    const q   = this.search().toLowerCase();
    const st  = this.statusFilter();
    const pay = this.paymentFilter();
    return this.orders().filter(o => {
      const matchQ   = !q || o.poNumber.toLowerCase().includes(q)
                          || o.supplier.toLowerCase().includes(q)
                          || o.invoiceRef.toLowerCase().includes(q);
      const matchSt  = st  === 'all' || o.status === st;
      const matchPay = pay === 'all' || o.paymentStatus === pay;
      return matchQ && matchSt && matchPay;
    });
  });

  readonly totalDue = computed(() =>
    this.filteredOrders().reduce((s, o) => s + (o.grandTotal - o.paid), 0)
  );

  // ── Order detail modal ────────────────────────────────────────────────────
  selectedOrder  = signal<PurchaseOrder | null>(null);
  showDetail     = signal(false);

  openDetail(o: PurchaseOrder) { this.selectedOrder.set(o); this.showDetail.set(true); }

  // ── Record supplier payment modal ─────────────────────────────────────────
  showPayModal  = signal(false);
  payAmount     = signal(0);
  payMode       = signal<PaymentMode>('Cash');
  payRef        = signal('');

  openPayModal(o: PurchaseOrder) {
    this.selectedOrder.set(o);
    this.payAmount.set(Math.round(o.grandTotal - o.paid));
    this.payMode.set('Cash');
    this.payRef.set('');
    this.showPayModal.set(true);
  }

  recordPayment() {
    const o = this.selectedOrder();
    if (!o) return;
    if (this.payAmount() <= 0) { this.showToast('Enter a valid amount.'); return; }
    const due = o.grandTotal - o.paid;
    if (this.payAmount() > due) { this.showToast('Amount exceeds outstanding due.'); return; }
    this.purchaseService.recordPayment(o.id, this.payAmount(), this.payMode());
    this.showToast(`₹${this.payAmount().toLocaleString('en-IN')} paid to ${o.supplier} for ${o.poNumber}.`);
    this.showPayModal.set(false);
  }

  // ── New Purchase Order form ───────────────────────────────────────────────
  newSupplier    = signal('');
  newDueDate     = signal('');
  newPayMode     = signal<PaymentMode>('Credit');
  newNotes       = signal('');
  newInvoiceRef  = signal('');
  productSearch  = signal('');
  cart           = signal<CartLine[]>([]);

  readonly filteredCatalogue = computed(() => {
    const q = this.productSearch().toLowerCase().trim();
    const cat = this.catalogue();
    if (!q) return cat;
    return cat.filter(p =>
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  });

  addToCart(p: CatProduct) {
    const exists = this.cart().find(c => c.product.id === p.id);
    if (exists) {
      this.cart.update(lines => lines.map(c =>
        c.product.id === p.id ? { ...c, qty: c.qty + 1 } : c
      ));
    } else {
      this.cart.update(lines => [...lines, { product: p, qty: 1, rate: p.lastRate }]);
    }
  }

  removeFromCart(id: number) {
    this.cart.update(lines => lines.filter(c => c.product.id !== id));
  }

  updateCartQty(id: number, qty: number) {
    if (qty < 1) { this.removeFromCart(id); return; }
    this.cart.update(lines => lines.map(c => c.product.id === id ? { ...c, qty } : c));
  }

  updateCartRate(id: number, rate: number) {
    this.cart.update(lines => lines.map(c =>
      c.product.id === id ? { ...c, rate: Math.max(0, rate) } : c
    ));
  }

  readonly newSubtotal = computed(() =>
    this.cart().reduce((s, c) => s + c.qty * c.rate, 0)
  );

  readonly newGst = computed(() =>
    this.cart().reduce((s, c) => s + c.qty * c.rate * (c.product.gst / 100), 0)
  );

  readonly newTotal = computed(() => this.newSubtotal() + this.newGst());

  savePurchaseOrder() {
    if (!this.newSupplier()) { this.showToast('Select a supplier.'); return; }
    if (this.cart().length === 0) { this.showToast('Add at least one product.'); return; }

    const supplier = this.suppliers().find(s => s.name === this.newSupplier());
    if (!supplier) { this.showToast('Supplier not found.'); return; }

    const order = this.purchaseService.createPurchaseOrder({
      supplier: supplier.name,
      supplierId: supplier.id,
      supplierPhone: supplier.phone,
      dueDate: this.newDueDate(),
      items: this.cart().map(c => ({
        productId: c.product.id,
        sku: c.product.sku,
        name: c.product.name,
        unit: c.product.unit,
        qty: c.qty,
        rate: c.rate,
        gst: c.product.gst,
      })),
      paymentMode: this.newPayMode(),
      notes: this.newNotes(),
      invoiceRef: this.newInvoiceRef(),
    });

    this.showToast(`Purchase order ${order.poNumber} created for ${supplier.name} — ₹${Math.round(order.grandTotal).toLocaleString('en-IN')}`);
    this.cart.set([]);
    this.newSupplier.set('');
    this.newDueDate.set('');
    this.newNotes.set('');
    this.newInvoiceRef.set('');
    this.productSearch.set('');
    this.activeTab.set('orders');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  toast = signal('');

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3500);
  }

  statusClass(s: string): string {
    if (s === 'Received')  return 'success';
    if (s === 'Pending')   return 'warning';
    if (s === 'Partial')   return 'info';
    if (s === 'Cancelled') return 'danger';
    return '';
  }

  payStatusClass(s: string): string {
    if (s === 'Paid')    return 'success';
    if (s === 'Unpaid')  return 'danger';
    if (s === 'Partial') return 'warning';
    return '';
  }

  avatarColor(key: string): string {
    const map: Record<string, string> = {
      blue: '#2563eb', purple: '#7c3aed', teal: '#0f766e',
      orange: '#ea580c', red: '#dc2626', green: '#16a34a'
    };
    return map[key] ?? '#64748b';
  }

  supplierInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  due(o: PurchaseOrder): number { return o.grandTotal - o.paid; }

  trackById(_: number, item: { id: number }) { return item.id; }
  trackByProductId(_: number, item: CartLine) { return item.product.id; }
}
