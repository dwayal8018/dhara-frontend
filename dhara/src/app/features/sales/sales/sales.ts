import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  SALE_PRODUCTS, RECENT_INVOICES,
  SaleProduct, CartItem, PaymentMode, SavedInvoice
} from './sales.data';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.html',
  styleUrl: './sales.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sales {

  // ── Catalogue & search ───────────────────────────────────────────────────
  readonly allProducts = SALE_PRODUCTS;
  readonly recentInvoices = RECENT_INVOICES;
  readonly today = new Date();

  productSearch = signal('');
  activeTab = signal<'new' | 'history'>('new');

  readonly filteredProducts = computed(() => {
    const q = this.productSearch().toLowerCase().trim();
    if (!q) return this.allProducts;
    return this.allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  // ── Cart ─────────────────────────────────────────────────────────────────
  cart = signal<CartItem[]>([]);

  addToCart(p: SaleProduct) {
    const existing = this.cart().find(c => c.product.id === p.id);
    if (existing) {
      this.cart.update(items =>
        items.map(c => c.product.id === p.id
          ? { ...c, qty: c.qty + 1 }
          : c
        )
      );
    } else {
      this.cart.update(items => [...items, {
        product: p, qty: 1, price: p.sellingPrice, discount: 0
      }]);
    }
  }

  removeFromCart(id: number) {
    this.cart.update(items => items.filter(c => c.product.id !== id));
  }

  updateQty(id: number, qty: number) {
    if (qty < 1) { this.removeFromCart(id); return; }
    this.cart.update(items =>
      items.map(c => c.product.id === id ? { ...c, qty } : c)
    );
  }

  updatePrice(id: number, price: number) {
    this.cart.update(items =>
      items.map(c => c.product.id === id ? { ...c, price: Math.max(0, price) } : c)
    );
  }

  updateLineDiscount(id: number, discount: number) {
    this.cart.update(items =>
      items.map(c => c.product.id === id
        ? { ...c, discount: Math.min(100, Math.max(0, discount)) }
        : c)
    );
  }

  clearCart() { this.cart.set([]); }

  // ── Totals ───────────────────────────────────────────────────────────────
  readonly subtotal = computed(() =>
    this.cart().reduce((sum, c) => {
      const lineTotal = c.qty * c.price;
      const lineDisc  = lineTotal * (c.discount / 100);
      return sum + (lineTotal - lineDisc);
    }, 0)
  );

  readonly gstAmount = computed(() =>
    this.cart().reduce((sum, c) => {
      const lineTotal = c.qty * c.price * (1 - c.discount / 100);
      return sum + lineTotal * (c.product.gst / 100);
    }, 0)
  );

  readonly grandTotal = computed(() => {
    const afterExtraDisc = this.subtotal() * (1 - this.extraDiscount() / 100);
    return afterExtraDisc + this.gstAmount();
  });

  readonly balance = computed(() =>
    this.grandTotal() - this.amountPaid()
  );

  // ── Billing form ─────────────────────────────────────────────────────────
  customerName   = signal('');
  customerPhone  = signal('');
  paymentMode    = signal<PaymentMode>('Cash');
  extraDiscount  = signal(0);
  amountPaid     = signal(0);
  notes          = signal('');
  invoiceNumber  = signal('INV-0242');
  toast          = signal('');

  readonly paymentModes: PaymentMode[] = ['Cash', 'UPI', 'Credit', 'Cheque'];

  setPaymentMode(m: PaymentMode) {
    this.paymentMode.set(m);
    // Auto-fill paid amount for Cash/UPI
    if (m === 'Cash' || m === 'UPI') {
      this.amountPaid.set(Math.round(this.grandTotal()));
    } else if (m === 'Credit') {
      this.amountPaid.set(0);
    }
  }

  payFull() {
    this.amountPaid.set(Math.round(this.grandTotal()));
  }

  // ── Invoice history filter ───────────────────────────────────────────────
  historySearch = signal('');
  historyFilter = signal<'all' | 'Paid' | 'Pending' | 'Partial'>('all');

  readonly filteredHistory = computed(() => {
    let list = this.recentInvoices;
    const q = this.historySearch().toLowerCase();
    const f = this.historyFilter();
    if (q) list = list.filter(i =>
      i.invoice.toLowerCase().includes(q) ||
      i.customer.toLowerCase().includes(q) ||
      i.phone.includes(q)
    );
    if (f !== 'all') list = list.filter(i => i.status === f);
    return list;
  });

  readonly historyTotalRevenue  = computed(() => this.filteredHistory().reduce((s, i) => s + i.total,  0));
  readonly historyTotalCollected = computed(() => this.filteredHistory().reduce((s, i) => s + i.paid,   0));
  readonly historyTotalPending  = computed(() => this.filteredHistory().reduce((s, i) => s + Math.max(0, i.total - i.paid), 0));

  // ── Actions ──────────────────────────────────────────────────────────────
  constructor(private router: Router) {}

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3500);
  }

  saveSale() {
    if (this.cart().length === 0) {
      this.showToast('Add at least one product to the cart.');
      return;
    }
    if (!this.customerName()) {
      this.showToast('Enter customer name before saving.');
      return;
    }
    this.showToast(`Invoice ${this.invoiceNumber()} saved! Total ₹${Math.round(this.grandTotal()).toLocaleString('en-IN')}`);
    this.cart.set([]);
    this.customerName.set('');
    this.customerPhone.set('');
    this.extraDiscount.set(0);
    this.amountPaid.set(0);
    this.notes.set('');
  }

  printInvoice() {
    if (this.cart().length === 0) { this.showToast('Cart is empty.'); return; }
    this.showToast('Print preview opening…');
  }

  statusClass(s: string): string {
    if (s === 'Paid')    return 'success';
    if (s === 'Pending') return 'danger';
    if (s === 'Partial') return 'warning';
    return '';
  }

  modeIcon(m: PaymentMode): string {
    const map: Record<PaymentMode, string> = {
      Cash: 'payments', UPI: 'contactless', Credit: 'account_balance_wallet', Cheque: 'receipt'
    };
    return map[m];
  }

  trackById(_: number, item: { id: number }) { return item.id; }
  trackByProductId(_: number, item: CartItem) { return item.product.id; }
}
