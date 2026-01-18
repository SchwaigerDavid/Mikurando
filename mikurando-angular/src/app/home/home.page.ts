import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule],
  template: `
    <div class="wrap">
      <mat-card>
        <mat-card-title>Mikurando</mat-card-title>
        <mat-card-content>
          <p>Mainmenu: choose a module.</p>
          <div class="actions">
            <a mat-flat-button color="primary" routerLink="/admin">To Admin</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .wrap {
        padding: 24px;
        display: grid;
        place-items: start center;
      }
      mat-card {
        width: min(900px, 100%);
      }
      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 12px;
      }
    `,
  ],
})
export class HomePage {}
