import { Component, computed, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LoadingOverlayService } from './loading-overlay.service';

@Component({
  selector: 'sm-loading-overlay',
  standalone: true,
  imports: [NgIf, MatProgressSpinnerModule],
  template: `
    <div class="overlay" *ngIf="isLoading()">
      <mat-spinner diameter="48"></mat-spinner>
    </div>
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(255, 255, 255, 0.6);
        display: grid;
        place-items: center;
        z-index: 9999;
        backdrop-filter: blur(2px);
      }
    `,
  ],
})
export class SmLoadingOverlayComponent {
  private overlay = inject(LoadingOverlayService);
  isLoading = computed(() => this.overlay.loading());
}
