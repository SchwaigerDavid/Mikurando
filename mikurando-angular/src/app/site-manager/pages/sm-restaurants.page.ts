import { Component, computed, inject } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

import { SiteManagerMockService } from '../services/site-manager-mock.service';
import { DialogService } from '../ui/dialog.service';
import { NotifyService } from '../ui/notify.service';
import { LoadingOverlayService } from '../ui/loading-overlay.service';

@Component({
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatChipsModule, MatButtonModule],
  template: `
    <mat-card>
      <mat-card-title>Restaurant Moderation</mat-card-title>
      <mat-card-content>
        <table mat-table [dataSource]="restaurants()" style="width:100%">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let r">{{ r.name }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let r">{{ r.category }}</td>
          </ng-container>

          <ng-container matColumnDef="area">
            <th mat-header-cell *matHeaderCellDef>Area</th>
            <td mat-cell *matCellDef="let r"><mat-chip>{{ r.areaCode }}</mat-chip></td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let r">
              <mat-chip
                [color]="r.status === 'APPROVED' ? 'primary' : r.status === 'REJECTED' ? 'warn' : undefined"
              >
                {{ r.status.toLowerCase() }}
              </mat-chip>
              <mat-chip [color]="r.active ? 'primary' : undefined">{{ r.active ? 'active' : 'inactive' }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let r" style="display:flex; gap:8px; flex-wrap: wrap;">
              <button
                mat-stroked-button
                color="primary"
                (click)="approve(r.id, r.name)"
                [disabled]="r.status === 'APPROVED'"
              >
                Approve
              </button>
              <button
                mat-stroked-button
                color="warn"
                (click)="reject(r.id, r.name)"
                [disabled]="r.status === 'REJECTED'"
              >
                Reject
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
})
export class SmRestaurantsPage {
  private sm = inject(SiteManagerMockService);
  private dialogs = inject(DialogService);
  private notify = inject(NotifyService);
  private loading = inject(LoadingOverlayService);

  restaurants = computed(() => this.sm.getRestaurants()());
  cols = ['name', 'category', 'area', 'status', 'actions'];

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
