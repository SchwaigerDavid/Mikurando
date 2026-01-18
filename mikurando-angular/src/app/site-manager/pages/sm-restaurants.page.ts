import { Component, computed, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

import { DialogService } from '../ui/dialog.service';
import { NotifyService } from '../ui/notify.service';
import { LoadingOverlayService } from '../ui/loading-overlay.service';
import { AdminApiService, AdminPendingRestaurantDto } from '../services/admin-api.service';

@Component({
  standalone: true,
  imports: [NgIf, MatCardModule, MatTableModule, MatChipsModule, MatButtonModule],
  template: `
    <mat-card>
      <mat-card-title>Restaurant Moderation</mat-card-title>
      <mat-card-content>
        <p *ngIf="restaurants().length === 0" style="opacity:.75; margin: 0 0 12px 0;">
          No Restaurants available.
        </p>

        <table *ngIf="restaurants().length > 0" mat-table [dataSource]="restaurants()" style="width:100%">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let r">{{ r.restaurant_name }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let r">{{ r.category }}</td>
          </ng-container>

          <ng-container matColumnDef="area">
            <th mat-header-cell *matHeaderCellDef>Area</th>
            <td mat-cell *matCellDef="let r"><mat-chip>{{ r.area_code }}</mat-chip></td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let r">
              <mat-chip *ngIf="!r.approved">pending</mat-chip>
              <mat-chip *ngIf="r.approved && r.is_active">approved</mat-chip>
              <mat-chip *ngIf="r.approved && !r.is_active">inactive</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let r" style="display:flex; gap:8px; flex-wrap: wrap;">
              <button mat-stroked-button color="primary" (click)="setApproved(r, true)" [disabled]="r.approved">Approve</button>
              <button mat-stroked-button color="warn" (click)="setApproved(r, false)" [disabled]="!r.approved">Set pending</button>
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
  private api = inject(AdminApiService);
  private dialogs = inject(DialogService);
  private notify = inject(NotifyService);
  private loading = inject(LoadingOverlayService);

  private restaurantsState = signal<AdminPendingRestaurantDto[]>([]);
  restaurants = computed(() => this.restaurantsState());
  cols = ['name', 'category', 'area', 'status', 'actions'];

  constructor() {
    this.reload();
  }

  reload() {
    this.loading.show();
    this.api.getRestaurants().subscribe({
      next: (rows) => this.restaurantsState.set(rows ?? []),
      error: () => this.notify.error('Restaurants could not be loaded.'),
      complete: () => this.loading.hide(),
    });
  }

  async setApproved(r: AdminPendingRestaurantDto, approved: boolean) {
    const ok = await this.dialogs.confirm({
      title: approved ? 'Approve restaurant' : 'Set restaurant pending',
      message: approved
        ? 'Restaurant "${r.restaurant_name}" approved?'
        : 'Restaurant "${r.restaurant_name}" set to "pending" again?',
      confirmText: approved ? 'Approve' : 'Set pending',
    });
    if (!ok) return;

    this.loading.show();
    this.api.approveRestaurant(r.restaurant_id, approved).subscribe({
      next: () => {
        this.notify.success(approved ? 'Restaurant approved' : 'Restaurant set to pending');
        //update ui locally
        this.restaurantsState.set(
          this.restaurantsState().map((x) =>
            x.restaurant_id === r.restaurant_id
              ? { ...x, approved, is_active: approved ? true : false }
              : x,
          ),
        );
      },
      error: () => this.notify.error('Action failed'),
      complete: () => this.loading.hide(),
    });
  }
}
