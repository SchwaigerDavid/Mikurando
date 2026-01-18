import { Component, computed, inject, signal } from '@angular/core';

import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { DialogService } from '../ui/dialog.service';
import { NotifyService } from '../ui/notify.service';
import { LoadingOverlayService } from '../ui/loading-overlay.service';
import { AdminApiService, AdminUserDto } from '../services/admin-api.service';

@Component({
  standalone: true,
  imports: [NgIf, MatCardModule, MatTableModule, MatButtonModule, MatChipsModule],
  template: `
    <mat-card>
      <mat-card-title>User Moderation</mat-card-title>
      <mat-card-content>
        <p *ngIf="users().length === 0" style="opacity:.75; margin: 0 0 12px 0;">
          No users found.
        </p>

        <table *ngIf="users().length > 0" mat-table [dataSource]="users()" style="width:100%">
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
              <mat-chip [color]="u.is_active ? undefined : 'warn'">{{ u.is_active ? 'ACTIVE' : 'BANNED' }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let u" style="display:flex; gap:8px; flex-wrap: wrap;">
              <button mat-stroked-button disabled title="Warn is not implemented in the backend yet">Warn</button>

              <button mat-stroked-button color="warn" *ngIf="u.is_active" (click)="ban(u)">
                Ban
              </button>

              <button mat-stroked-button color="primary" *ngIf="!u.is_active" (click)="unban(u)">
                Unban
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
  private api = inject(AdminApiService);
  private dialogs = inject(DialogService);
  private notify = inject(NotifyService);
  private loading = inject(LoadingOverlayService);

  private usersState = signal<AdminUserDto[]>([]);
  users = computed(() => this.usersState());
  cols = ['email', 'role', 'status', 'actions'];

  constructor() {
    this.reload();
  }

  reload() {
    this.loading.show();
    this.api.listUsers().subscribe({
      next: (rows) => this.usersState.set(rows ?? []),
      error: () => this.notify.error('Failed to load users'),
      complete: () => this.loading.hide(),
    });
  }

  async ban(u: AdminUserDto) {
    const ok = await this.dialogs.confirm({
      title: 'Ban user',
      message: `Really ban user ${u.email}?`,
      confirmText: 'Ban',
    });
    if (!ok) return;

    this.loading.show();
    this.api.banUser(u.user_id, true).subscribe({
      next: () => {
        this.usersState.set(this.usersState().map((x) => (x.user_id === u.user_id ? { ...x, is_active: false } : x)));
        this.notify.success('User banned');
      },
      error: () => this.notify.error('Ban failed'),
      complete: () => this.loading.hide(),
    });
  }

  async unban(u: AdminUserDto) {
    const ok = await this.dialogs.confirm({
      title: 'Unban user',
      message: `Really unban user ${u.email}?`,
      confirmText: 'Unban',
    });
    if (!ok) return;

    this.loading.show();
    this.api.banUser(u.user_id, false).subscribe({
      next: () => {
        this.usersState.set(this.usersState().map((x) => (x.user_id === u.user_id ? { ...x, is_active: true } : x)));
        this.notify.success('User unbanned');
      },
      error: () => this.notify.error('Unban failed'),
      complete: () => this.loading.hide(),
    });
  }
}
