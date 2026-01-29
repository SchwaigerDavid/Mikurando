import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { sha256 } from 'js-sha256';



export type Role = 'CUSTOMER' | 'OWNER' | 'MANAGER';

export type AuthUser = {
  userId: number;
  email: string;
  role: Role;
  warnings?: number;
};

type LoginResponse = {
  token: string;
  user: {
    user_id: number;
    email: string;
    role: Role;
    warnings?: number;
  };
};

export interface Restaurant {
  restaurant_id: number;
  restaurant_name: string;
  description: string;
  address: string;
  min_order_value: number;
  delivery_radius: number;
  service_fee: number;
  image_data: string;
  geo_lat: number;
  geo_lng: number;
  is_active: boolean;
  category: string;
  rating?: number;
  distance_km?: number;
  estimated_time_min?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiURL = 'http://localhost:3000/auth';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl = 'http://localhost:3000';

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readonly storageKeyToken = 'mikurando_token';
  private readonly storageKeyUser = 'user';
  private readonly storageKeyWarningsShown = 'mikurando_warnings_shown_for';

  readonly token = signal<string | null>(this.readToken());
  readonly email = signal<string>(this.reademail());
  readonly user = signal<AuthUser | null>(this.readStructuredUser());
  readonly userName = signal<string>(this.readUserName());
  readonly profilePicture = signal<string>(this.readProfilePicture());

  private readToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.storageKeyToken);
  }

  private reademail(): string {
    if (!this.isBrowser) return '';
    return localStorage.getItem(this.storageKeyUser) ?? '';
  }

  private readStructuredUser(): AuthUser | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(this.storageKeyUser);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  private readUserName(): string {
    if (!this.isBrowser) return '';
    return this.readStructuredUser()?.email ?? '';
  }

  private readProfilePicture(): string {
    if (!this.isBrowser) return '';
    return localStorage.getItem('profile_picture_data') ?? '';
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  getemail(): string {
    return this.email() || 'admin';
  }

  private loadProfilePicture(userId: number): void {
    this.http.get<any>(`${this.apiBaseUrl}/user/profile`).subscribe({
      next: (response) => {
        if (response.data?.profile_picture_data) {
          localStorage.setItem('profile_picture_data', response.data.profile_picture_data);
          this.profilePicture.set(response.data.profile_picture_data);
        }
      },
      error: (err) => console.error('Fehler beim Laden des Profilbilds:', err)
    });
  }
  register(email: string, password: string, role: 'CUSTOMER' | 'OWNER' | 'MANAGER', address: string, area_code: string , name: string, surname: string, profile_picture_data?: string): Observable<any>{
    const salt = 10;
    password = sha256(password);
    const registerPayload = {
      email: email,
      password: password,
      name: name,
      surname: surname,
      address: address,
      area_code:area_code,
      role: role,
      profile_picture_data: profile_picture_data || ''
    };
    console.log(registerPayload);
    const url = `${this.apiBaseUrl}/auth/register`;

    return this.http.post(url, registerPayload);
  }
  login(email: string, password: string): Observable<LoginResponse> {
    password = sha256(password);
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, { email, password }).pipe(
      tap((resp) => {
        const u: AuthUser = {
          userId: resp.user.user_id,
          email: resp.user.email,
          role: resp.user.role,
          warnings: (resp.user as any).warnings ?? 0,
        };

        this.setSession(resp.token, u);
      })
    );
  }


  persistSession(token: string, user: AuthUser) {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKeyToken, token);
      localStorage.setItem(this.storageKeyUser, JSON.stringify(user));
    }

    this.token.set(token);
    this.email.set(user.email);
  }

  setSession(token: string, user: AuthUser) {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKeyToken, token);
      localStorage.setItem(this.storageKeyUser, JSON.stringify(user));
    }

    this.token.set(token);
    this.user.set(user);
    this.email.set(user.email);
    
    // Lade Profilbild vom Backend
    this.loadProfilePicture(user.userId);
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.storageKeyToken);
      localStorage.removeItem(this.storageKeyUser);
      localStorage.removeItem('profile_picture_data');
    }

    this.token.set(null);
    this.email.set('');
    this.profilePicture.set('');
    this.user.set(null);
  }

  hasRole(role: Role): boolean {
    return this.user()?.role === role;
  }

  getWarningsCount(): number {
    return Number(this.user()?.warnings ?? 0);
  }

  shouldShowWarningsPopup(): boolean {
    if (!this.isBrowser) return false;
    const u = this.user();
    if (!u) return false;

    const current = Number(u.warnings ?? 0);
    if (current <= 0) return false;

    const key = `${u.userId}:${current}`;
    return localStorage.getItem(this.storageKeyWarningsShown) !== key;
  }

  markWarningsPopupShown() {
    if (!this.isBrowser) return;
    const u = this.user();
    if (!u) return;
    const current = Number(u.warnings ?? 0);
    localStorage.setItem(this.storageKeyWarningsShown, `${u.userId}:${current}`);
  }

  getOwnerOrders( restaurantID:string){
    const url = `${this.apiBaseUrl}/owner/restaurants/${restaurantID}/orders/`;
    return this.http.get<any>(url);
  }
  getOwnerRestaurant(){
    const url =`${this.apiBaseUrl}/owner/restaurants`;
    return this.http.get<any>(url);
  }

   getRestaurants(filters?: {
    name?: string;
    area_code?: string;
    category?: string;
    maxDistance?: number;
  }): Observable<Restaurant[]> {
    const url = `${this.apiBaseUrl}/restaurants`;
    const params: any = {};

    if (filters?.name) params.name = filters.name;
    if (filters?.area_code) params.area_code = filters.area_code;
    if (filters?.category) params.category = filters.category;
    if (filters?.maxDistance) params.maxDistance = filters.maxDistance.toString();

    return this.http.get<Restaurant[]>(url, { params });
  }

  getRestaurantById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/restaurants/${id}`);
  }

  getRestaurantReviews(restaurantId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiBaseUrl}/restaurants/${restaurantId}/reviews`);
  }

  getOrdersByUserId(userId: number) {
    const url = `${this.apiBaseUrl}/orders/user/${userId}`;
    return this.http.get<any[]>(url);
  }

  getOrdersForCurrentUser() {
    const url = `${this.apiBaseUrl}/orders`;
    return this.http.get<any[]>(url);
  }


  submitReview(restaurantId: number, rating: number, comment: string, dishId: any, userId: number = 0) {
    const reviewPayload = {
      user_id: userId,
      rating: rating,
      comment: comment,
      dish_id: dishId,
      created_at: new Date().toISOString()
    };

    const url = `${this.apiBaseUrl}/restaurants/${restaurantId}/reviews`;

    return this.http.post(url, reviewPayload, { observe: 'response' }).subscribe({
      next: (response) => {
        console.log('Review erfolgreich gesendet:', response);
        alert('Feedback erfolgreich abgeschickt!');
      },
      error: (err) => {
        if (err.status === 400) {
          alert('Fehlerhafte Eingabe.');
        } else if (err.status === 404) {
          alert('Restaurant nicht gefunden.');
        } else if (err.status === 500) {
          alert('Serverfehler. Bitte später erneut versuchen.');
        } else {
          alert('Fehler beim Senden des Feedbacks.');
        }
        console.error('Fehler beim Review:', err);
      },
      complete: () => console.log('Review-Prozess abgeschlossen')
    });
  }
}

export interface Review {
  review_id: number;
  restaurant_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  dish_name?: string;
}

export interface Dish {
  dish_id: number;
  restaurant_id?: number;
  dish_name: string;
  name?: string;
  description: string;
  price: number;
  category: string;
  category_id?: number;
  is_available: boolean;
  available?: boolean;
  image_data?: string;
}
