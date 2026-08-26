import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SaleProduct, CartItem, PaymentMode, SavedInvoice } from './sales.data';
import { ProductService } from '../../../core/services/product.service';
import { SalesService, InvoiceRecord } from '../../../core/services/sales.service';
import { AppSettingsService } from '../../../core/services/app-settings.service';
import { exportToCsv } from '../../../core/utils/export-csv';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.html',
  styleUrls: ['./sales.css', './invoice-print.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sales {

  private readonly productService = inject(ProductService);
  private readonly salesService = inject(SalesService);
  private readonly settingsService = inject(AppSettingsService);

  // ── Print ─────────────────────────────────────────────────────────────────
  printData = signal<InvoiceRecord | null>(null);
  readonly shopProfile = computed(() => this.settingsService.shop());

  // ── Catalogue & search ───────────────────────────────────────────────────
  readonly allProducts = computed(() => this.productService.saleProducts());
  readonly recentInvoices = computed(() => this.salesService.invoices());
  readonly today = new Date();

  productSearch = signal('');
  activeTab = signal<'new' | 'history'>('new');

  readonly filteredProducts = computed(() => {
    const q = this.productSearch().toLowerCase().trim();
    const products = this.allProducts();
    if (!q) return products;
    return products.filter(p =>
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
  invoiceNumber  = computed(() => this.salesService.nextInvoiceNumber());
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
    let list = this.recentInvoices();
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

  // ── Partial payment modal ────────────────────────────────────────────────
  showPartialPayModal = signal(false);
  partialPayInvoice   = signal<SavedInvoice | null>(null);

  // ── Invoice detail modal ──────────────────────────────────────────────────
  showDetailModal = signal(false);
  detailInvoice   = signal<InvoiceRecord | null>(null);

  openInvoiceDetail(inv: InvoiceRecord) {
    this.detailInvoice.set(inv);
    this.showDetailModal.set(true);
  }
  partialPayAmount    = signal(0);
  partialPayMode      = signal<PaymentMode>('Cash');
  partialPayRef       = signal('');

  readonly Math = Math;

  openPartialPayModal(inv: SavedInvoice) {
    this.partialPayInvoice.set(inv);
    this.partialPayAmount.set(inv.total - inv.paid);
    this.partialPayMode.set('Cash');
    this.partialPayRef.set('');
    this.showPartialPayModal.set(true);
  }

  savePartialPayment() {
    const inv = this.partialPayInvoice();
    if (!inv) return;
    const amt = this.partialPayAmount();
    const due = inv.total - inv.paid;
    if (amt <= 0)   { this.showToast('Enter a valid amount.'); return; }
    if (amt > due)  { this.showToast(`Amount exceeds balance due (₹${due.toLocaleString('en-IN')}).`); return; }

    this.salesService.recordPartialPayment(inv.id, amt, this.partialPayMode());

    const label = amt >= due ? 'fully paid' : `partial payment of ₹${amt.toLocaleString('en-IN')} recorded`;
    this.showToast(`${inv.invoice} — ${label} via ${this.partialPayMode()}.`);
    this.showPartialPayModal.set(false);
  }

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

    const lineItems = this.cart().map(c => ({
      productId: c.product.id,
      sku: c.product.sku,
      name: c.product.name,
      unit: c.product.unit,
      qty: c.qty,
      price: c.price,
      discount: c.discount,
      gst: c.product.gst,
    }));

    const record = this.salesService.saveSale({
      customer: this.customerName(),
      phone: this.customerPhone(),
      lineItems,
      subtotal: this.subtotal(),
      gstAmt: this.gstAmount(),
      discount: this.extraDiscount(),
      total: this.grandTotal(),
      paid: this.amountPaid(),
      paymentMode: this.paymentMode(),
      notes: this.notes(),
    });

    this.showToast(`Invoice ${record.invoice} saved! Total ₹${Math.round(record.total).toLocaleString('en-IN')}`);
    this.cart.set([]);
    this.customerName.set('');
    this.customerPhone.set('');
    this.extraDiscount.set(0);
    this.amountPaid.set(0);
    this.notes.set('');
  }

  printInvoice() {
    if (this.cart().length === 0) { this.showToast('Cart is empty.'); return; }
    const lineItems = this.cart().map(c => ({
      productId: c.product.id,
      sku: c.product.sku,
      name: c.product.name,
      unit: c.product.unit,
      qty: c.qty,
      price: c.price,
      discount: c.discount,
      gst: c.product.gst,
    }));
    const now = new Date();
    const tempRecord: InvoiceRecord = {
      id: 0,
      invoice: this.invoiceNumber(),
      customer: this.customerName() || 'Walk-in Customer',
      phone: this.customerPhone(),
      items: lineItems.length,
      subtotal: this.subtotal(),
      gstAmt: Math.round(this.gstAmount()),
      discount: this.extraDiscount(),
      total: Math.round(this.grandTotal()),
      paid: Math.round(this.amountPaid()),
      paymentMode: this.paymentMode(),
      status: 'Paid',
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      lineItems,
      notes: this.notes(),
    };
    this._openPrintWindow(tempRecord);
  }

  printSavedInvoice(inv: InvoiceRecord) {
    this._openPrintWindow(inv);
  }

  private _openPrintWindow(inv: InvoiceRecord) {
    const shop = this.shopProfile();
    const upiId = shop.upiId || '';

    // Build line items HTML
    const itemsHtml = inv.lineItems.map((item, i) => {
      const lineAmt = item.qty * item.price * (1 - item.discount / 100);
      return `<tr>
        <td>${i + 1}</td>
        <td>${item.name} <span style="color:#64748b;font-size:11px">(${item.sku})</span></td>
        <td>${item.qty} ${item.unit}</td>
        <td>₹${item.price.toLocaleString('en-IN')}</td>
        <td>${item.gst}%</td>
        <td style="text-align:right">₹${Math.round(lineAmt).toLocaleString('en-IN')}</td>
      </tr>`;
    }).join('');

    // QR code for UPI payment (uses a free QR API)
    const qrHtml = upiId ? `
      <div style="text-align:center;margin-top:16px;padding-top:16px;border-top:1px dashed #cbd5e1">
        <p style="margin:0 0 8px;font-size:12px;color:#475569;font-weight:600">Scan to Pay via UPI</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shop.shopName)}&am=${inv.total - inv.paid}&cu=INR" alt="UPI QR" style="width:140px;height:140px" />
        <p style="margin:4px 0 0;font-size:11px;color:#64748b">${upiId}</p>
      </div>
    ` : '';

    const discountRow = inv.discount > 0
      ? `<tr><td>Discount (${inv.discount}%)</td><td style="text-align:right">-₹${Math.round(inv.subtotal * inv.discount / 100).toLocaleString('en-IN')}</td></tr>`
      : '';

    const balanceDue = inv.total - inv.paid;
    const balanceRow = balanceDue > 0
      ? `<tr><td>Balance Due</td><td style="text-align:right;color:#dc2626;font-weight:700">₹${balanceDue.toLocaleString('en-IN')}</td></tr>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${inv.invoice} — ${shop.shopName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 24px 32px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; margin-bottom: 16px; }
    .shop h1 { font-size: 20px; margin-bottom: 4px; }
    .shop p { font-size: 11px; color: #444; margin: 2px 0; }
    .meta { text-align: right; }
    .meta h2 { font-size: 16px; color: #2563eb; margin-bottom: 6px; }
    .meta p { font-size: 11px; color: #444; margin: 2px 0; }
    .customer { margin-bottom: 14px; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
    .customer p { font-size: 12px; margin: 2px 0; }
    .customer strong { font-size: 13px; }
    table.items { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 12px; }
    table.items th { background: #1e293b; color: #fff; padding: 7px 10px; text-align: left; font-size: 10px; text-transform: uppercase; }
    table.items th:last-child { text-align: right; }
    table.items td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
    table.items tr:nth-child(even) { background: #f8fafc; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 14px; }
    .totals table { width: 260px; font-size: 12px; }
    .totals td { padding: 4px 10px; }
    .totals td:last-child { text-align: right; font-weight: 600; }
    .totals tr.grand { border-top: 2px solid #1a1a1a; font-size: 14px; font-weight: 700; }
    .totals tr.grand td { padding-top: 8px; }
    .payment { display: flex; gap: 20px; padding: 10px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; font-size: 12px; margin-bottom: 14px; }
    .payment span { font-weight: 600; }
    .footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; }
    .footer p { margin: 3px 0; }
    .notes { margin-bottom: 12px; padding: 8px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; font-size: 11px; }
    @media print { body { padding: 12px 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="shop">
      <h1>${shop.shopName}</h1>
      <p>${shop.address}, ${shop.city}, ${shop.state} - ${shop.pincode}</p>
      <p>Phone: ${shop.phone}${shop.altPhone ? ' / ' + shop.altPhone : ''}</p>
      ${shop.gst ? '<p>GSTIN: ' + shop.gst + '</p>' : ''}
      ${shop.pan ? '<p>PAN: ' + shop.pan + '</p>' : ''}
    </div>
    <div class="meta">
      <h2>TAX INVOICE</h2>
      <p><strong>${inv.invoice}</strong></p>
      <p>Date: ${inv.date}</p>
      <p>Time: ${inv.time}</p>
    </div>
  </div>

  <div class="customer">
    <p><strong>${inv.customer}</strong></p>
    ${inv.phone ? '<p>Phone: ' + inv.phone + '</p>' : ''}
  </div>

  <table class="items">
    <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>GST</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>Subtotal</td><td style="text-align:right">₹${Math.round(inv.subtotal).toLocaleString('en-IN')}</td></tr>
      ${discountRow}
      <tr><td>GST</td><td style="text-align:right">₹${inv.gstAmt.toLocaleString('en-IN')}</td></tr>
      <tr class="grand"><td>Grand Total</td><td style="text-align:right">₹${inv.total.toLocaleString('en-IN')}</td></tr>
      <tr><td>Paid</td><td style="text-align:right;color:#16a34a">₹${inv.paid.toLocaleString('en-IN')}</td></tr>
      ${balanceRow}
    </table>
  </div>

  <div class="payment">
    <span>Payment: ${inv.paymentMode}</span>
    <span>Status: ${inv.status}</span>
  </div>

  ${inv.notes ? '<div class="notes"><strong>Notes:</strong> ' + inv.notes + '</div>' : ''}

  ${qrHtml}

  <div class="footer">
    <p>Thank you for your business!</p>
    ${shop.bankName ? '<p>Bank: ' + shop.bankName + ' | A/C: ' + shop.accountNo + ' | IFSC: ' + shop.ifsc + '</p>' : ''}
    <p style="margin-top:8px;color:#94a3b8">Powered by DHARA — Smart Business Management</p>
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=820,height=900');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      this.showToast('Pop-up blocked. Please allow pop-ups for printing.');
    }
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

  exportSalesHistory() {
    const invoices = this.filteredHistory();
    if (invoices.length === 0) { this.showToast('No invoices to export.'); return; }
    exportToCsv('sales_' + new Date().toISOString().slice(0, 10) + '.csv', invoices as any, [
      { key: 'invoice', label: 'Invoice #' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'customer', label: 'Customer' },
      { key: 'phone', label: 'Phone' },
      { key: 'items', label: 'Items Count' },
      { key: 'subtotal', label: 'Subtotal' },
      { key: 'gstAmt', label: 'GST' },
      { key: 'discount', label: 'Discount %' },
      { key: 'total', label: 'Total' },
      { key: 'paid', label: 'Paid' },
      { key: 'paymentMode', label: 'Payment Mode' },
      { key: 'status', label: 'Status' },
    ]);
    this.showToast('Sales history exported as CSV.');
  }
}
