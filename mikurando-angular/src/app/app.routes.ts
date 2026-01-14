import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RestaurantProfile } from './owner/restaurant-profile/restaurant-profile';
import { OrderReception } from './owner/order-reception/order-reception';
import { authGuard } from './shared/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },

  {
    path: 'site-manager',
    canActivate: [authGuard],
    loadChildren: () => import('./site-manager').then((m) => m.siteManagerRoutes),
  },

  {
    path: 'owner/restaurant-profile',
    component: RestaurantProfile
  },
  {
    path: 'owner/orders',
    component: OrderReception
  },

  { path: '**', redirectTo: '/login' },
];
