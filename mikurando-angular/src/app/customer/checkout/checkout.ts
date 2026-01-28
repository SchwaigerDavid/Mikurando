import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  cartService = inject(CartService);
  
  deliveryForm: FormGroup;
  isProcessing = false;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.deliveryForm = this.fb.group({
      name: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  processOrder() {
    if (this.deliveryForm.invalid) {
      alert('Bitte füllen Sie alle Lieferadressfelder aus.');
      return;
    }
    
    this.isProcessing = true;
    
    // Geocodiere die Lieferadresse um geo_lat und geo_lng zu bekommen
    this.geocodeAddress(this.deliveryForm.value).then(coordinates => {
      const orderData = {
        delivery: this.deliveryForm.value,
        items: this.cartService.items(),
        total: this.cartService.totalPrice(),
        timestamp: new Date().toISOString(),
        geo_lat: coordinates.lat,
        geo_lng: coordinates.lng
      };
      
      // Speichere im localStorage mit Koordinaten
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('currentOrder', JSON.stringify(orderData));
      }
      // Erstelle die Order-Payload für das Backend
      const cartItems = this.cartService.items();
      const restaurantId = cartItems.length > 0 ? cartItems[0].restaurant_id : 0;
      
      const deliveryAddressString = `${this.deliveryForm.value.street}, ${this.deliveryForm.value.postalCode} ${this.deliveryForm.value.city}`;
      
      const orderPayload = {
        restaurant_id: restaurantId,
        items: cartItems.map(item => ({
          dish_id: item.dish_id,
          quantity: item.quantity
        })),
        voucher_code: '',
        delivery_address: deliveryAddressString,
        geo_lat: coordinates.lat,
        geo_lng: coordinates.lng
      };
      
      console.log('Order Payload:', orderPayload);
      
      // Sende Order ans Backend
      this.http.post('http://localhost:3000/orders', orderPayload).subscribe({
        next: (response: any) => {
          console.log('Order erfolgreich platziert:', response);
          this.isProcessing = false;
          this.router.navigate(['/delivery-tracking']);
        },
        error: (error) => {
          console.error('Fehler beim Platzieren der Order:', error);
          this.isProcessing = false;
          alert('Fehler beim Platzieren der Bestellung. Bitte versuchen Sie es später erneut.');
        }
      });
    }).catch(error => {
      console.error('Fehler beim Geocodieren:', error);
      this.isProcessing = false;
      alert('Fehler beim Verarbeiten der Adresse. Bitte versuchen Sie es später erneut.');
    });
  }
  
  private geocodeAddress(address: any): Promise<{ lat: number; lng: number }> {
    const addressString = `${address.street}, ${address.postalCode} ${address.city}`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressString)}&format=json&addressdetails=1&limit=1`;
    
    console.log('Geocodiere Adresse:', addressString);
    console.log('Nominatim URL:', url);
    
    return this.http.get<any[]>(url).toPromise().then(result => {
      console.log('Nominatim Response:', result);
      
      if (result && result.length > 0) {
        const location = result[0];
        console.log('Gefundene Koordinaten:', { lat: location.lat, lng: location.lon });
        return {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lon)
        };
      } else {
        console.warn('Keine Ergebnisse gefunden. Verwende Fallback-Koordinaten.');
        // Fallback auf Wien-Koordinaten wenn Geocoding fehlschlägt
        return {
          lat: 48.2082,
          lng: 16.3738
        };
      }
    }).catch(error => {
      console.error('Nominatim Fehler:', error);
      console.warn('Verwende Fallback-Koordinaten wegen Fehler');
      // Fallback bei Netzwerkfehler
      return {
        lat: 48.2082,
        lng: 16.3738
      };
    });
  }
  
  cancelOrder() {
    this.router.navigate(['/cart']);
  }
}
