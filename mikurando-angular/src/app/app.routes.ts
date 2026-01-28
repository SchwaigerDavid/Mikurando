import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import {Tabs} from './owner/tabs/tabs';
import {NotFound} from './not-found/not-found';
import {MapComponent} from './components/map/map'
import { RestaurantProfile } from './owner/restaurant-profile/restaurant-profile';
import { OrderReception } from './owner/order-reception/order-reception';
import { authGuard } from './shared/auth/auth.guard';
import {GraphComponent} from './owner/dashboard/graphs/graphs.component';
import {DashboardOwner} from './owner/dashboard/dashboard';
import { RestaurantCardComponent } from './customer/restaurant-card/restaurant-card';
import { RestaurantList } from './customer/restaurant-list/restaurant-list';
import { Feedback } from './customer/feedback/feedback';
import { Tracking } from './customer/tracking/tracking';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {path :'ownerdash',component: Tabs},
  {path:'notfound',component: NotFound},
  {path:'graph',component: GraphComponent},
  {path:'dash',component: DashboardOwner},
  {
    path: 'resCard',
    component: RestaurantCardComponent
  },
   {
    path: 'restaurants',
    component: RestaurantList
  },
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
    path: 'owner/restaurant-profile',
    component: RestaurantProfile
  },
  {
    path: 'owner/orders',
    component: OrderReception
  },

  {
    path: 'owner/restaurant-profile',
    component: RestaurantProfile
  },
  {
    path: 'owner/orders',
    component: OrderReception
  },

  {
    path: 'map',
    component: MapComponent,
    canActivate: [authGuard]
  },

  {
    path: 'forum',
    canActivate: [authGuard],
    loadComponent: () => import('./forum/forum.page').then((m) => m.ForumPage),
  },
  {
    path: 'forum/thread/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./forum/forum-thread.page').then((m) => m.ForumThreadPage),
  },
  {
    path: 'owner/forum-moderation',
    canActivate: [authGuard],
    loadComponent: () => import('./owner/forum-moderation.page').then((m) => m.OwnerForumModerationPage),
  },

  {
    path: 'customer/feedback',
    component: Feedback
  },

  {
    path: 'customer/tracking',
    component: Tracking
  },

  { path: '**', redirectTo: '/notfound' },
];
