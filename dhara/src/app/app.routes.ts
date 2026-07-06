import { Routes } from '@angular/router';
import { authGuard }       from './core/gaurds/auth.guard';
import { permissionGuard } from './core/gaurds/permission.guard';

export const routes: Routes = [
  // ── Public ────────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(c => c.Login),
  },

  // ── Protected shell ───────────────────────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/app-shell/app-shell').then(c => c.AppShell),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Always accessible to any logged-in user
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then(c => c.Dashboard),
      },

      // Permission-gated routes
      {
        path: 'inventory',
        canActivate: [permissionGuard],
        data: { permission: 'Inventory' },
        loadComponent: () =>
          import('./features/inventory/inventory/inventory').then(c => c.Inventory),
      },
      {
        path: 'sales',
        canActivate: [permissionGuard],
        data: { permission: 'Sales' },
        loadComponent: () =>
          import('./features/sales/sales/sales').then(c => c.Sales),
      },
      {
        path: 'purchases',
        canActivate: [permissionGuard],
        data: { permission: 'Purchases' },
        loadComponent: () =>
          import('./features/purchases/purchases/purchases').then(c => c.Purchases),
      },
      {
        path: 'customers',
        canActivate: [permissionGuard],
        data: { permission: 'Customers' },
        loadComponent: () =>
          import('./features/customers/customers/customers').then(c => c.Customers),
      },
      {
        path: 'suppliers',
        canActivate: [permissionGuard],
        data: { permission: 'Suppliers' },
        loadComponent: () =>
          import('./features/suppliers/suppliers/suppliers').then(c => c.Suppliers),
      },
      {
        path: 'finance',
        canActivate: [permissionGuard],
        data: { permission: 'Finance' },
        loadComponent: () =>
          import('./features/finance/finance/finance').then(c => c.Finance),
      },
      {
        path: 'reports',
        canActivate: [permissionGuard],
        data: { permission: 'Reports' },
        loadComponent: () =>
          import('./features/reports/reports/reports').then(c => c.Reports),
      },
      {
        path: 'settings',
        canActivate: [permissionGuard],
        data: { permission: 'Settings' },
        loadComponent: () =>
          import('./features/settings/settings/settings').then(c => c.Settings),
      },
      {
        path: 'showcase',
        loadComponent: () =>
          import('./features/showcase/pages/showcase-page/showcase-page').then(c => c.ShowcasePage),
      },
    ],
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'login' },
];
