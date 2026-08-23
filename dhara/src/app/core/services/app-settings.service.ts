import { effect, Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import {
  SHOP_PROFILE, STAFF_USERS, TAX_CONFIG, NOTIFICATION_PREFS,
  ShopProfile, StaffUser, TaxConfig, NotificationPref,
  UserRole, ThemeMode, Language
} from '../../features/settings/settings/settings.data';

// ─── Storage keys ─────────────────────────────────────────────────────────────
const SK = {
  THEME:      'dh_theme',
  FONT:       'dh_font',
  CURRENCY:   'dh_currency',
  DATE_FMT:   'dh_date_format',
  LANGUAGE:   'dh_language',
  SIDEBAR:    'dh_sidebar_collapsed',
  COMPACT:    'dh_compact_tables',
  PRICE_GRID: 'dh_show_price_grid',
  SHOP:       'dh_shop',
  TAX:        'dh_tax',
  NOTIFS:     'dh_notifs',
  USERS:      'dh_users',
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    // localStorage.clear();
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

@Injectable({ providedIn: 'root' })
export class AppSettingsService {

  // ── Appearance ────────────────────────────────────────────────────────────
  themeMode        = signal<ThemeMode>(load(SK.THEME,      'light'));
  fontSize         = signal<'small' | 'medium' | 'large'>(load(SK.FONT, 'medium'));
  language         = signal<Language>(load(SK.LANGUAGE,    'English'));
  currency         = signal<string>(load(SK.CURRENCY,      'INR — ₹ Indian Rupee'));
  dateFormat       = signal<string>(load(SK.DATE_FMT,      'DD MMM YYYY'));
  sidebarCollapsed = signal<boolean>(load(SK.SIDEBAR,      false));
  compactTables    = signal<boolean>(load(SK.COMPACT,      false));
  showPriceInGrid  = signal<boolean>(load(SK.PRICE_GRID,   true));

  // ── Business data ─────────────────────────────────────────────────────────
  shop   = signal<ShopProfile>(load(SK.SHOP,   { ...SHOP_PROFILE }));
  tax    = signal<TaxConfig>(load(SK.TAX,      { ...TAX_CONFIG   }));
  notifs = signal<NotificationPref[]>(load(SK.NOTIFS, [...NOTIFICATION_PREFS]));
  users  = signal<StaffUser[]>(load(SK.USERS,  [...STAFF_USERS]));

  constructor(private readonly router: Router) {
    // Listen to router navigation to re-apply Google Translation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          try {
            const currentLang = this.language();
            const targetLang = currentLang === 'English' ? '' : (currentLang === 'Marathi' ? 'mr' : 'hi');
            
            const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (combo) {
              if (targetLang) {
                // Double-dispatch: temporarily reset to force Google Translate to re-scan the new DOM view
                combo.value = '';
                combo.dispatchEvent(new Event('change'));
                setTimeout(() => {
                  combo.value = targetLang;
                  combo.dispatchEvent(new Event('change'));
                }, 50);
              } else {
                combo.value = '';
                combo.dispatchEvent(new Event('change'));
              }
            }
          } catch (e) {
            // safe catch
          }
        }, 500); // 500ms delay to let Angular render the new component view
      }
    });

    // Set initial attribute values immediately so there's no flash before
    // the first effect run
    const initialFont = this.fontSize();
    document.documentElement.setAttribute('data-font-size', initialFont);

    const initialLang = this.language();
    const isDevanagari = initialLang === 'Marathi' || initialLang === 'Hindi';
    document.documentElement.setAttribute('data-lang', isDevanagari ? 'devanagari' : 'latin');
    const langMap: Record<string, string> = { 'English': 'en', 'Marathi': 'mr', 'Hindi': 'hi' };
    document.documentElement.setAttribute('lang', langMap[initialLang] ?? 'en');

    const initialTheme = this.themeMode();
    const html = document.documentElement;
    if (initialTheme === 'system') {
      html.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
      html.setAttribute('data-theme', initialTheme);
    }

    // ── Apply + persist appearance side-effects ─────────────────────────────
    effect(() => {
      const theme = this.themeMode();
      const html  = document.documentElement;
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        html.setAttribute('data-theme', theme);
      }
      save(SK.THEME, theme);
    });

    effect(() => {
      const size = this.fontSize();
      // Use a data attribute so CSS rules can respond (avoids specificity fight
      // with the stylesheet html { font-size: 16px } rule)
      document.documentElement.setAttribute('data-font-size', size);
      save(SK.FONT, size);
    });

    effect(() => {
      const compact = this.compactTables();
      document.documentElement.toggleAttribute('data-compact', compact);
      save(SK.COMPACT, compact);
    });

    effect(() => {
      const show = this.showPriceInGrid();
      document.documentElement.toggleAttribute('data-price-grid', show);
      save(SK.PRICE_GRID, show);
    });

    // ── Persist remaining settings ──────────────────────────────────────────
    effect(() => {
      const lang = this.language();
      // Map language to a BCP-47 lang code for the html element
      const langMap: Record<string, string> = {
        'English': 'en',
        'Marathi': 'mr',
        'Hindi':   'hi',
      };
      document.documentElement.setAttribute('lang', langMap[lang] ?? 'en');
      // Swap body font to support Devanagari script for Marathi/Hindi
      const isDevanagari = lang === 'Marathi' || lang === 'Hindi';
      document.documentElement.setAttribute('data-lang', isDevanagari ? 'devanagari' : 'latin');
      save(SK.LANGUAGE, lang);

      // Programmatically trigger Google Translate combo selection
      try {
        const targetLang = lang === 'English' ? '' : (langMap[lang] ?? '');
        
        const triggerTranslate = () => {
          const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
          if (combo) {
            combo.value = targetLang;
            combo.dispatchEvent(new Event('change'));
            return true;
          }
          return false;
        };

        if (!triggerTranslate()) {
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            if (triggerTranslate() || attempts > 10) {
              clearInterval(interval);
            }
          }, 500);
        }
      } catch (err) {
        // Safe catch for environment issues
      }
    });
    effect(() => save(SK.CURRENCY,   this.currency()));
    effect(() => save(SK.DATE_FMT,   this.dateFormat()));
    effect(() => save(SK.SIDEBAR,    this.sidebarCollapsed()));
    effect(() => save(SK.SHOP,       this.shop()));
    effect(() => save(SK.TAX,        this.tax()));
    effect(() => save(SK.NOTIFS,     this.notifs()));
    effect(() => save(SK.USERS,      this.users()));
  }

  // ── Helpers used by Settings component ────────────────────────────────────

  updateShop(field: keyof ShopProfile, value: string): void {
    this.shop.update(s => ({ ...s, [field]: value }));
  }

  updateTax<K extends keyof TaxConfig>(field: K, value: TaxConfig[K]): void {
    this.tax.update(t => ({ ...t, [field]: value }));
  }

  toggleNotif(id: string, channel: 'sms' | 'whatsapp' | 'inApp'): void {
    this.notifs.update(list =>
      list.map(n => n.id === id ? { ...n, [channel]: !n[channel] } : n)
    );
  }

  saveUser(
    editing: StaffUser | null,
    name: string, phone: string, email: string, role: UserRole
  ): void {
    if (editing) {
      this.users.update(list =>
        list.map(u => u.id === editing.id ? { ...u, name, phone, email, role } : u)
      );
    } else {
      const newUser: StaffUser = {
        id: Date.now(), name, phone, email, role,
        status: 'Active', joinDate: 'Jul 2026', lastLogin: 'Never',
        avatar: 'blue', permissions: this.rolePermissions(role),
      };
      this.users.update(list => [...list, newUser]);
    }
  }

  toggleUserStatus(id: number): void {
    this.users.update(list =>
      list.map(u => u.id === id
        ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
        : u
      )
    );
  }

  rolePermissions(role: UserRole): string[] {
    const map: Record<UserRole, string[]> = {
      Owner:       ['All Access'],
      Manager:     ['Sales', 'Inventory', 'Purchases', 'Reports', 'Customers'],
      Cashier:     ['Sales', 'Customers'],
      Storekeeper: ['Inventory', 'Purchases'],
    };
    return map[role];
  }
}
