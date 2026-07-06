import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppSettingsService } from '../../core/services/app-settings.service';
import { AuthService }        from '../../core/services/auth.service';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  permission: string | null; // null = visible to every logged-in user
}

// Full nav catalogue — permission keys match ROUTE_PERMISSION in AuthService
const ALL_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard',        icon: 'dashboard',       route: '/dashboard', permission: null        },
  { id: 'inventory', label: 'Inventory',         icon: 'inventory_2',     route: '/inventory', permission: 'Inventory' },
  { id: 'sales',     label: 'Sales',             icon: 'point_of_sale',   route: '/sales',     permission: 'Sales'     },
  { id: 'purchases', label: 'Purchases',         icon: 'shopping_bag',    route: '/purchases', permission: 'Purchases' },
  { id: 'customers', label: 'Customers (Khata)', icon: 'people',          route: '/customers', permission: 'Customers' },
  { id: 'suppliers', label: 'Suppliers',         icon: 'local_shipping',  route: '/suppliers', permission: 'Suppliers' },
  { id: 'finance',   label: 'Finance',           icon: 'account_balance', route: '/finance',   permission: 'Finance'   },
  { id: 'reports',   label: 'Reports',           icon: 'bar_chart',       route: '/reports',   permission: 'Reports'   },
  { id: 'settings',  label: 'Settings',          icon: 'settings',        route: '/settings',  permission: 'Settings'  },
];

@Component({
  selector: 'dh-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {

  private readonly settings = inject(AppSettingsService);
  private readonly auth     = inject(AuthService);

  collapsed      = this.settings.sidebarCollapsed;
  collapseChange = output<boolean>();

  // Only show items the current user has permission to access
  readonly navItems = computed(() =>
    ALL_NAV.filter(item => this.auth.hasPermission(item.permission))
  );

  toggleCollapse(): void {
    this.settings.sidebarCollapsed.update(v => !v);
    this.collapseChange.emit(this.collapsed());
  }
}
