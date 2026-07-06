import { Injectable, signal, computed } from '@angular/core';

export interface SearchItem {
  label: string;
  description: string;
  icon: string;
  route: string;
  category: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  icon: string;
  iconColor: string;
  time: string;
  read: boolean;
}

// ── All searchable pages / actions ────────────────────────────────────────────
const ALL_ITEMS: SearchItem[] = [
  { label: 'Dashboard',         description: 'Overview, KPIs and quick actions',        icon: 'dashboard',       route: '/dashboard',  category: 'Pages' },
  { label: 'Inventory',         description: 'Products, stock levels and categories',   icon: 'inventory_2',     route: '/inventory',  category: 'Pages' },
  { label: 'Sales',             description: 'Invoices, orders and billing',            icon: 'point_of_sale',   route: '/sales',      category: 'Pages' },
  { label: 'Purchases',         description: 'Purchase orders and supplier bills',      icon: 'shopping_bag',    route: '/purchases',  category: 'Pages' },
  { label: 'Customers',         description: 'Customer accounts and Khata ledger',      icon: 'people',          route: '/customers',  category: 'Pages' },
  { label: 'Suppliers',         description: 'Supplier directory and accounts',         icon: 'local_shipping',  route: '/suppliers',  category: 'Pages' },
  { label: 'Finance',           description: 'Cash flow, expenses and P&L',            icon: 'account_balance', route: '/finance',    category: 'Pages' },
  { label: 'Reports',           description: 'Sales, inventory and financial reports',  icon: 'bar_chart',       route: '/reports',    category: 'Pages' },
  { label: 'Settings',          description: 'Shop profile, users and preferences',     icon: 'settings',        route: '/settings',   category: 'Pages' },
  { label: 'Shop Profile',      description: 'Edit business name, address and GST',     icon: 'store',           route: '/settings',   category: 'Settings' },
  { label: 'Users & Staff',     description: 'Manage staff roles and permissions',      icon: 'manage_accounts', route: '/settings',   category: 'Settings' },
  { label: 'Tax & GST',         description: 'GST registration and invoice tax config', icon: 'receipt_long',    route: '/settings',   category: 'Settings' },
  { label: 'Notifications',     description: 'SMS, WhatsApp and in-app alert prefs',   icon: 'notifications',   route: '/settings',   category: 'Settings' },
  { label: 'Appearance',        description: 'Theme, language and display options',     icon: 'palette',         route: '/settings',   category: 'Settings' },
];

// ── Mock in-app notifications ─────────────────────────────────────────────────
const INITIAL_NOTIFS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Low Stock Alert',
    body: 'Turmeric Powder is below minimum stock level (3 kg remaining).',
    icon: 'inventory_2',
    iconColor: '#ea580c',
    time: '5 min ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'Payment Received',
    body: 'Ramesh Traders paid ₹12,500 against invoice #INV-0842.',
    icon: 'payments',
    iconColor: '#16a34a',
    time: '22 min ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'Customer Due Reminder',
    body: 'Sunita Devi has an outstanding balance of ₹4,200 (overdue 12 days).',
    icon: 'person_alert',
    iconColor: '#dc2626',
    time: '1 hr ago',
    read: false,
  },
  {
    id: 'n4',
    title: 'Daily Sales Summary',
    body: 'Yesterday\'s sales: ₹38,400 across 14 invoices. Profit: ₹9,200.',
    icon: 'bar_chart',
    iconColor: '#2563eb',
    time: '8 hr ago',
    read: true,
  },
  {
    id: 'n5',
    title: 'Supplier Payment Due',
    body: 'Invoice from Agro Supplies Pvt Ltd (₹24,000) due in 3 days.',
    icon: 'local_shipping',
    iconColor: '#7c3aed',
    time: 'Yesterday',
    read: true,
  },
];

@Injectable({ providedIn: 'root' })
export class NavSearchService {

  // ── Search ────────────────────────────────────────────────────────────────
  query = signal('');

  results = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (q.length < 1) return [];
    return ALL_ITEMS.filter(
      item =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    ).slice(0, 8);
  });

  // ── Notifications ─────────────────────────────────────────────────────────
  private _notifs = signal<AppNotification[]>([...INITIAL_NOTIFS]);

  notifications  = this._notifs.asReadonly();
  unreadCount    = computed(() => this._notifs().filter(n => !n.read).length);

  markAllRead(): void {
    this._notifs.update(list => list.map(n => ({ ...n, read: true })));
  }

  markRead(id: string): void {
    this._notifs.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  dismiss(id: string): void {
    this._notifs.update(list => list.filter(n => n.id !== id));
  }
}
