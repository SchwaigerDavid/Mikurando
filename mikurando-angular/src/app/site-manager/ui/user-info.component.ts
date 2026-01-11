import { Component, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'sm-user-info',
  standalone: true,
  imports: [MatChipsModule, MatIconModule],
  template: `
    <mat-chip>
      <mat-icon style="margin-right: 6px;">person</mat-icon>
      {{ name }}
    </mat-chip>
    <mat-chip>{{ role }}</mat-chip>
  `,
})
export class UserInfoComponent {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) role!: string;
}
