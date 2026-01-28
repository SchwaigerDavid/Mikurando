import { Component, ChangeDetectionStrategy, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantCardComponent } from '../restaurant-card/restaurant-card';
import { AuthService, Restaurant } from '../../shared/auth/auth.service';
import { signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-restaurant-list',
  imports: [
    CommonModule, 
    RestaurantCardComponent, 
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './restaurant-list.html',
  styleUrl: './restaurant-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestaurantList implements OnInit {
  private restaurantService = inject(AuthService);
  restaurants = signal<Restaurant[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Filter properties (normal properties for ngModel)
  filterName = '';
  filterCategory = '';
  filterAreaCode = '';
  filterMaxDistance: number | null = null;

  // Available categories
  categories = ['Italienisch', 'Asiatisch', 'Deutsch', 'Amerikanisch', 'Französisch', 'Sonstige'];

  private filterChange$ = new Subject<void>();

  constructor() {
    // Live updates with debounce
    this.filterChange$.pipe(debounceTime(300)).subscribe(() => {
      this.loadRestaurants();
    });
  }

  ngOnInit() {
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.isLoading.set(true);
    this.error.set(null);

    const filters = {
      name: this.filterName || undefined,
      category: this.filterCategory || undefined,
      area_code: this.filterAreaCode || undefined,
      maxDistance: this.filterMaxDistance || undefined,
    };

    this.restaurantService.getRestaurants(filters).subscribe({
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
  onFilterChange() {
    this.filterChange$.next();
  }

  resetFilters() {
    this.filterName = '';
    this.filterCategory = '';
    this.filterAreaCode = '';
    this.filterMaxDistance = null;
    this.loadRestaurants();
  }
}
