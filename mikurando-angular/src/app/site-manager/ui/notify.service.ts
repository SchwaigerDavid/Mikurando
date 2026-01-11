import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotifyService {
  constructor(private snackBar: MatSnackBar) {}

  info(message: string) {
    this.snackBar.open(message, 'OK', { duration: 2500 });
  }

  success(message: string) {
    this.snackBar.open(message, 'OK', { duration: 2500, panelClass: ['snack-success'] });
  }

  error(message: string) {
    this.snackBar.open(message, 'OK', { duration: 4000, panelClass: ['snack-error'] });
  }
}
