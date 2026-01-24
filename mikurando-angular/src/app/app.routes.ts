import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RestaurantProfile } from './owner/restaurant-profile/restaurant-profile';
import { OrderReception } from './owner/order-reception/order-reception';
import { authGuard } from './shared/auth/auth.guard';
import {GraphComponent} from './owner/analytic/graphs/graph.component';

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
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./site-manager').then((m) => m.adminRoutes),
  },
  {
    path:'graph',
    component: GraphComponent
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
