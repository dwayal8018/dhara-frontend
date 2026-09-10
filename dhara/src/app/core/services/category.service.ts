import { computed, effect, Injectable, signal } from '@angular/core';
import { CATEGORIES, SUBCATEGORIES } from '../../features/inventory/inventory/inventory.data';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ManagedCategory {
  id: string;
  label: string;
  icon: string;
  image: string;
}

export interface ManagedSubCategory {
  id: string;
  label: string;
  category: string;   // category id
  icon: string;
  image: string;
  description?: string;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const SK_CATEGORIES    = 'dh_categories';
const SK_SUBCATEGORIES = 'dh_subcategories';
// Bump this version string whenever SEED_CATEGORIES or SEED_SUBCATEGORIES
// changes in inventory.data.ts — the service will re-seed from code automatically.
const SEED_VERSION     = 'v6';
const SK_SEED_VERSION  = 'dh_cat_seed_ver';

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

// ─── Seed data — converted from the static constants ─────────────────────────

const SEED_CATEGORIES: ManagedCategory[] = CATEGORIES
  .filter(c => c.id !== 'all')  // exclude the synthetic "All Products" entry
  .map(c => ({ id: c.id, label: c.label, icon: c.icon, image: c.image }));

const SEED_SUBCATEGORIES: ManagedSubCategory[] = SUBCATEGORIES.map(s => ({
  id: s.id,
  label: s.label,
  category: s.category.toLowerCase(),  // match the id convention (e.g. 'plumbing')
  icon: s.icon,
  image: s.image,
  description: s.description,
}));

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CategoryService {

  // If the stored seed version doesn't match SEED_VERSION, discard localStorage
  // and re-seed from the latest data in inventory.data.ts.
  private readonly _seedOk = localStorage.getItem(SK_SEED_VERSION) === SEED_VERSION;

  readonly categories    = signal<ManagedCategory[]>(
    this._seedOk ? load(SK_CATEGORIES, [...SEED_CATEGORIES]) : [...SEED_CATEGORIES]
  );
  readonly subCategories = signal<ManagedSubCategory[]>(
    this._seedOk ? load(SK_SUBCATEGORIES, [...SEED_SUBCATEGORIES]) : [...SEED_SUBCATEGORIES]
  );

  constructor() {
    // Mark this seed version as applied
    try { localStorage.setItem(SK_SEED_VERSION, SEED_VERSION); } catch { /* quota */ }
    effect(() => save(SK_CATEGORIES,    this.categories()));
    effect(() => save(SK_SUBCATEGORIES, this.subCategories()));
  }

  // ── Category CRUD ─────────────────────────────────────────────────────────

  addCategory(cat: ManagedCategory): void {
    this.categories.update(list => [...list, cat]);
  }

  updateCategory(id: string, data: Partial<Omit<ManagedCategory, 'id'>>): void {
    this.categories.update(list =>
      list.map(c => c.id === id ? { ...c, ...data } : c)
    );
  }

  deleteCategory(id: string): void {
    this.categories.update(list => list.filter(c => c.id !== id));
    // Also remove all sub-categories that belong to this category
    this.subCategories.update(list => list.filter(s => s.category !== id));
  }

  reorderCategories(from: number, to: number): void {
    this.categories.update(list => {
      const arr = [...list];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  }

  // ── Sub-category CRUD ─────────────────────────────────────────────────────

  addSubCategory(sub: ManagedSubCategory): void {
    this.subCategories.update(list => [...list, sub]);
  }

  updateSubCategory(id: string, data: Partial<Omit<ManagedSubCategory, 'id'>>): void {
    this.subCategories.update(list =>
      list.map(s => s.id === id ? { ...s, ...data } : s)
    );
  }

  deleteSubCategory(id: string): void {
    this.subCategories.update(list => list.filter(s => s.id !== id));
  }

  reorderSubCategories(from: number, to: number, categoryFilter: string | null): void {
    this.subCategories.update(list => {
      if (categoryFilter) {
        // Work on the filtered slice, keep the rest in their original position
        const filtered = list.filter(s => s.category === categoryFilter);
        const rest     = list.filter(s => s.category !== categoryFilter);
        const [moved]  = filtered.splice(from, 1);
        filtered.splice(to, 0, moved);
        return [...filtered, ...rest];
      } else {
        const arr = [...list];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        return arr;
      }
    });
  }
}
