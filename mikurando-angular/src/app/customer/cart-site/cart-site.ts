import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-cart-site',
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './cart-site.html',
  styleUrl: './cart-site.scss',
})
export class CartSite {
  private cartService = inject(CartService);
  private router = inject(Router);
  
  items = computed(() => this.cartService.items());
  totalPrice = computed(() => this.cartService.totalPrice());
  itemCount = computed(() => this.cartService.itemCount());
  
  groupedByRestaurant = computed(() => {
    const items = this.items();
    const grouped = new Map<number, { restaurant_name: string, items: typeof items }>();
    
    items.forEach(item => {
      if (!grouped.has(item.restaurant_id)) {
        grouped.set(item.restaurant_id, {
          restaurant_name: item.restaurant_name,
          items: []
        });
      }
      grouped.get(item.restaurant_id)!.items.push(item);
    });
    
    return Array.from(grouped.values());
  });
  
  increment(dishId: number): void {
    this.cartService.incrementItem(dishId);
  }
  
  decrement(dishId: number): void {
    this.cartService.decrementItem(dishId);
  }
  
  removeItem(dishId: number): void {
    this.cartService.removeItem(dishId);
  }
  
  clearCart(): void {
    if (confirm('Möchten Sie wirklich den gesamten Warenkorb leeren?')) {
      this.cartService.clearCart();
    }
  }
  
  goBack(): void {
    this.router.navigate(['/restaurants']);
  }
  
  checkout(): void {
    this.router.navigate(['/checkout']);
  }
}
