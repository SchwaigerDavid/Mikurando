import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import {DashboardOwner} from './owner/dashboard/dashboard';
import { authGuard } from './shared/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {path :'ownerdash',component: DashboardOwner},

  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },

  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./site-manager').then((m) => m.adminRoutes),
  },

  { path: '**', redirectTo: '/login' },
];
