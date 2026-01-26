import { Component, computed, inject, signal } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { ForumApiService, OwnerModerationPostDto } from '../forum/forum-api.service';

@Component({
  standalone: true,
  imports: [NgIf, DatePipe, MatCardModule, MatButtonModule, MatTableModule],
  template: `
    <mat-card>
      <mat-card-title>Forum Moderation</mat-card-title>
      <mat-card-content>
        <button mat-stroked-button color="primary" (click)="load()">Reload</button>

        <p *ngIf="rows().length === 0" style="opacity:.75; margin: 12px 0 0 0;">No posts to moderate.</p>

        <table *ngIf="rows().length > 0" mat-table [dataSource]="rows()" style="width:100%; margin-top: 12px;">
          <ng-container matColumnDef="restaurant">
            <th mat-header-cell *matHeaderCellDef>Restaurant</th>
            <td mat-cell *matCellDef="let r">{{ r.restaurant_name }}</td>
          </ng-container>

          <ng-container matColumnDef="thread">
            <th mat-header-cell *matHeaderCellDef>Thread</th>
            <td mat-cell *matCellDef="let r">{{ r.thread_title }}</td>
          </ng-container>

          <ng-container matColumnDef="author">
            <th mat-header-cell *matHeaderCellDef>Author</th>
            <td mat-cell *matCellDef="let r">{{ r.author_name }} {{ r.author_surname }}</td>
          </ng-container>

          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let r">{{ r.created_at | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="content">
            <th mat-header-cell *matHeaderCellDef>Content</th>
            <td mat-cell *matCellDef="let r">{{ r.content }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r">
              <button mat-stroked-button color="warn" (click)="del(r)">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
})
export class OwnerForumModerationPage {
  private api = inject(ForumApiService);

  private rowsState = signal<OwnerModerationPostDto[]>([]);
  rows = computed(() => this.rowsState());

  cols = ['restaurant', 'thread', 'author', 'created', 'content', 'actions'];

  constructor() {
    this.load();
  }

  load() {
    this.api.listOwnerModerationPosts().subscribe({
      next: (rows) => this.rowsState.set(rows ?? []),
      error: () => this.rowsState.set([]),
    });
  }

  del(r: OwnerModerationPostDto) {
    this.api.deletePostAsOwner(r.post_id).subscribe({
      next: () => this.load(),
      error: () => this.load(),
    });
  }
}
