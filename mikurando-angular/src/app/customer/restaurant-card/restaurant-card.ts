import {ChangeDetectionStrategy, Component, Input, inject, ChangeDetectorRef} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Restaurant } from '../../shared/auth/auth.service';

/**
 * @title Restaurant Card
 */
@Component({
  selector: 'app-restaurant-card',
  templateUrl: 'restaurant-card.html',
  styleUrl: 'restaurant-card.scss',
  imports: [MatCardModule, MatButtonModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestaurantCardComponent {
  @Input() set restaurant(data: any) {
    console.log('Restaurant-Daten im RestaurantCardComponent gesetzt:', data);
    if (data) {
      this._restaurant = data;
      // Robust image handling
      if (data.restaurant_image) {
        if (typeof data.restaurant_image === 'string') {
          // Already a string (base64)
          this.restaurantImage = data.restaurant_image;
        } else if (typeof data.restaurant_image === 'object' && (data.restaurant_image as any).data) {
          // Buffer format { data: number[] }
          this.restaurantImage = this.convertBufferToString((data.restaurant_image as any).data);
        } else {
          this.restaurantImage = './assets/Tobi.jpg';
        }
      } else {
        this.restaurantImage = './assets/Tobi.jpg';
      }
      // Update rating display
      this.ratingDisplay = this.getRatingValue(4.3);
      this.ratingStars = this.getRatingStars(4.3);
      this.cdr.markForCheck();
    }
  }
  get restaurant(): Restaurant {
    return this._restaurant;
  }

  private _restaurant!: Restaurant;
  restaurantImage: string = './assets/Tobi.jpg';
  ratingDisplay: string = '4.5';
  ratingStars: string = '⭐⭐⭐⭐';

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private convertBufferToString(bufferData: number[]): string {
    // Entfernt BOM falls vorhanden
    let startIndex = (bufferData[0] === 239) ? 3 : 0;
    let result = '';
    for (let i = startIndex; i < bufferData.length; i++) {
      result += String.fromCharCode(bufferData[i]);
    }
    // Entfernt eventuelle Anführungszeichen am Anfang/Ende
    return result.replace(/^"|"$/g, '');
  }

  getRatingStars(rating: number = 4.5): string {
    const roundedRating = Math.round(rating);
    let stars = '⭐'.repeat(roundedRating);
    return stars;
  }

  getRatingValue(rating: number = 4.5): string {
    return rating.toFixed(1);
  }

  navigateToRestaurant() {
    this.router.navigate(['/login']);
  }
}