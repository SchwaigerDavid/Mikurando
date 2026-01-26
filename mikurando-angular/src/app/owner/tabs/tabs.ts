import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { DashboardOwner } from '../dashboard/dashboard';
import { AuthService } from '../../shared/auth/auth.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, MatTabsModule, DashboardOwner],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class Tabs implements OnInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  // Initialisierung als leeres Array, um Fehler vor dem Laden zu vermeiden
  public restaurants: any[] = [];
  public isLoading: boolean = true;

  ngOnInit(): void {
    this.loadRestaurantData();
  }

  private loadRestaurantData(): void {
    this.authService.getOwnerRestaurant().subscribe({
      next: (response) => {
        if (response && response.data) {
          // Die Daten werden zugewiesen
          this.restaurants = response.data;
          this.isLoading = false;

          // Wir erzwingen eine Prüfung, da die Daten asynchron kommen
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Fehler beim Laden der Restaurants, Lieutenant:', err);
        console.log(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
