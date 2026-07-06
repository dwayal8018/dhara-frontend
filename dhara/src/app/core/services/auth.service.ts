import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StaffUser, STAFF_USERS } from '../../features/settings/settings/settings.data';

const SESSION_KEY = 'dh_session_user_id';

// ── Permission map: which permission key covers each route ────────────────────
// 'All Access' means the user can see/do everything (Owner role).
// Routes not in this map are visible to everyone who is logged in (dashboard, settings).
export const ROUTE_PERMISSION: Record<string, string> = {
  inventory:  'Inventory',
  sales:      'Sales',
  purchases:  'Purchases',
  customers:  'Customers',
  suppliers:  'Suppliers',
  finance:    'Finance',
  reports:    'Reports',
  settings:   'Settings',
  // dashboard is always accessible — no entry needed
};

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _currentUser = signal<StaffUser | null>(this._loadSession());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn  = computed(() => this._currentUser() !== null);

  // ── Permission check ──────────────────────────────────────────────────────
  /**
   * Returns true if the logged-in user has the given permission key,
   * or if they have 'All Access' (Owner).
   * Pass null/undefined to check "is just logged in".
   */
  hasPermission(permission: string | null | undefined): boolean {
    const user = this._currentUser();
    if (!user) return false;
    if (!permission) return true;                         // no restriction → allow
    if (user.permissions.includes('All Access')) return true;
    return user.permissions.includes(permission);
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  login(phone: string, pin: string, users: StaffUser[]): StaffUser | null {
    const user = users.find(u => u.phone === phone.trim() && u.status === 'Active');
    if (!user) return null;

    const expectedPin = user.phone.slice(-4);
    if (pin !== expectedPin) return null;

    try { localStorage.setItem(SESSION_KEY, String(user.id)); } catch { /* quota */ }
    this._currentUser.set(user);
    return user;
  }

  refreshCurrentUser(users: StaffUser[]): void {
    const id = this._currentUser()?.id;
    if (id == null) return;
    const updated = users.find(u => u.id === id);
    if (updated) this._currentUser.set(updated);
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  logout(router: Router): void {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    this._currentUser.set(null);
    router.navigateByUrl('/login');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private _loadSession(): StaffUser | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const id = Number(raw);
      return STAFF_USERS.find(u => u.id === id && u.status === 'Active') ?? null;
    } catch {
      return null;
    }
  }

  avatarColor(key: string): string {
    const map: Record<string, string> = {
      blue: '#2563eb', purple: '#7c3aed', teal: '#0f766e',
      orange: '#ea580c', red: '#dc2626', green: '#16a34a', pink: '#db2777',
    };
    return map[key] ?? '#64748b';
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
}
