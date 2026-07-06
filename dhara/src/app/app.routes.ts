import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/app-shell/app-shell').then(c => c.AppShell),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then(c => c.Dashboard)
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/inventory/inventory/inventory').then(c => c.Inventory)
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./features/sales/sales/sales').then(c => c.Sales)
      },
      {
        path: 'purchases',
        loadComponent: () =>
          import('./features/purchases/purchases/purchases').then(c => c.Purchases)
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customers/customers').then(c => c.Customers)
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('./features/suppliers/suppliers/suppliers').then(c => c.Suppliers)
      },
      {
        path: 'finance',
        loadComponent: () =>
          import('./features/finance/finance/finance').then(c => c.Finance)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports/reports').then(c => c.Reports)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings/settings').then(c => c.Settings)
      },
      {
        path: 'showcase',
        loadComponent: () =>
          import('./features/showcase/pages/showcase-page/showcase-page').then(c => c.ShowcasePage)
      }
    ]
  }
];
