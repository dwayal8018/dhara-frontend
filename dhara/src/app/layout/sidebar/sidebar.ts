import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppSettingsService } from '../../core/services/app-settings.service';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'dh-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {

  private readonly settings = inject(AppSettingsService);

  // Derive collapsed state from the service so it survives navigation
  collapsed = this.settings.sidebarCollapsed;

  collapseChange = output<boolean>();

  readonly navItems: NavItem[] = [
    { id: 'dashboard',  label: 'Dashboard',        icon: 'dashboard',       route: '/dashboard'  },
    { id: 'inventory',  label: 'Inventory',         icon: 'inventory_2',     route: '/inventory'  },
    { id: 'sales',      label: 'Sales',             icon: 'point_of_sale',   route: '/sales'      },
    { id: 'purchases',  label: 'Purchases',         icon: 'shopping_bag',    route: '/purchases'  },
    { id: 'customers',  label: 'Customers (Khata)', icon: 'people',          route: '/customers'  },
    { id: 'suppliers',  label: 'Suppliers',         icon: 'local_shipping',  route: '/suppliers'  },
    { id: 'finance',    label: 'Finance',           icon: 'account_balance', route: '/finance'    },
    { id: 'reports',    label: 'Reports',           icon: 'bar_chart',       route: '/reports'    },
    { id: 'settings',   label: 'Settings',          icon: 'settings',        route: '/settings'   }
  ];

  toggleCollapse(): void {
    this.settings.sidebarCollapsed.update(v => !v);
    this.collapseChange.emit(this.collapsed());
  }

}
