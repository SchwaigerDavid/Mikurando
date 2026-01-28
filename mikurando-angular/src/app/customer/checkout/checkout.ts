import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  cartService = inject(CartService);
  
  deliveryForm: FormGroup;
  
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
    
    // Speichere Lieferdaten im localStorage nur im Browser
    if (isPlatformBrowser(this.platformId)) {
      const orderData = {
        delivery: this.deliveryForm.value,
        items: this.cartService.items(),
        total: this.cartService.totalPrice(),
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('currentOrder', JSON.stringify(orderData));
    }
    
    // Navigate to delivery tracking page
    this.router.navigate(['/delivery-tracking']);
  }
  
  cancelOrder() {
    this.router.navigate(['/cart']);
  }
}
