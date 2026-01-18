import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { SmLoadingOverlayComponent } from './sm-loading-overlay.component';
import { UserInfoComponent } from './user-info.component';
import { AuthService } from '../../shared/auth/auth.service';

@Component({
  selector: 'sm-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    SmLoadingOverlayComponent,
    UserInfoComponent,
  ],
  template: `
    <sm-loading-overlay />

    <mat-sidenav-container class="sm-container">
      <mat-sidenav mode="side" opened class="sm-sidenav">
        <div class="sm-brand">Admin</div>
        <mat-nav-list>
          <a mat-list-item routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/admin/restaurants" routerLinkActive="active">
            <mat-icon matListItemIcon>storefront</mat-icon>
            <span matListItemTitle>Restaurant Moderation</span>
          </a>
          <a mat-list-item routerLink="/admin/settings" routerLinkActive="active">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Global Settings</span>
          </a>
          <a mat-list-item routerLink="/admin/vouchers" routerLinkActive="active">
            <mat-icon matListItemIcon>sell</mat-icon>
            <span matListItemTitle>Vouchers</span>
          </a>
          <a mat-list-item routerLink="/admin/reports" routerLinkActive="active">
            <mat-icon matListItemIcon>analytics</mat-icon>
            <span matListItemTitle>Reporting</span>
          </a>
          <a mat-list-item routerLink="/admin/users" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>User Moderation</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="sm-toolbar">
          <span>Mikurando</span>
          <span class="spacer"></span>
          <sm-user-info name="admin" role="SITE_MANAGER" />
          <button mat-button type="button" (click)="logout()">Logout</button>
        </mat-toolbar>

        <div class="sm-content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sm-container {
        height: calc(100vh - 0px);
      }
      .sm-sidenav {
        width: 260px;
      }
      .sm-brand {
        padding: 16px;
        font-weight: 700;
        letter-spacing: 0.3px;
      }
      .sm-toolbar {
        position: sticky;
        top: 0;
        z-index: 2;
        gap: 12px;
      }
      .spacer {
        flex: 1 1 auto;
      }
      .sm-content {
        padding: 16px;
        max-width: 1200px;
      }
      a.active {
        background: color-mix(in srgb, var(--mat-sys-primary) 12%, transparent);
      }
      @media (max-width: 900px) {
        .sm-sidenav {
          width: 220px;
        }
      }
    `,
  ],
})
export class SmShellComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
