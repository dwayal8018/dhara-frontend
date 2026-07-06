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
        path: 'showcase',
        loadComponent: () =>
          import('./features/showcase/pages/showcase-page/showcase-page').then(c => c.ShowcasePage)
      }
    ]
  }
];
