import { Injectable, signal, computed } from '@angular/core';
import { Dish } from '../auth/auth.service';

export interface CartItem extends Dish {
  quantity: number;
  restaurant_id: number;
  restaurant_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'mikurando_cart';
  
  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());
  
  // Computed values
  items = computed(() => this.cartItems());
  itemCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
  totalPrice = computed(() => this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0));
  
  constructor() {}
  
  private loadCartFromStorage(): CartItem[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.CART_STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  
  private saveCartToStorage(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cartItems()));
  }
  
  addItem(dish: Dish, restaurantId: number, restaurantName: string): void {
    const current = this.cartItems();
    const existingIndex = current.findIndex(item => item.dish_id === dish.dish_id);
    
    if (existingIndex >= 0) {
      // Increment quantity
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1
      };
      this.cartItems.set(updated);
    } else {
      // Add new item
      const newItem: CartItem = {
        ...dish,
        quantity: 1,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName
      };
      this.cartItems.set([...current, newItem]);
    }
    
    this.saveCartToStorage();
  }
  
  incrementItem(dishId: number): void {
    const current = this.cartItems();
    const index = current.findIndex(item => item.dish_id === dishId);
    
    if (index >= 0) {
      const updated = [...current];
      updated[index] = {
        ...updated[index],
        quantity: updated[index].quantity + 1
      };
      this.cartItems.set(updated);
      this.saveCartToStorage();
    }
  }
  
  decrementItem(dishId: number): void {
    const current = this.cartItems();
    const index = current.findIndex(item => item.dish_id === dishId);
    
    if (index >= 0) {
      const updated = [...current];
      if (updated[index].quantity > 1) {
        updated[index] = {
          ...updated[index],
          quantity: updated[index].quantity - 1
        };
        this.cartItems.set(updated);
      } else {
        // Remove item if quantity reaches 0
        updated.splice(index, 1);
        this.cartItems.set(updated);
      }
      this.saveCartToStorage();
    }
  }
  
  removeItem(dishId: number): void {
    const current = this.cartItems();
    const filtered = current.filter(item => item.dish_id !== dishId);
    this.cartItems.set(filtered);
    this.saveCartToStorage();
  }
  
  getItemQuantity(dishId: number): number {
    const item = this.cartItems().find(item => item.dish_id === dishId);
    return item ? item.quantity : 0;
  }
  
  clearCart(): void {
    this.cartItems.set([]);
    this.saveCartToStorage();
  }
}
