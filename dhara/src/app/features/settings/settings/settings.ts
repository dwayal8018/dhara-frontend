import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppSettingsService } from '../../../core/services/app-settings.service';
import { StaffUser, UserRole, ThemeMode } from './settings.data';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Settings {

  readonly svc = inject(AppSettingsService);

  // ── Tab ───────────────────────────────────────────────────────────────────
  activeTab = signal<'shop' | 'users' | 'tax' | 'notifications' | 'appearance'>('shop');

  // ── Shop Profile ─────────────────────────────────────────────────────────
  // Delegate reads/writes to service
  get shop()  { return this.svc.shop; }
  updateShop(field: Parameters<AppSettingsService['updateShop']>[0], value: string) {
    this.svc.updateShop(field, value);
  }
  saveShop() { this.showToast('Shop profile saved successfully.'); }

  // ── Users ─────────────────────────────────────────────────────────────────
  get users() { return this.svc.users; }

  showUserModal = signal(false);
  editingUser   = signal<StaffUser | null>(null);

  newName  = signal('');
  newPhone = signal('');
  newEmail = signal('');
  newRole  = signal<UserRole>('Cashier');

  readonly roles: UserRole[] = ['Owner', 'Manager', 'Cashier', 'Storekeeper'];

  openAddUser() {
    this.editingUser.set(null);
    this.newName.set(''); this.newPhone.set('');
    this.newEmail.set(''); this.newRole.set('Cashier');
    this.showUserModal.set(true);
  }

  openEditUser(u: StaffUser) {
    this.editingUser.set(u);
    this.newName.set(u.name); this.newPhone.set(u.phone);
    this.newEmail.set(u.email); this.newRole.set(u.role);
    this.showUserModal.set(true);
  }

  saveUser() {
    if (!this.newName() || !this.newPhone()) {
      this.showToast('Name and phone are required.'); return;
    }
    const editing = this.editingUser();
    this.svc.saveUser(editing, this.newName(), this.newPhone(), this.newEmail(), this.newRole());
    this.showToast(editing ? `${this.newName()} updated.` : `${this.newName()} added as ${this.newRole()}.`);
    this.showUserModal.set(false);
  }

  toggleUserStatus(id: number) { this.svc.toggleUserStatus(id); }

  rolePermissions(role: UserRole) { return this.svc.rolePermissions(role); }

  // ── Tax Config ────────────────────────────────────────────────────────────
  get tax() { return this.svc.tax; }

  updateTax<K extends Parameters<AppSettingsService['updateTax']>[0]>(
    field: K,
    value: Parameters<AppSettingsService['updateTax']>[1]
  ) {
    this.svc.updateTax(field as any, value as any);
  }

  saveTax() { this.showToast('Tax configuration saved.'); }

  readonly gstRates      = [0, 5, 12, 18, 28];
  readonly filingOptions = ['monthly', 'quarterly'];

  // ── Notifications ─────────────────────────────────────────────────────────
  get notifs() { return this.svc.notifs; }

  toggleNotif(id: string, channel: 'sms' | 'whatsapp' | 'inApp') {
    this.svc.toggleNotif(id, channel);
  }

  saveNotifs() { this.showToast('Notification preferences saved.'); }

  // ── Appearance ────────────────────────────────────────────────────────────
  // All bound directly to service signals — changes take effect immediately
  get themeMode()        { return this.svc.themeMode; }
  get language()         { return this.svc.language; }
  get currency()         { return this.svc.currency; }
  get dateFormat()       { return this.svc.dateFormat; }
  get fontSize()         { return this.svc.fontSize; }
  get sidebarCollapsed() { return this.svc.sidebarCollapsed; }
  get compactTables()    { return this.svc.compactTables; }
  get showPriceInGrid()  { return this.svc.showPriceInGrid; }

  readonly themes: { id: ThemeMode; label: string; icon: string }[] = [
    { id: 'light',  label: 'Light',  icon: 'light_mode' },
    { id: 'dark',   label: 'Dark',   icon: 'dark_mode'  },
    { id: 'system', label: 'System', icon: 'devices'    },
  ];
  readonly languages: readonly string[] = ['English', 'Marathi', 'Hindi'];
  readonly fontSizes  = ['small', 'medium', 'large'] as const;

  onLanguageChange(val: string) {
    this.svc.language.set(val as any);
  }

  saveAppearance() { this.showToast('Appearance preferences saved.'); }

  // ── Reset Demo Data ───────────────────────────────────────────────────────
  showResetConfirm = signal(false);

  resetDemoData() {
    // Clear ALL DHARA localStorage keys including fresh_start flag
    const keys = Object.keys(localStorage).filter(k => k.startsWith('dh_'));
    for (const key of keys) {
      localStorage.removeItem(key);
    }
    // Explicitly ensure fresh_start is removed so demo data seeds
    localStorage.removeItem('dh_fresh_start');
    this.showResetConfirm.set(false);
    this.showToast('All data cleared. Reloading with fresh demo data...');
    setTimeout(() => window.location.reload(), 1500);
  }

  clearAndStartFresh() {
    // Clear ALL data and explicitly store empty arrays so services don't re-seed
    const keys = Object.keys(localStorage).filter(k => k.startsWith('dh_'));
    for (const key of keys) {
      localStorage.removeItem(key);
    }
    // Explicitly save empty data so services won't fall back to mock
    localStorage.setItem('dh_products', '[]');
    localStorage.setItem('dh_customers', '[]');
    localStorage.setItem('dh_khata_entries', '[]');
    localStorage.setItem('dh_suppliers', '[]');
    localStorage.setItem('dh_supplier_transactions', '[]');
    localStorage.setItem('dh_purchases', '[]');
    localStorage.setItem('dh_invoices', '[]');
    this.showResetConfirm.set(false);
    this.showToast('All data cleared. Starting fresh...');
    setTimeout(() => window.location.reload(), 1500);
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  toast = signal('');

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3500);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  avatarColor(key: string): string {
    const map: Record<string, string> = {
      blue: '#2563eb', purple: '#7c3aed', teal: '#0f766e',
      orange: '#ea580c', red: '#dc2626', green: '#16a34a', pink: '#db2777'
    };
    return map[key] ?? '#64748b';
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  roleColor(role: UserRole): string {
    const map: Record<UserRole, string> = {
      Owner: 'purple', Manager: 'blue', Cashier: 'green', Storekeeper: 'orange'
    };
    return map[role];
  }
}
