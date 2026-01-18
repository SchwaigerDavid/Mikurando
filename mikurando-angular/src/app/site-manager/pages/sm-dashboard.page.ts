import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, NgIf } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

import { DialogService } from '../ui/dialog.service';
import { NotifyService } from '../ui/notify.service';
import { LoadingOverlayService } from '../ui/loading-overlay.service';
import { AdminApiService, AdminPendingRestaurantDto } from '../services/admin-api.service';

@Component({
  standalone: true,
  imports: [NgIf, CurrencyPipe, MatCardModule, MatChipsModule, MatTableModule, MatButtonModule],
  template: `
    <div class="grid">
      <mat-card>
        <mat-card-title>Total Orders</mat-card-title>
        <mat-card-content class="metric">{{ stats().totalOrders }}</mat-card-content>
      </mat-card>
      <mat-card>
        <mat-card-title>Revenue</mat-card-title>
        <mat-card-content class="metric">{{ stats().revenue | currency : 'EUR' }}</mat-card-content>
      </mat-card>
      <mat-card>
        <mat-card-title>Active Restaurants</mat-card-title>
        <mat-card-content class="metric">{{ stats().activeRestaurants }}</mat-card-content>
      </mat-card>
      <mat-card>
        <mat-card-title>User Activity</mat-card-title>
        <mat-card-content class="metric">{{ stats().userActivity }}</mat-card-content>
      </mat-card>
    </div>

    <mat-card style="margin-top: 16px;">
      <mat-card-title>Pending Restaurant Applications</mat-card-title>
      <mat-card-content>
        <p *ngIf="pending().length === 0" style="opacity:.75; margin: 0 0 12px 0;">
          No pending restaurant applications.
        </p>

        <table *ngIf="pending().length > 0" mat-table [dataSource]="pending()" style="width: 100%">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let r">{{ r.restaurant_name }}</td>
          </ng-container>

          <ng-container matColumnDef="area">
            <th mat-header-cell *matHeaderCellDef>Area</th>
            <td mat-cell *matCellDef="let r"><mat-chip>{{ r.area_code }}</mat-chip></td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let r" style="display:flex; gap:8px; flex-wrap: wrap;">
              <button mat-stroked-button color="primary" (click)="approve(r)">Approve</button>
              <button mat-stroked-button color="warn" disabled title="Reject is not implemented in the backend yet">Reject</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }
      .metric {
        font-size: 28px;
        font-weight: 700;
        padding: 12px 0;
      }
      @media (max-width: 1000px) {
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 600px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SmDashboardPage {
  private api = inject(AdminApiService);
  private dialogs = inject(DialogService);
  private notify = inject(NotifyService);
  private loading = inject(LoadingOverlayService);

  private dashboard = signal({
    total_orders: 0,
    revenue: 0,
    active_restaurants: 0,
    user_activity: 0,
    pending_restaurants: 0,
  });
  private pendingState = signal<AdminPendingRestaurantDto[]>([]);

  stats = computed(() => ({
    totalOrders: this.dashboard().total_orders,
    revenue: Number(this.dashboard().revenue ?? 0),
    activeRestaurants: this.dashboard().active_restaurants,
    userActivity: this.dashboard().user_activity,
  }));

  pending = computed(() => this.pendingState());
  cols = ['name', 'area', 'actions'];

  constructor() {
    this.reload();
  }

  reload() {
    this.loading.show();
    this.api.getDashboard().subscribe({
      next: (d) => this.dashboard.set(d),
      error: () => this.notify.error('Failed to load dashboard'),
    });

    this.api.getPendingRestaurants().subscribe({
      next: (rows) => this.pendingState.set(rows ?? []),
      error: () => this.notify.error('Failed to load pending restaurants'),
      complete: () => this.loading.hide(),
    });
  }

  async approve(r: AdminPendingRestaurantDto) {
    const ok = await this.dialogs.confirm({
      title: 'Approve restaurant',
      message: `Approve restaurant "${r.restaurant_name}"?`,
      confirmText: 'Approve',
    });
    if (!ok) return;

    this.loading.show();
    this.api.approveRestaurant(r.restaurant_id, true).subscribe({
      next: () => {
        this.notify.success('Restaurant approved');
        this.pendingState.set(this.pendingState().filter((x) => x.restaurant_id !== r.restaurant_id));
      },
      error: () => this.notify.error('Approval failed'),
      complete: () => this.loading.hide(),
    });
  }
}
