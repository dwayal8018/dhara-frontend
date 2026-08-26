import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CATEGORIES, Product, Category } from './inventory.data';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { exportToCsv } from '../../../core/utils/export-csv';

export type SortKey = 'name' | 'stock' | 'price' | 'margin';
export type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Inventory {

  private readonly productService = inject(ProductService);

  readonly allCategories = CATEGORIES;

  // ── Dynamic stats computed from real product data ─────────────────────────
  readonly stats = computed(() => {
    const products = this.productService.products();
    const total = products.length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
    return [
      { label: 'Total Products', value: String(total), icon: 'inventory_2', color: '#2563eb' },
      { label: 'Low Stock', value: String(lowStock), icon: 'warning', color: '#f59e0b' },
      { label: 'Out of Stock', value: String(outOfStock), icon: 'block', color: '#dc2626' },
      { label: 'Total Value', value: '₹' + totalValue.toLocaleString('en-IN'), icon: 'payments', color: '#16a34a' },
    ];
  });

  // ── Dynamic category counts ───────────────────────────────────────────────
  readonly dynamicCategories = computed(() => {
    const catMap = this.productService.categories();
    const totalCount = this.productService.totalCount();
    return this.allCategories.map(c =>
      c.id === 'all'
        ? { ...c, count: totalCount }
        : { ...c, count: catMap.get(c.label) ?? 0 }
    );
  });

  searchQuery      = signal('');
  selectedCategory = signal('all');
  selectedStatus   = signal('all');
  viewMode         = signal<'table' | 'grid'>('table');
  showAddModal     = signal(false);
  editingProduct   = signal<Product | null>(null);
  toast            = signal('');

  // ── Within-category sort ─────────────────────────────────────────────────
  sortKey = signal<SortKey>('name');
  sortDir = signal<SortDir>('asc');

  readonly sortOptions: { key: SortKey; label: string }[] = [
    { key: 'name',   label: 'Name'          },
    { key: 'stock',  label: 'Stock (Low→High)' },
    { key: 'price',  label: 'Selling Price'  },
    { key: 'margin', label: 'Margin'         },
  ];

  setSort(key: SortKey) {
    if (this.sortKey() === key) {
      // toggle direction on re-click
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set(key === 'stock' ? 'asc' : 'asc');
    }
  }

  // Add-product form fields
  form = signal({
    name: '', sku: '', category: 'Plumbing' as Category, brand: '',
    unit: 'Piece', purchasePrice: 0, sellingPrice: 0, wholesalePrice: 0,
    gst: 18, stock: 0, minStock: 10, maxStock: 100,
    warehouse: 'WH-A', rack: 'R-01', barcode: ''
  });

  constructor(private router: Router) { }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }

  // ── Filtered + within-category sorted list ───────────────────────────────
  readonly products = computed(() => {
    let list = [...this.productService.products()];
    const q      = this.searchQuery().toLowerCase();
    const cat    = this.selectedCategory();
    const status = this.selectedStatus();
    const key    = this.sortKey();
    const dir    = this.sortDir();

    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.barcode.includes(q)
      );
    }
    if (cat !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === cat);
    }
    if (status !== 'all') {
      list = list.filter(p => p.status === status);
    }

    // Sort WITHIN each category group so items stay grouped by category
    // when "All" is selected, but are sorted within their group.
    const sortFn = (a: Product, b: Product): number => {
      let cmp = 0;
      if (key === 'name')   cmp = a.name.localeCompare(b.name);
      if (key === 'stock')  cmp = a.stock - b.stock;
      if (key === 'price')  cmp = a.sellingPrice - b.sellingPrice;
      if (key === 'margin') cmp = this.margin(a) - this.margin(b);
      return dir === 'asc' ? cmp : -cmp;
    };

    if (cat === 'all') {
      // Group by category → sort within each group → flatten
      const groups = new Map<string, Product[]>();
      for (const p of list) {
        if (!groups.has(p.category)) groups.set(p.category, []);
        groups.get(p.category)!.push(p);
      }
      for (const [, grp] of groups) grp.sort(sortFn);
      return Array.from(groups.values()).flat();
    } else {
      return list.sort(sortFn);
    }
  });

  // Derived: is a column currently the active sort?
  isSorted(key: SortKey): boolean  { return this.sortKey() === key; }
  sortIcon(key: SortKey): string {
    if (this.sortKey() !== key) return 'unfold_more';
    return this.sortDir() === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
    // Reset sort to name-asc when switching category for a clean view
    this.sortKey.set('name');
    this.sortDir.set('asc');
  }
  setView(mode: 'table' | 'grid') { this.viewMode.set(mode); }

  openAddModal() {
    this.editingProduct.set(null);
    this.form.set({
      name: '', sku: '', category: 'Plumbing', brand: '',
      unit: 'Piece', purchasePrice: 0, sellingPrice: 0, wholesalePrice: 0,
      gst: 18, stock: 0, minStock: 10, maxStock: 100,
      warehouse: 'WH-A', rack: 'R-01', barcode: ''
    });
    this.showAddModal.set(true);
  }

  openEditModal(p: Product) {
    this.editingProduct.set(p);
    this.form.set({
      name: p.name, sku: p.sku, category: p.category, brand: p.brand,
      unit: p.unit, purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice,
      wholesalePrice: p.wholesalePrice, gst: p.gst, stock: p.stock,
      minStock: p.minStock, maxStock: p.maxStock,
      warehouse: p.warehouse, rack: p.rack, barcode: p.barcode
    });
    this.showAddModal.set(true);
  }

  saveProduct() {
    const f = this.form();
    if (!f.name || !f.sku) { this.showToast('Name and SKU are required.'); return; }
    const editing = this.editingProduct();
    if (editing) {
      this.productService.updateProduct(editing.id, {
        name: f.name, sku: f.sku, category: f.category, brand: f.brand,
        unit: f.unit, purchasePrice: f.purchasePrice, sellingPrice: f.sellingPrice,
        wholesalePrice: f.wholesalePrice, gst: f.gst, stock: f.stock,
        minStock: f.minStock, maxStock: f.maxStock,
        warehouse: f.warehouse, rack: f.rack, barcode: f.barcode
      });
      this.showToast(`"${f.name}" updated successfully.`);
    } else {
      this.productService.addProduct({
        name: f.name, sku: f.sku, category: f.category, brand: f.brand,
        unit: f.unit, purchasePrice: f.purchasePrice, sellingPrice: f.sellingPrice,
        wholesalePrice: f.wholesalePrice, gst: f.gst, stock: f.stock,
        minStock: f.minStock, maxStock: f.maxStock,
        warehouse: f.warehouse, rack: f.rack, barcode: f.barcode, image: undefined
      });
      this.showToast(`"${f.name}" added to inventory.`);
    }
    this.showAddModal.set(false);
  }

  deleteProduct(p: Product) {
    if (confirm(`Delete "${p.name}" (${p.sku})? This action cannot be undone.`)) {
      this.productService.deleteProduct(p.id);
      this.showToast(`"${p.name}" removed from inventory.`);
    }
  }

  updateForm(field: string, value: string | number) {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  statusClass(status: string): string {
    if (status === 'In Stock') return 'success';
    if (status === 'Low Stock') return 'warning';
    if (status === 'Out of Stock') return 'danger';
    return '';
  }

  categoryClass(cat: Category): string {
    const map: Record<Category, string> = {
      Plumbing: 'info', Electrical: 'warning', Hardware: 'purple',
      Agriculture: 'success', Paint: 'orange', Steel: 'steel',
      Sanitary: 'teal', Building: 'brown'
    };
    return map[cat] ?? '';
  }

  margin(p: Product): number {
    return Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100);
  }

  trackById(_: number, item: Product) { return item.id; }

  exportInventory() {
    const products = this.products();
    if (products.length === 0) { this.showToast('No products to export.'); return; }
    exportToCsv('inventory_' + new Date().toISOString().slice(0, 10) + '.csv', products as any, [
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Product Name' },
      { key: 'category', label: 'Category' },
      { key: 'brand', label: 'Brand' },
      { key: 'unit', label: 'Unit' },
      { key: 'purchasePrice', label: 'Purchase Price' },
      { key: 'sellingPrice', label: 'Selling Price' },
      { key: 'wholesalePrice', label: 'Wholesale Price' },
      { key: 'gst', label: 'GST %' },
      { key: 'stock', label: 'Current Stock' },
      { key: 'minStock', label: 'Min Stock' },
      { key: 'status', label: 'Status' },
      { key: 'warehouse', label: 'Warehouse' },
      { key: 'rack', label: 'Rack' },
      { key: 'barcode', label: 'Barcode' },
    ]);
    this.showToast('Inventory exported as CSV.');
  }
}
