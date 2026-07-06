import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PRODUCTS, INVENTORY_STATS, CATEGORIES, Product, Category } from './inventory.data';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Inventory {

  readonly stats = INVENTORY_STATS;
  readonly allCategories = CATEGORIES;

  searchQuery = signal('');
  selectedCategory = signal('all');
  selectedStatus = signal('all');
  viewMode = signal<'table' | 'grid'>('table');
  showAddModal = signal(false);
  editingProduct = signal<Product | null>(null);
  toast = signal('');

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

  readonly products = computed(() => {
    let list = PRODUCTS;
    const q = this.searchQuery().toLowerCase();
    const cat = this.selectedCategory();
    const status = this.selectedStatus();

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
    return list;
  });

  setCategory(cat: string) { this.selectedCategory.set(cat); }
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
      this.showToast(`"${f.name}" updated successfully.`);
    } else {
      this.showToast(`"${f.name}" added to inventory.`);
    }
    this.showAddModal.set(false);
  }

  deleteProduct(p: Product) {
    if (confirm(`Delete "${p.name}" (${p.sku})? This action cannot be undone.`)) {
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
}
