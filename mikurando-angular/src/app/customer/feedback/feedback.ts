import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

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
  restaurantId: string = '';
  rating: number | null = null;
  comment: string = '';

  ratings = [1, 2, 3, 4, 5];

  submitFeedback() {
    console.log({
      restaurantId: this.restaurantId,
      rating: this.rating,
      comment: this.comment
    });

    alert('Feedback gespeichert (lokal)');
  }
}
