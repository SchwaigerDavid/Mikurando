import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantCardComponent } from '../restaurant-card/restaurant-card';
import { AuthService, Restaurant } from '../../shared/auth/auth.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-restaurant-list',
  imports: [CommonModule, RestaurantCardComponent],
  templateUrl: './restaurant-list.html',
  styleUrl: './restaurant-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestaurantList implements OnInit {
  private restaurantService = inject(AuthService);
  restaurants = signal<Restaurant[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.isLoading.set(true);
    this.error.set(null);

    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        console.log('Restaurants geladen:', data);
        this.restaurants.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Restaurants:', err);
        this.isLoading.set(false);
      }
    });
  }
}
