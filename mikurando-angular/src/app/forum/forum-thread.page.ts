import { Component, computed, inject, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { ForumApiService, ForumPostDto } from './forum-api.service';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, MatCardModule, MatButtonModule, MatInputModule],
  template: `
    <mat-card>
      <mat-card-title>Thread</mat-card-title>
      <mat-card-content>
        <p *ngIf="posts().length === 0" style="opacity:.75; margin: 0 0 12px 0;">No posts yet.</p>

        <div *ngIf="posts().length > 0" style="display:flex; flex-direction: column; gap: 12px;">
          <div
            *ngFor="let p of posts()"
            style="padding: 12px; border: 1px solid rgba(0,0,0,.12); border-radius: 8px;"
          >
            <div style="display:flex; justify-content: space-between; gap: 12px;">
              <div style="font-weight: 600;">{{ p.author_name }} {{ p.author_surname }}</div>
              <div style="opacity:.7; font-size: 12px;">{{ p.created_at | date:'short' }}</div>
            </div>
            <div style="margin-top: 8px; white-space: pre-wrap;">{{ p.content }}</div>
          </div>
        </div>

        <div style="margin-top: 16px; display:flex; gap: 12px; flex-wrap: wrap; align-items: end;">
          <div style="flex: 1; min-width: 220px;">
            <label style="display:block; font-size: 12px; opacity: .8; margin-bottom: 6px;">Reply</label>
            <textarea matInput rows="3" [value]="reply()" (input)="reply.set($any($event.target).value)"></textarea>
          </div>
          <button mat-raised-button color="primary" (click)="send()" [disabled]="reply().trim().length === 0">
            Send
          </button>
        </div>

        <p *ngIf="errorMsg()" style="margin-top: 12px; color: #b00020;">{{ errorMsg() }}</p>
      </mat-card-content>
    </mat-card>
  `,
})
export class ForumThreadPage {
  private api = inject(ForumApiService);
  private route = inject(ActivatedRoute);

  threadId = signal<number>(0);
  reply = signal('');
  errorMsg = signal<string>('');

  private postsState = signal<ForumPostDto[]>([]);
  posts = computed(() => this.postsState());

  constructor() {
    const id = parseInt(this.route.snapshot.paramMap.get('id') ?? '0', 10);
    this.threadId.set(id);
    this.load();
  }

  load() {
    this.api.listPostsForThread(this.threadId()).subscribe({
      next: (rows) => this.postsState.set(rows ?? []),
      error: () => this.postsState.set([]),
    });
  }

  send() {
    const content = this.reply().trim();
    if (!content) return;

    this.errorMsg.set('');
    this.api.createPost(this.threadId(), content).subscribe({
      next: () => {
        this.reply.set('');
        this.load();
      },
      error: (err) => {
        if (err?.status === 409) {
          this.errorMsg.set('Thread is closed');
        } else {
          this.errorMsg.set('restricted');
        }
      },
    });
  }
}
