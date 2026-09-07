import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CATEGORIES, SUBCATEGORIES, SubCategory, Product, Category, getSubCategories } from './inventory.data';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { exportToCsv } from '../../../core/utils/export-csv';

export type SortKey = 'name' | 'stock' | 'price' | 'margin';
export type SortDir = 'asc' | 'desc';

// Navigation state: which level is the user on?
export type NavLevel = 'subcategories' | 'products';

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

  // ── Dynamic stats ─────────────────────────────────────────────────────────
  readonly stats = computed(() => {
    const products = this.productService.products();
    const total      = products.length;
    const lowStock   = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
    return [
      { label: 'Total Products', value: String(total),                                    icon: 'inventory_2', color: '#2563eb' },
      { label: 'Low Stock',      value: String(lowStock),                                  icon: 'warning',     color: '#f59e0b' },
      { label: 'Out of Stock',   value: String(outOfStock),                                icon: 'block',       color: '#dc2626' },
      { label: 'Total Value',    value: '₹' + totalValue.toLocaleString('en-IN'),          icon: 'payments',    color: '#16a34a' },
    ];
  });

  // ── Dynamic category counts ───────────────────────────────────────────────
  readonly dynamicCategories = computed(() => {
    const catMap     = this.productService.categories();
    const totalCount = this.productService.totalCount();
    return this.allCategories.map(c =>
      c.id === 'all'
        ? { ...c, count: totalCount }
        : { ...c, count: catMap.get(c.label) ?? 0 }
    );
  });

  // ── 3-Level navigation state ──────────────────────────────────────────────
  // selectedCategory: 'all' | category-id  (left sidebar)
  // selectedSubCategory: null | subCategory-id  (set when user taps a sub-card)
  // navLevel: 'subcategories' | 'products'
  //
  // When selectedCategory === 'all' → skip sub-category level → go straight to products
  // When a category is selected → show sub-category cards (navLevel='subcategories')
  // When a sub-category is tapped → show product cards (navLevel='products')

  selectedCategory    = signal<string>('all');
  selectedSubCategory = signal<string | null>(null);
  navLevel            = signal<NavLevel>('products'); // 'all' starts on products

  // Sub-categories for the currently selected main category
  readonly currentSubCategories = computed<SubCategory[]>(() => {
    const cat = this.selectedCategory();
    if (cat === 'all') return [];
    return SUBCATEGORIES.filter(s => s.category.toLowerCase() === cat);
  });

  // The selected SubCategory object (for header display)
  readonly selectedSubCategoryObj = computed<SubCategory | null>(() => {
    const id = this.selectedSubCategory();
    if (!id) return null;
    return SUBCATEGORIES.find(s => s.id === id) ?? null;
  });

  // Category label for breadcrumb
  readonly selectedCategoryLabel = computed<string>(() => {
    const cat = this.selectedCategory();
    if (cat === 'all') return 'All Products';
    return this.allCategories.find(c => c.id === cat)?.label ?? cat;
  });

  // ── Search & filters ──────────────────────────────────────────────────────
  searchQuery    = signal('');
  selectedStatus = signal('all');

  // View mode — default CARD for image-first UX
  viewMode       = signal<'table' | 'grid'>('grid');

  // Add/edit modal
  showAddModal    = signal(false);
  editingProduct  = signal<Product | null>(null);
  toast           = signal('');

  // Sort
  sortKey = signal<SortKey>('name');
  sortDir = signal<SortDir>('asc');

  readonly sortOptions: { key: SortKey; label: string }[] = [
    { key: 'name',   label: 'Name'             },
    { key: 'stock',  label: 'Stock (Low→High)' },
    { key: 'price',  label: 'Selling Price'    },
    { key: 'margin', label: 'Margin'           },
  ];

  setSort(key: SortKey) {
    if (this.sortKey() === key) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  // ── Filtered products ─────────────────────────────────────────────────────
  readonly products = computed(() => {
    let list = [...this.productService.products()];
    const q      = this.searchQuery().toLowerCase();
    const cat    = this.selectedCategory();
    const sub    = this.selectedSubCategory();
    const status = this.selectedStatus();
    const key    = this.sortKey();
    const dir    = this.sortDir();

    // Filter
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
    if (sub) {
      list = list.filter(p => p.subCategory === sub);
    }
    if (status !== 'all') {
      list = list.filter(p => p.status === status);
    }

    // Sort
    const sortFn = (a: Product, b: Product): number => {
      let cmp = 0;
      if (key === 'name')   cmp = a.name.localeCompare(b.name);
      if (key === 'stock')  cmp = a.stock - b.stock;
      if (key === 'price')  cmp = a.sellingPrice - b.sellingPrice;
      if (key === 'margin') cmp = this.margin(a) - this.margin(b);
      return dir === 'asc' ? cmp : -cmp;
    };

    return list.sort(sortFn);
  });

  // ── Navigation actions ────────────────────────────────────────────────────

  /** Click a category in the sidebar */
  setCategory(catId: string) {
    this.selectedCategory.set(catId);
    this.selectedSubCategory.set(null);
    this.searchQuery.set('');

    if (catId === 'all') {
      // All products → skip sub-category level
      this.navLevel.set('products');
    } else {
      const subs = getSubCategories(this.allCategories.find(c => c.id === catId)?.label ?? '');
      if (subs.length > 0) {
        this.navLevel.set('subcategories');
      } else {
        this.navLevel.set('products');
      }
    }

    this.sortKey.set('name');
    this.sortDir.set('asc');
  }

  /** Click a sub-category card */
  selectSubCategory(subId: string) {
    this.selectedSubCategory.set(subId);
    this.navLevel.set('products');
  }

  /** Breadcrumb back: from products → subcategories */
  goBackToSubCategories() {
    this.selectedSubCategory.set(null);
    this.navLevel.set('subcategories');
    this.searchQuery.set('');
  }

  /** Breadcrumb back: to all products */
  goToAll() {
    this.setCategory('all');
  }

  setView(mode: 'table' | 'grid') { this.viewMode.set(mode); }

  // ── Helpers ───────────────────────────────────────────────────────────────

  isSorted(key: SortKey): boolean { return this.sortKey() === key; }
  sortIcon(key: SortKey): string {
    if (this.sortKey() !== key) return 'unfold_more';
    return this.sortDir() === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  statusClass(status: string): string {
    if (status === 'In Stock')    return 'success';
    if (status === 'Low Stock')   return 'warning';
    if (status === 'Out of Stock')return 'danger';
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
    return p.sellingPrice > 0
      ? Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100)
      : 0;
  }

  trackById(_: number, item: { id: number }) { return item.id; }
  trackBySubId(_: number, item: SubCategory) { return item.id; }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }

  // ── Product image fallback ────────────────────────────────────────────────
  onImgError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  // ── Add / Edit modal ──────────────────────────────────────────────────────
  // Form state
  form = signal({
    name: '', sku: '', category: 'Plumbing' as Category, subCategory: 'plumbing-pipes',
    brand: '', unit: 'Piece', purchasePrice: 0, sellingPrice: 0, wholesalePrice: 0,
    gst: 18, stock: 0, minStock: 10, maxStock: 100,
    warehouse: 'WH-A', rack: 'R-01', barcode: '', image: ''
  });

  // Sub-categories available for the current form category
  readonly formSubCategories = computed(() =>
    SUBCATEGORIES.filter(s => s.category === this.form().category)
  );

  openAddModal() {
    this.editingProduct.set(null);
    const defaultCat: Category = 'Plumbing';
    const defaultSub = SUBCATEGORIES.find(s => s.category === defaultCat)?.id ?? '';
    this.form.set({
      name: '', sku: '', category: defaultCat, subCategory: defaultSub,
      brand: '', unit: 'Piece', purchasePrice: 0, sellingPrice: 0, wholesalePrice: 0,
      gst: 18, stock: 0, minStock: 10, maxStock: 100,
      warehouse: 'WH-A', rack: 'R-01', barcode: '', image: ''
    });
    this.showAddModal.set(true);
  }

  openEditModal(p: Product) {
    this.editingProduct.set(p);
    this.form.set({
      name: p.name, sku: p.sku, category: p.category, subCategory: p.subCategory,
      brand: p.brand, unit: p.unit, purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice, wholesalePrice: p.wholesalePrice,
      gst: p.gst, stock: p.stock, minStock: p.minStock, maxStock: p.maxStock,
      warehouse: p.warehouse, rack: p.rack, barcode: p.barcode, image: p.image ?? ''
    });
    this.showAddModal.set(true);
  }

  updateForm(field: string, value: string | number) {
    this.form.update(f => {
      const updated: any = { ...f, [field]: value };
      // When category changes, reset subCategory to first of new category
      if (field === 'category') {
        const firstSub = SUBCATEGORIES.find(s => s.category === value)?.id ?? '';
        updated.subCategory = firstSub;
      }
      return updated;
    });
  }

  saveProduct() {
    const f = this.form();
    if (!f.name || !f.sku) { this.showToast('Name and SKU are required.'); return; }
    const editing = this.editingProduct();
    if (editing) {
      this.productService.updateProduct(editing.id, {
        name: f.name, sku: f.sku, category: f.category, subCategory: f.subCategory,
        brand: f.brand, unit: f.unit, purchasePrice: f.purchasePrice,
        sellingPrice: f.sellingPrice, wholesalePrice: f.wholesalePrice,
        gst: f.gst, stock: f.stock, minStock: f.minStock, maxStock: f.maxStock,
        warehouse: f.warehouse, rack: f.rack, barcode: f.barcode,
        image: f.image || undefined,
      });
      this.showToast(`"${f.name}" updated successfully.`);
    } else {
      this.productService.addProduct({
        name: f.name, sku: f.sku, category: f.category, subCategory: f.subCategory,
        brand: f.brand, unit: f.unit, purchasePrice: f.purchasePrice,
        sellingPrice: f.sellingPrice, wholesalePrice: f.wholesalePrice,
        gst: f.gst, stock: f.stock, minStock: f.minStock, maxStock: f.maxStock,
        warehouse: f.warehouse, rack: f.rack, barcode: f.barcode,
        image: f.image || undefined,
      });
      this.showToast(`"${f.name}" added to inventory.`);
    }
    this.showAddModal.set(false);
  }

  deleteProduct(p: Product) {
    if (confirm(`Delete "${p.name}" (${p.sku})? This cannot be undone.`)) {
      this.productService.deleteProduct(p.id);
      this.showToast(`"${p.name}" removed from inventory.`);
    }
  }

  exportInventory() {
    const list = this.products();
    if (list.length === 0) { this.showToast('No products to export.'); return; }
    exportToCsv('inventory_' + new Date().toISOString().slice(0, 10) + '.csv', list as any, [
      { key: 'sku',           label: 'SKU'            },
      { key: 'name',          label: 'Product Name'   },
      { key: 'category',      label: 'Category'       },
      { key: 'subCategory',   label: 'Sub-Category'   },
      { key: 'brand',         label: 'Brand'          },
      { key: 'unit',          label: 'Unit'           },
      { key: 'purchasePrice', label: 'Purchase Price' },
      { key: 'sellingPrice',  label: 'Selling Price'  },
      { key: 'wholesalePrice',label: 'Wholesale Price'},
      { key: 'gst',           label: 'GST %'          },
      { key: 'stock',         label: 'Current Stock'  },
      { key: 'minStock',      label: 'Min Stock'      },
      { key: 'status',        label: 'Status'         },
    ]);
    this.showToast('Inventory exported as CSV.');
  }

  constructor(private router: Router) {}
}
