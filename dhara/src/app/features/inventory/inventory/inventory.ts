import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CATEGORIES, SUBCATEGORIES, Product, Category, getSubCategories } from './inventory.data';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService, ManagedCategory, ManagedSubCategory } from '../../../core/services/category.service';
import { exportToCsv } from '../../../core/utils/export-csv';
import { CartService } from '../../../core/services/cart.service';
import { SaleProduct } from '../../sales/sales/sales.data';

export type SortKey = 'name' | 'stock' | 'price' | 'margin';
export type SortDir = 'asc' | 'desc';

// Navigation state: which level is the user on?
export type NavLevel = 'categories' | 'subcategories' | 'products';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Inventory {

  private readonly productService  = inject(ProductService);
  readonly categoryService         = inject(CategoryService);
  readonly cartService             = inject(CartService);
  private readonly router          = inject(Router);

  // ── Dynamic stats ─────────────────────────────────────────────────────────
  readonly stats = computed(() => {
    const products = this.productService.products();
    const total      = products.length;
    const lowStock   = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
    return [
      { label: 'Total Products', value: String(total),                           icon: 'inventory_2', color: '#2563eb' },
      { label: 'Low Stock',      value: String(lowStock),                         icon: 'warning',     color: '#f59e0b' },
      { label: 'Out of Stock',   value: String(outOfStock),                       icon: 'block',       color: '#dc2626' },
      { label: 'Total Value',    value: '₹' + totalValue.toLocaleString('en-IN'), icon: 'payments',    color: '#16a34a' },
    ];
  });

  // ── Dynamic category counts — now driven by CategoryService ──────────────
  readonly dynamicCategories = computed(() => {
    const catMap     = this.productService.categories();
    const totalCount = this.productService.totalCount();
    const managed    = this.categoryService.categories();

    // Rebuild the "All Products" synthetic entry first
    const all = { id: 'all', label: 'All Products', icon: 'apps', count: totalCount, image: '' };

    const rest = managed.map(c => ({
      id:    c.id,
      label: c.label,
      icon:  c.icon,
      image: c.image,
      count: catMap.get(c.label) ?? 0,
    }));

    return [all, ...rest];
  });

  // ── 3-Level navigation state ──────────────────────────────────────────────
  selectedCategory    = signal<string>('all');
  selectedSubCategory = signal<string | null>(null);
  navLevel            = signal<NavLevel>('categories');

  // Sub-categories for the currently selected main category
  readonly currentSubCategories = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'all') return [];
    return this.categoryService.subCategories().filter(s => s.category === cat);
  });

  // The selected SubCategory object (for header display)
  readonly selectedSubCategoryObj = computed(() => {
    const id = this.selectedSubCategory();
    if (!id) return null;
    return this.categoryService.subCategories().find(s => s.id === id) ?? null;
  });

  // Category label for breadcrumb
  readonly selectedCategoryLabel = computed<string>(() => {
    const cat = this.selectedCategory();
    if (cat === 'all') return 'All Products';
    return this.categoryService.categories().find(c => c.id === cat)?.label ?? cat;
  });

  // ── Search & filters ──────────────────────────────────────────────────────
  searchQuery    = signal('');
  selectedStatus = signal('all');

  // View mode — default CARD for image-first UX
  viewMode = signal<'table' | 'grid'>('grid');

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

  setCategory(catId: string) {
    this.selectedCategory.set(catId);
    this.selectedSubCategory.set(null);
    this.searchQuery.set('');

    if (catId === 'all') {
      this.navLevel.set('products');
    } else {
      const subs = this.categoryService.subCategories().filter(s => s.category === catId);
      this.navLevel.set(subs.length > 0 ? 'subcategories' : 'products');
    }

    this.sortKey.set('name');
    this.sortDir.set('asc');
  }

  goToCategories() {
    this.selectedCategory.set('all');
    this.selectedSubCategory.set(null);
    this.navLevel.set('categories');
    this.searchQuery.set('');
  }

  selectSubCategory(subId: string) {
    this.selectedSubCategory.set(subId);
    this.navLevel.set('products');
  }

  goBackToSubCategories() {
    this.selectedSubCategory.set(null);
    this.navLevel.set('subcategories');
    this.searchQuery.set('');
  }

  goToAll() { this.goToCategories(); }

  setView(mode: 'table' | 'grid') { this.viewMode.set(mode); }

  // ── Helpers ───────────────────────────────────────────────────────────────

  isSorted(key: SortKey): boolean { return this.sortKey() === key; }
  sortIcon(key: SortKey): string {
    if (this.sortKey() !== key) return 'unfold_more';
    return this.sortDir() === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  statusClass(status: string): string {
    if (status === 'In Stock')     return 'success';
    if (status === 'Low Stock')    return 'warning';
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
    return p.sellingPrice > 0
      ? Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100)
      : 0;
  }

  trackById(_: number, item: { id: number }) { return item.id; }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }

  onImgError(event: Event) {
    // Hide the broken image — the fallback div (z-index:0) shows through naturally
    (event.target as HTMLImageElement).style.display = 'none';
  }

  // ── Add / Edit Product modal ──────────────────────────────────────────────

  form = signal({
    name: '', sku: '', categoryId: 'plumbing', subCategory: '',
    brand: '', unit: 'Piece', purchasePrice: 0, sellingPrice: 0, wholesalePrice: 0,
    gst: 18, stock: 0, minStock: 10, maxStock: 100,
    warehouse: 'WH-A', rack: 'R-01', barcode: '', image: ''
  });

  readonly formSubCategories = computed(() =>
    this.categoryService.subCategories().filter(s => s.category === this.form().categoryId)
  );

  openAddModal() {
    this.editingProduct.set(null);
    const cats = this.categoryService.categories();
    const defaultCatId = cats[0]?.id ?? '';
    const defaultSub = this.categoryService.subCategories().find(s => s.category === defaultCatId)?.id ?? '';
    this.form.set({
      name: '', sku: '', categoryId: defaultCatId, subCategory: defaultSub,
      brand: '', unit: 'Piece', purchasePrice: 0, sellingPrice: 0, wholesalePrice: 0,
      gst: 18, stock: 0, minStock: 10, maxStock: 100,
      warehouse: 'WH-A', rack: 'R-01', barcode: '', image: ''
    });
    this.showAddModal.set(true);
  }

  openEditModal(p: Product) {
    this.editingProduct.set(p);
    // Find the category id by matching label (case-insensitive fallback)
    const catId = this.categoryService.categories()
      .find(c => c.label === p.category || c.id === p.category.toLowerCase())?.id
      ?? p.category.toLowerCase();
    this.form.set({
      name: p.name, sku: p.sku, categoryId: catId, subCategory: p.subCategory,
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
      if (field === 'categoryId') {
        // Auto-select first sub-category for this category
        const firstSub = this.categoryService.subCategories()
          .find(s => s.category === (value as string))?.id ?? '';
        updated.subCategory = firstSub;
      }
      return updated;
    });
  }

  saveProduct() {
    const f = this.form();
    if (!f.name || !f.sku) { this.showToast('Name and SKU are required.'); return; }
    // Resolve category label from id for storage
    const catLabel = (this.categoryService.categories().find(c => c.id === f.categoryId)?.label ?? f.categoryId) as Category;
    const editing = this.editingProduct();
    if (editing) {
      this.productService.updateProduct(editing.id, {
        name: f.name, sku: f.sku, category: catLabel, subCategory: f.subCategory,
        brand: f.brand, unit: f.unit, purchasePrice: f.purchasePrice,
        sellingPrice: f.sellingPrice, wholesalePrice: f.wholesalePrice,
        gst: f.gst, stock: f.stock, minStock: f.minStock, maxStock: f.maxStock,
        warehouse: f.warehouse, rack: f.rack, barcode: f.barcode,
        image: f.image || undefined,
      });
      this.showToast(`"${f.name}" updated successfully.`);
    } else {
      this.productService.addProduct({
        name: f.name, sku: f.sku, category: catLabel, subCategory: f.subCategory,
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
      { key: 'sku',            label: 'SKU'             },
      { key: 'name',           label: 'Product Name'    },
      { key: 'category',       label: 'Category'        },
      { key: 'subCategory',    label: 'Sub-Category'    },
      { key: 'brand',          label: 'Brand'           },
      { key: 'unit',           label: 'Unit'            },
      { key: 'purchasePrice',  label: 'Purchase Price'  },
      { key: 'sellingPrice',   label: 'Selling Price'   },
      { key: 'wholesalePrice', label: 'Wholesale Price' },
      { key: 'gst',            label: 'GST %'           },
      { key: 'stock',          label: 'Current Stock'   },
      { key: 'minStock',       label: 'Min Stock'       },
      { key: 'status',         label: 'Status'          },
    ]);
    this.showToast('Inventory exported as CSV.');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Manage Categories Modal
  // ══════════════════════════════════════════════════════════════════════════

  showManageModal = signal(false);
  manageTab       = signal<'categories' | 'subcategories'>('categories');

  // Category form
  editingCategory = signal<ManagedCategory | null>(null);
  showCatForm     = signal(false);
  catForm         = signal({ id: '', label: '', icon: 'category', image: '' });

  // Sub-category form
  editingSubCat   = signal<ManagedSubCategory | null>(null);
  showSubCatForm  = signal(false);
  subCatForm      = signal({ id: '', label: '', category: '', icon: 'grid_view', image: '', description: '' });

  // Filter for sub-category tab
  manageCatFilter = signal('');

  // Drag reorder
  dragIndex       = signal<number | null>(null);
  private dragList = signal<'categories' | 'subcategories' | null>(null);

  readonly filteredManageSubCats = computed(() => {
    const filter = this.manageCatFilter();
    const subs   = this.categoryService.subCategories();
    return filter ? subs.filter(s => s.category === filter) : subs;
  });

  openManageModal() {
    this.showManageModal.set(true);
    this.showCatForm.set(false);
    this.showSubCatForm.set(false);
  }

  openAddCategory() {
    this.editingCategory.set(null);
    this.catForm.set({ id: '', label: '', icon: 'category', image: '' });
    this.showCatForm.set(true);
  }

  openEditCategory(cat: ManagedCategory) {
    this.editingCategory.set(cat);
    this.catForm.set({ ...cat });
    this.showCatForm.set(true);
  }

  saveCategory() {
    const f = this.catForm();
    if (!f.label.trim()) { this.showToast('Category label is required.'); return; }
    const editing = this.editingCategory();
    if (editing) {
      this.categoryService.updateCategory(editing.id, {
        label: f.label.trim(), icon: f.icon, image: f.image
      });
      this.showToast(`Category "${f.label}" updated.`);
    } else {
      const id = f.label.trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      this.categoryService.addCategory({
        id, label: f.label.trim(), icon: f.icon || 'category', image: f.image
      });
      this.showToast(`Category "${f.label}" added.`);
    }
    this.showCatForm.set(false);
  }

  deleteCategory(id: string) {
    const cat = this.categoryService.categories().find(c => c.id === id);
    if (!cat) return;
    if (confirm(`Delete category "${cat.label}"? All its sub-categories will also be deleted.`)) {
      this.categoryService.deleteCategory(id);
      this.showToast(`Category "${cat.label}" deleted.`);
    }
  }

  openAddSubCat() {
    this.editingSubCat.set(null);
    const defaultCat = this.categoryService.categories()[0]?.id ?? '';
    this.subCatForm.set({
      id: '', label: '', category: defaultCat, icon: 'grid_view', image: '', description: ''
    });
    this.showSubCatForm.set(true);
  }

  openEditSubCat(sub: ManagedSubCategory) {
    this.editingSubCat.set(sub);
    this.subCatForm.set({ ...sub, description: sub.description ?? '' });
    this.showSubCatForm.set(true);
  }

  saveSubCat() {
    const f = this.subCatForm();
    if (!f.label.trim() || !f.category) {
      this.showToast('Label and category are required.');
      return;
    }
    const editing = this.editingSubCat();
    if (editing) {
      this.categoryService.updateSubCategory(editing.id, {
        label: f.label.trim(), category: f.category,
        icon: f.icon, image: f.image, description: f.description
      });
      this.showToast(`Sub-category "${f.label}" updated.`);
    } else {
      const id = f.category + '-' +
        f.label.trim().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      this.categoryService.addSubCategory({
        id, label: f.label.trim(), category: f.category,
        icon: f.icon || 'grid_view', image: f.image, description: f.description
      });
      this.showToast(`Sub-category "${f.label}" added.`);
    }
    this.showSubCatForm.set(false);
  }

  deleteSubCat(id: string) {
    const sub = this.categoryService.subCategories().find(s => s.id === id);
    if (!sub) return;
    if (confirm(`Delete sub-category "${sub.label}"?`)) {
      this.categoryService.deleteSubCategory(id);
      this.showToast(`Sub-category "${sub.label}" deleted.`);
    }
  }

  onDragStart(index: number) { this.dragIndex.set(index); }

  onDragOver(targetIndex: number, list: 'categories' | 'subcategories') {
    const from = this.dragIndex();
    if (from === null || from === targetIndex) return;
    if (list === 'categories') {
      this.categoryService.reorderCategories(from, targetIndex);
    } else {
      const filter = this.manageCatFilter();
      this.categoryService.reorderSubCategories(from, targetIndex, filter || null);
    }
    this.dragIndex.set(targetIndex);
  }

  onDragEnd() { this.dragIndex.set(null); }

  constructor() {}

  // ── Cart drawer ───────────────────────────────────────────────────────────

  drawerOpen = signal(false);

  addToOrder(p: Product): void {
    const sp: SaleProduct = {
      id: p.id, sku: p.sku, name: p.name, unit: p.unit,
      sellingPrice: p.sellingPrice, wholesalePrice: p.wholesalePrice,
      gst: p.gst, stock: p.stock
    };
    this.cartService.addToCart(sp);
  }

  generateBill(): void {
    this.drawerOpen.set(false);
    this.router.navigate(['/sales'], { queryParams: { invoice: '1' } });
  }
}
