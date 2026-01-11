import { Component, computed, inject } from '@angular/core';

import { DatePipe, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { SiteManagerMockService } from '../services/site-manager-mock.service';
import { DialogService } from '../ui/dialog.service';
import { NotifyService } from '../ui/notify.service';
import { LoadingOverlayService } from '../ui/loading-overlay.service';

@Component({
  standalone: true,
  imports: [NgIf, DatePipe, MatCardModule, MatTableModule, MatButtonModule, MatChipsModule],
  template: `
    <mat-card>
      <mat-card-title>User Moderation</mat-card-title>
      <mat-card-content>
        <p>Mock-Userverwaltung: sperren/entsperren, warnen.</p>

        <table mat-table [dataSource]="users()" style="width:100%">
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let u">{{ u.email }}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let u">
              <mat-chip>{{ u.role }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let u">
              <mat-chip [color]="u.status === 'SUSPENDED' ? 'warn' : undefined">{{ u.status }}</mat-chip>
              <mat-chip>warnings: {{ u.warnings }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="last">
            <th mat-header-cell *matHeaderCellDef>Last action</th>
            <td mat-cell *matCellDef="let u">{{ u.lastActionAt | date: 'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let u" style="display:flex; gap:8px; flex-wrap: wrap;">
              <button mat-stroked-button (click)="warn(u.id)">Warn</button>

              <button
                mat-stroked-button
                color="warn"
                *ngIf="u.status !== 'SUSPENDED'"
                (click)="suspend(u.id, u.email)"
              >
                Suspend
              </button>

              <button
                mat-stroked-button
                color="primary"
                *ngIf="u.status === 'SUSPENDED'"
                (click)="unsuspend(u.id, u.email)"
              >
                Unsuspend
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
export class SmUsersPage {
  private sm = inject(SiteManagerMockService);
  private dialogs = inject(DialogService);
  private notify = inject(NotifyService);
  private loading = inject(LoadingOverlayService);

  users = computed(() => this.sm.getUsers()());
  cols = ['email', 'role', 'status', 'last', 'actions'];

  async suspend(id: number, email: string) {
    const ok = await this.dialogs.confirm({
      title: 'Suspend user',
      message: `User ${email} wirklich sperren?`,
      confirmText: 'Suspend',
    });
    if (!ok) return;

    this.loading.show();
    try {
      this.sm.suspendUser(id);
      this.notify.success('User gesperrt');
    } finally {
      this.loading.hide();
    }
  }

  async unsuspend(id: number, email: string) {
    const ok = await this.dialogs.confirm({
      title: 'Unsuspend user',
      message: `User ${email} wirklich entsperren?`,
      confirmText: 'Unsuspend',
    });
    if (!ok) return;

    this.loading.show();
    try {
      this.sm.unsuspendUser(id);
      this.notify.success('User entsperrt');
    } finally {
      this.loading.hide();
    }
  }

  warn(id: number) {
    this.sm.warnUser(id);
    this.notify.info('Warnung erfasst (mock)');
  }
}
