import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../shared/auth/auth.service';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.scss']
})
export class Feedback {
  restaurantId: number | null = null;
  rating: number | null = null;
  comment: string = '';
  dishId: number | null = null;

  ratings = [1, 2, 3, 4, 5];

  constructor(private authService: AuthService) {}

  submitFeedback() {
    if (!this.restaurantId || !this.rating) {
      alert('Bitte Restaurant und Bewertung auswählen.');
      return;
    }

    const userId = 8;
    const dish_id = this.dishId ?? null;

    this.authService.submitReview(
      this.restaurantId,
      this.rating,
      this.comment,
      dish_id, // dish_id, Standardwert 0
      userId
    );

    // Optional: Formular zurücksetzen
    this.restaurantId = null;
    this.rating = null;
    this.comment = '';
    this.dishId = null;
  }
}
