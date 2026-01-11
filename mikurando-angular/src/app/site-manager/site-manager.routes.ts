import { Routes } from '@angular/router';
import { SmShellComponent } from './ui/sm-shell.component';

export const siteManagerRoutes: Routes = [
  {
    path: '',
    component: SmShellComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/sm-dashboard.page').then((m) => m.SmDashboardPage),
      },
      {
        path: 'restaurants',
        loadComponent: () => import('./pages/sm-restaurants.page').then((m) => m.SmRestaurantsPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/sm-settings.page').then((m) => m.SmSettingsPage),
      },
      {
        path: 'vouchers',
        loadComponent: () => import('./pages/sm-vouchers.page').then((m) => m.SmVouchersPage),
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/sm-reports.page').then((m) => m.SmReportsPage),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/sm-users.page').then((m) => m.SmUsersPage),
      },
    ],
  },
];
