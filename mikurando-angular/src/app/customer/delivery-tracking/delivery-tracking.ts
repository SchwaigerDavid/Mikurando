import { Component, inject, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MapComponent } from '../../components/map/map';
import { CartService } from '../../shared/services/cart.service';
import { HttpClient } from '@angular/common/http';

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
  private http = inject(HttpClient);
  
  currentStep = signal(0);
  estimatedTime = signal(30); // Minuten
  deliveryData = signal<any>(null);
  customerCoordinates = signal<{ lat: number; lng: number } | null>(null);
  hasActiveDelivery = signal(false);
  
  deliverySteps = [
    { label: 'Bestellung eingegangen', icon: 'receipt', completed: true },
    { label: 'Restaurant bereitet vor', icon: 'restaurant', completed: true },
    { label: 'Fahrer unterwegs', icon: 'delivery_dining', completed: false },
    { label: 'Zugestellt', icon: 'check_circle', completed: false }
  ];
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  async ngOnInit() {
    // Lade Bestelldaten aus localStorage nur im Browser
    if (isPlatformBrowser(this.platformId)) {
      const orderData = localStorage.getItem('currentOrder');
      if (orderData) {
        const parsedData = JSON.parse(orderData);
        this.deliveryData.set(parsedData);
        this.hasActiveDelivery.set(true);
        
        // Nutze die bereits geocodierten Koordinaten aus dem localStorage
        if (parsedData.geo_lat && parsedData.geo_lng) {
          this.customerCoordinates.set({
            lat: parsedData.geo_lat,
            lng: parsedData.geo_lng
          });
          console.log('Kundenkoordinaten aus localStorage:', this.customerCoordinates());
        } else {
          // Fallback: Geocodiere die Lieferadresse wenn Koordinaten fehlen
          await this.geocodeDeliveryAddress(parsedData.delivery);
        }
      }
    }
    
    // Simuliere Fortschritt
    this.simulateDelivery();
    
    // Clear cart after order
    this.cartService.clearCart();
  }
  
  private async geocodeDeliveryAddress(deliveryAddress: any) {
    try {
      // Nutze Nominatim (OpenStreetMap) für Geocoding
      const address = `${deliveryAddress.street}, ${deliveryAddress.postalCode} ${deliveryAddress.city}`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;
      
      const result: any[] = await this.http.get<any[]>(url).toPromise() || [];
      
      if (result.length > 0) {
        const location = result[0];
        this.customerCoordinates.set({
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lon)
        });
        console.log('Geocodierte Adresse:', this.customerCoordinates());
      } else {
        console.warn('Adresse konnte nicht geocodiert werden');
        // Fallback auf Standard-Koordinaten
        this.customerCoordinates.set({ lat: 48.2082, lng: 16.3738 });
      }
    } catch (error) {
      console.error('Fehler beim Geocoding:', error);
      // Fallback auf Standard-Koordinaten
      this.customerCoordinates.set({ lat: 48.2082, lng: 16.3738 });
    }
  }
  
  simulateDelivery() {
    let step = 0;
    const interval = setInterval(() => {
      if (step < this.deliverySteps.length) {
        this.deliverySteps[step].completed = true;
        this.currentStep.set(step);
        this.estimatedTime.set(30 - (step * 10));
        step++;
        
        // Wenn Zugestellt (letzter Schritt), leere localStorage
        if (step === this.deliverySteps.length) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('currentOrder');
          }
          this.hasActiveDelivery.set(false);
        }
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
    this.hasActiveDelivery.set(false);
    this.router.navigate(['/restaurants']);
  }
}

