import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

import { SiteManagerMockService } from '../services/site-manager-mock.service';
import { DialogService } from '../ui/dialog.service';
import { NotifyService } from '../ui/notify.service';
import { LoadingOverlayService } from '../ui/loading-overlay.service';

@Component({
  standalone: true,
  imports: [CurrencyPipe, MatCardModule, MatChipsModule, MatTableModule, MatButtonModule],
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
        <table mat-table [dataSource]="pending()" style="width: 100%">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let r">{{ r.name }}</td>
          </ng-container>

          <ng-container matColumnDef="area">
            <th mat-header-cell *matHeaderCellDef>Area</th>
            <td mat-cell *matCellDef="let r"><mat-chip>{{ r.areaCode }}</mat-chip></td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let r" style="display:flex; gap:8px; flex-wrap: wrap;">
              <button mat-stroked-button color="primary" (click)="approve(r.id, r.name)">Approve</button>
              <button mat-stroked-button color="warn" (click)="reject(r.id, r.name)">Reject</button>
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
  private sm = inject(SiteManagerMockService);
  private dialogs = inject(DialogService);
  private notify = inject(NotifyService);
  private loading = inject(LoadingOverlayService);

  stats = computed(this.sm.getStats());
  pending = computed(this.sm.getPendingRestaurants());

  cols = ['name', 'area', 'actions'];

  async approve(id: number, name: string) {
    const ok = await this.dialogs.confirm({
      title: 'Approve restaurant',
      message: `Restaurant "${name}" freigeben?`,
      confirmText: 'Approve',
    });
    if (!ok) return;

    this.loading.show();
    try {
      this.sm.approveRestaurant(id);
      this.notify.success('Restaurant approved');
    } finally {
      this.loading.hide();
    }
  }

  async reject(id: number, name: string) {
    const ok = await this.dialogs.confirm({
      title: 'Reject restaurant',
      message: `Restaurant "${name}" ablehnen?`,
      confirmText: 'Reject',
    });
    if (!ok) return;

    this.loading.show();
    try {
      this.sm.rejectRestaurant(id);
      this.notify.error('Restaurant rejected');
    } finally {
      this.loading.hide();
    }
  }
}
