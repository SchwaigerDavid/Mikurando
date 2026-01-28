import { Component, inject, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MapComponent } from '../../components/map/map';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-delivery-tracking',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MapComponent
  ],
  templateUrl: './delivery-tracking.html',
  styleUrl: './delivery-tracking.scss',
})
export class DeliveryTracking {
  private router = inject(Router);
  private cartService = inject(CartService);
  
  currentStep = signal(0);
  estimatedTime = signal(30); // Minuten
  deliveryData = signal<any>(null);
  customerCoordinates = signal<{ lat: number; lng: number } | null>(null);
  
  deliverySteps = [
    { label: 'Bestellung eingegangen', icon: 'receipt', completed: true },
    { label: 'Restaurant bereitet vor', icon: 'restaurant', completed: true },
    { label: 'Fahrer unterwegs', icon: 'delivery_dining', completed: false },
    { label: 'Zugestellt', icon: 'check_circle', completed: false }
  ];
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  ngOnInit() {
    // Lade Bestelldaten aus localStorage nur im Browser
    if (isPlatformBrowser(this.platformId)) {
      const orderData = localStorage.getItem('currentOrder');
      if (orderData) {
        const parsedData = JSON.parse(orderData);
        this.deliveryData.set(parsedData);
        
        // Beispiel-Koordinaten für die Lieferadresse (in echter App würde man Geocoding nutzen)
        // Hier verwenden wir Beispielkoordinaten basierend auf der Lieferadresse
        this.customerCoordinates.set({
          lat: 48.2082, // Beispiel: Wien
          lng: 16.3738
        });
      }
    }
    
    // Simuliere Fortschritt
    this.simulateDelivery();
    
    // Clear cart after order
    this.cartService.clearCart();
  }
  
  simulateDelivery() {
    let step = 0;
    const interval = setInterval(() => {
      if (step < this.deliverySteps.length) {
        this.deliverySteps[step].completed = true;
        this.currentStep.set(step);
        this.estimatedTime.set(30 - (step * 10));
        step++;
      } else {
        clearInterval(interval);
      }
    }, 5000); // Alle 5 Sekunden ein Schritt
  }
  
  goToRestaurants() {
    // Lösche Bestelldaten aus localStorage nur im Browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentOrder');
    }
    this.router.navigate(['/restaurants']);
  }
}

