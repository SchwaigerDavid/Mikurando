import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import {Tabs} from './owner/tabs/tabs';
import {NotFound} from './not-found/not-found';
import {MapComponent} from './components/map/map'
import { authGuard } from './shared/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {path :'ownerdash',component: Tabs},
  {path:'notfound',component: NotFound},
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
    path: 'map',
    component: MapComponent,
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: '/notfound' },
];
