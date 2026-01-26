import { Component, computed, inject, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';

import { ForumApiService, ForumThreadDto } from './forum-api.service';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, MatCardModule, MatButtonModule, MatInputModule, MatTableModule],
  template: `
    <mat-card>
      <mat-card-title>Forum</mat-card-title>
      <mat-card-content>
        <div style="display:flex; gap:12px; flex-wrap: wrap; align-items: end;">
          <div style="flex: 1; min-width: 220px;">
            <label style="display:block; font-size: 12px; opacity: .8; margin-bottom: 6px;">Restaurant ID</label>
            <input
              matInput
              type="number"
              [value]="restaurantId()"
              (input)="onRestaurantIdInput($any($event.target).value)"
            />
          </div>

          <button mat-raised-button color="primary" (click)="load()">Load threads</button>
        </div>

        <div style="margin-top: 16px; display:flex; gap:12px; flex-wrap: wrap; align-items: end;">
          <div style="flex: 1; min-width: 220px;">
            <label style="display:block; font-size: 12px; opacity: .8; margin-bottom: 6px;">New thread title</label>
            <input matInput [value]="newTitle()" (input)="newTitle.set($any($event.target).value)" />
          </div>
          <button mat-stroked-button color="primary" (click)="create()" [disabled]="!canCreate()">
            Create
          </button>
        </div>

        <p *ngIf="errorMsg()" style="margin: 12px 0 0 0; color: #b00020;">{{ errorMsg() }}</p>

        <p *ngIf="threads().length === 0" style="opacity:.75; margin: 16px 0 0 0;">No threads loaded.</p>

        <table *ngIf="threads().length > 0" mat-table [dataSource]="threads()" style="width: 100%; margin-top: 12px;">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Title</th>
            <td mat-cell *matCellDef="let t">{{ t.title }}</td>
          </ng-container>

          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let t">{{ t.created_at | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let t">
              <button mat-stroked-button (click)="open(t)">Open</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
})
export class ForumPage {
  private api = inject(ForumApiService);
  private router = inject(Router);

  restaurantId = signal<number>(1);
  newTitle = signal('');
  isCreating = signal(false);
  errorMsg = signal<string>('');

  private threadsState = signal<ForumThreadDto[]>([]);
  threads = computed(() => this.threadsState());

  cols = ['title', 'created', 'actions'];

  onRestaurantIdInput(v: string) {
    const n = parseInt(v, 10);
    this.restaurantId.set(Number.isFinite(n) && n > 0 ? n : 1);
  }

  canCreate() {
    return !this.isCreating() && this.newTitle().trim().length >= 5;
  }

  load() {
    this.api.listThreadsForRestaurant(this.restaurantId()).subscribe({
      next: (rows) => this.threadsState.set(rows ?? []),
      error: () => this.threadsState.set([]),
    });
  }

  create() {
    const title = this.newTitle().trim();
    if (title.length < 5) return;

    this.errorMsg.set('');
    this.isCreating.set(true);

    this.api.createThread(this.restaurantId(), title).subscribe({
      next: () => {
        this.newTitle.set('');
        this.load();
      },
      error: (err) => {
        this.errorMsg.set(`Create failed (${err?.status ?? 'unknown'})`);
      },
      complete: () => this.isCreating.set(false),
    });
  }

  open(t: ForumThreadDto) {
    this.router.navigate(['/forum/thread', t.thread_id]);
  }
}
