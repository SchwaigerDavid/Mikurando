import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService, Review, Dish } from '../../shared/auth/auth.service';
import { DishCard } from './dish-card/dish-card';

@Component({
  selector: 'app-restaurant-site',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, DatePipe, DishCard],
  templateUrl: './restaurant-site.html',
  styleUrl: './restaurant-site.scss',
})
export class RestaurantSite implements OnInit {
  restaurant: any | null = null;
  reviews: Review[] = [];
  restaurantImage: string = './assets/Tobi.jpg';
  averageRating: number = 0;
  ratingStars: string = '';
  ratingDisplay: string = '0.0';
  reviewCount: number = 0;
  
  // Restaurant details
  restaurantName: string = '';
  restaurantCategory: string = '';
  restaurantDescription: string = '';
  restaurantAddress: string = '';
  restaurantPhone: string = '';
  restaurantEmail: string = '';
  restaurantOpeningTime: string = '';
  restaurantClosingTime: string = '';
  
  // Processed reviews for display
  processedReviews: any[] = [];
  
  // Dishes
  dishes: Dish[] = [];
  dishesByCategory: { [key: string]: Dish[] } = {};
  categoryNames: string[] = [];
  hasDishes: boolean = false;
  showScrollToTopButton: boolean = false;
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    // Check if restaurant data was passed through navigation (only in browser)
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state || (this.isBrowser ? (history.state as any) : null);
    
    if (state?.restaurantData && id) {
      // Use passed data
      this.setRestaurantData(state.restaurantData, state.restaurantImage);
      
      // Still load reviews
      this.loadReviews(parseInt(id, 10));
    } else if (id) {
      // Load from API if no data was passed
      this.loadRestaurant(parseInt(id, 10));
      this.loadReviews(parseInt(id, 10));
    }
  }

  private setRestaurantData(restaurantData: any, imageData?: string): void {
    this.restaurant = restaurantData;

    // Process all restaurant data
    this.restaurantName = restaurantData.restaurant_name || '';
    this.restaurantCategory = restaurantData.category || '';
    this.restaurantDescription = restaurantData.description || '';
    this.restaurantPhone = restaurantData.phone_number || '';
    this.restaurantEmail = restaurantData.email || '';
    this.restaurantOpeningTime = restaurantData.opening_time || '';
    this.restaurantClosingTime = restaurantData.closing_time || '';
    
    // Build address
    const street = restaurantData.street || '';
    const areaCode = restaurantData.area_code || '';
    const city = restaurantData.city || '';
    this.restaurantAddress = `${street}, ${areaCode} ${city}`;
    
    // Use passed image if available, otherwise use default
    if (imageData) {
      this.restaurantImage = imageData;
    }
    
    // Extract dishes from menu_categories
    this.loadRestaurant(restaurantData.restaurant_id);
    //this.extractDishesfromMenuCategories(restaurantData.menu_categories);
  }

  private loadRestaurant(id: number): void {
    this.authService.getRestaurantById(id).subscribe({
      next: (response: any) => {
        // Handle response.data or direct response
        const restaurantData = response.data || response;
        
        if (restaurantData) {
          this.restaurant = restaurantData;
          
          // Process all restaurant data
          this.restaurantName = restaurantData.restaurant_name || '';
          this.restaurantCategory = restaurantData.category || '';
          this.restaurantDescription = restaurantData.description || '';
          this.restaurantPhone = restaurantData.phone_number || '';
          this.restaurantEmail = restaurantData.email || '';
          this.restaurantOpeningTime = restaurantData.opening_time || '';
          this.restaurantClosingTime = restaurantData.closing_time || '';
          
          // Build address
          const street = restaurantData.street || '';
          const areaCode = restaurantData.area_code || '';
          const city = restaurantData.city || '';
          this.restaurantAddress = `${street}, ${areaCode} ${city}`;
          
          // Handle image - only update if valid, otherwise keep existing
          if (restaurantData.image_data) {
            let newImage: string | null = null;
            
            if (typeof restaurantData.image_data === 'string') {
              // Check if it's already a proper data URL
              if (restaurantData.image_data.startsWith('data:image')) {
                newImage = restaurantData.image_data;
              } else if (!restaurantData.image_data.startsWith('\\x')) {
                // It's a base64 string, add the data URL prefix
                newImage = `data:image/jpeg;base64,${restaurantData.image_data}`;
              }
            } else if (typeof restaurantData.image_data === 'object' && (restaurantData.image_data as any).data) {
              // Buffer format - convert to proper base64
              const bufferData = (restaurantData.image_data as any).data;
              const base64 = this.bufferToBase64(bufferData);
              if (base64) {
                newImage = `data:image/jpeg;base64,${base64}`;
              }
            }
            
            // Only update if we got a valid image, otherwise keep the existing one
            if (newImage) {
              this.restaurantImage = newImage;
            }
          }
          
          // Extract dishes from menu_categories
  
          this.extractDishesfromMenuCategories(restaurantData.menu_categories);
        }
      },
      error: (err) => {
        this.router.navigate(['/restaurants']);
      }
    });
  }

  private loadReviews(restaurantId: number): void {
    this.authService.getRestaurantReviews(restaurantId).subscribe({
      next: (response: any) => {
        // Handle response.data or direct response
        const reviewsData = response.data || response;
        
        // Ensure it's an array
        this.reviews = Array.isArray(reviewsData) ? reviewsData : [];
        this.reviewCount = this.reviews.length;
        
        if (this.reviews.length > 0) {
          this.averageRating = this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;
          this.ratingStars = this.getRatingStars(this.averageRating);
          this.ratingDisplay = this.averageRating.toFixed(1);
        } else {
          // No reviews = no rating
          this.averageRating = 0;
          this.ratingStars = '';
          this.ratingDisplay = 'Keine Bewertungen';
        }
        
        // Process reviews for display
        this.processedReviews = this.reviews.map(review => ({
          stars: '⭐'.repeat(Math.round(review.rating)),
          date: review.created_at,
          comment: review.comment
        }));
      },
      error: (err) => {
        this.averageRating = 0;
        this.ratingStars = '';
        this.ratingDisplay = 'Keine Bewertungen';
        this.reviewCount = 0;
        this.processedReviews = [];
      }
    });
  }

  private convertBufferToString(bufferData: number[]): string {
    let startIndex = (bufferData[0] === 239) ? 3 : 0;
    let result = '';
    for (let i = startIndex; i < bufferData.length; i++) {
      result += String.fromCharCode(bufferData[i]);
    }
    return result.replace(/^"|"$/g, '');
  }

  private bufferToBase64(bufferData: number[]): string {
    try {
      // Convert buffer array to string
      let binary = '';
      for (let i = 0; i < bufferData.length; i++) {
        binary += String.fromCharCode(bufferData[i]);
      }
      // Convert to base64
      return btoa(binary);
    } catch (error) {
      return '';
    }
  }

  private getRatingStars(rating: number): string {
    const roundedRating = Math.round(rating);
    return '⭐'.repeat(roundedRating);
  }

  private extractDishesfromMenuCategories(menuCategories: any[]): void {
    if (!Array.isArray(menuCategories) || menuCategories.length === 0) {
      this.dishes = [];
      this.dishesByCategory = {};
      this.categoryNames = [];
      this.hasDishes = false;
      return;
    }
    
    // Flatten all dishes from all categories
    this.dishes = [];
    this.dishesByCategory = {};
    this.categoryNames = [];
    
    menuCategories.forEach((category) => {
      if (Array.isArray(category.dishes)) {
        const categoryName = category.category_name;
        this.categoryNames.push(categoryName);
        category.dishes.forEach((dish: any) => {
          const dishObj: Dish = {
            dish_id: dish.dish_id,
            dish_name: dish.name,
            description: dish.description,
            price: dish.price,
            image_data: dish.image_data,
            is_available: dish.avaliable,
            category: categoryName,
            category_id: dish.category_id
          };
          
          this.dishes.push(dishObj);
          
          // Group by category
          if (!this.dishesByCategory[categoryName]) {
            this.dishesByCategory[categoryName] = [];
          }
          this.dishesByCategory[categoryName].push(dishObj);
        });
      }
    });
    
    this.hasDishes = this.dishes.length > 0;
    
    // Trigger change detection so the template updates
    this.cdr.markForCheck();
  }

  goBack(): void {
    this.router.navigate(['/restaurants']);
  }

  scrollToCategory(categoryName: string): void {
    const element = document.getElementById(`category-${this.sanitizeCategoryName(categoryName)}`);
    if (element && this.isBrowser) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  sanitizeCategoryName(categoryName: string): string {
    return categoryName.toLowerCase().replace(/\s+/g, '-');
  }

  scrollToTop(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.isBrowser) {
      this.showScrollToTopButton = window.scrollY > 300;
    }
  }
}

