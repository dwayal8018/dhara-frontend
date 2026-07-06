import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavSearchService } from '../../core/services/nav-search.service';
import { AppSettingsService } from '../../core/services/app-settings.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'dh-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {

  sidebarCollapsed = input<boolean>(false);

  private readonly router   = inject(Router);
  private readonly el       = inject(ElementRef);
  readonly search           = inject(NavSearchService);
  readonly settings         = inject(AppSettingsService);
  readonly auth             = inject(AuthService);

  // ── Current user (from auth session, not hardcoded Owner) ─────────────────
  readonly currentUser    = computed(() => this.auth.currentUser());
  readonly shopName       = computed(() => this.settings.shop().shopName);

  readonly userName       = computed(() => this.currentUser()?.name ?? '');
  readonly userRole       = computed(() => this.currentUser()?.role ?? '');
  readonly userInitials   = computed(() => this.auth.initials(this.userName()));
  readonly userAvatarKey  = computed(() => this.currentUser()?.avatar ?? 'blue');
  readonly userAvatarColor = computed(() => this.auth.avatarColor(this.userAvatarKey()));

  // ── Panel open states ─────────────────────────────────────────────────────
  showSearch  = signal(false);
  showNotifs  = signal(false);
  showProfile = signal(false);

  private closeAll() {
    this.showSearch.set(false);
    this.showNotifs.set(false);
    this.showProfile.set(false);
  }

  toggleNotifs()  { const was = this.showNotifs();  this.closeAll(); this.showNotifs.set(!was);  }
  toggleProfile() { const was = this.showProfile(); this.closeAll(); this.showProfile.set(!was); }

  // ── Search ────────────────────────────────────────────────────────────────
  onSearchFocus() {
    this.closeAll();
    this.showSearch.set(true);
  }

  onSearchInput(value: string) {
    this.search.query.set(value);
    this.showSearch.set(true);
  }

  navigateTo(route: string) {
    this.router.navigateByUrl(route);
    this.search.query.set('');
    this.showSearch.set(false);
  }

  clearSearch(inputEl: HTMLInputElement) {
    inputEl.value = '';
    this.search.query.set('');
    this.showSearch.set(false);
    inputEl.blur();
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  readonly notifications = computed(() => this.search.notifications());
  readonly unreadCount   = computed(() => this.search.unreadCount());

  markAllRead()  { this.search.markAllRead(); }
  markRead(id: string) { this.search.markRead(id); }
  dismissNotif(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.search.dismiss(id);
  }

  // ── Click-outside to close panels ─────────────────────────────────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.closeAll();
    }
  }

  // ── Quick nav ─────────────────────────────────────────────────────────────
  readonly quickNav = [
    { label: 'New Sale',  icon: 'add_shopping_cart', route: '/sales'     },
    { label: 'Inventory', icon: 'inventory_2',       route: '/inventory' },
    { label: 'Customers', icon: 'people',            route: '/customers' },
    { label: 'Reports',   icon: 'bar_chart',         route: '/reports'   },
  ];

  // ── User menu ─────────────────────────────────────────────────────────────
  goToSettings() {
    this.closeAll();
    this.router.navigateByUrl('/settings');
  }

  logout() {
    this.closeAll();
    this.auth.logout(this.router);
  }

  // ── Grouped search results ────────────────────────────────────────────────
  readonly groupedResults = computed(() => {
    const results = this.search.results();
    const groups = new Map<string, typeof results>();
    for (const item of results) {
      if (!groups.has(item.category)) groups.set(item.category, []);
      groups.get(item.category)!.push(item);
    }
    return Array.from(groups.entries()).map(([cat, items]) => ({ cat, items }));
  });
}
