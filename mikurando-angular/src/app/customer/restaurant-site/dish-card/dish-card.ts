import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../shared/services/cart.service';
import { Dish } from '../../../shared/auth/auth.service';

@Component({
  selector: 'app-dish-card',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './dish-card.html',
  styleUrl: './dish-card.scss',
})
export class DishCard {
  @Input() dishId: number = 0;
  @Input() dishName: string = '';
  @Input() description: string = '';
  @Input() category: string = '';
  @Input() price: number = 0;
  @Input() imageData: string | null | undefined = null;
  @Input() isAvailable: boolean = true;
  @Input() restaurantId: number = 0;
  @Input() restaurantName: string = '';

  private cartService = inject(CartService);
  
  ngOnInit() {
    console.log(`DishCard ${this.dishName}: isAvailable =`, this.isAvailable, typeof this.isAvailable);
  }
  
  quantity = computed(() => this.cartService.getItemQuantity(this.dishId));
  isInCart = computed(() => this.quantity() > 0);

  onAddToCart() {
    console.log('Add to Cart clicked!', {
      dishId: this.dishId,
      dishName: this.dishName,
      restaurantId: this.restaurantId,
      isAvailable: this.isAvailable
    });
    
    if (!this.dishId || this.dishId === 0) {
      console.error('Invalid dish ID!');
      return;
    }
    
    const dish: Dish = {
      dish_id: this.dishId,
      dish_name: this.dishName,
      description: this.description,
      price: this.price,
      image_data: this.imageData ?? undefined,
      is_available: this.isAvailable,
      category: this.category
    };
    
    console.log('Adding dish to cart:', dish);
    this.cartService.addItem(dish, this.restaurantId, this.restaurantName);
  }
  
  increment() {
    this.cartService.incrementItem(this.dishId);
  }
  
  decrement() {
    this.cartService.decrementItem(this.dishId);
  }
}
