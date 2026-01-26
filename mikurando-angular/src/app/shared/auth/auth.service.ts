import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class AuthService {
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
  readonly user = signal<AuthUser | null>(this.readStructuredUser());
  readonly userName = signal<string>(this.readUserName());

  private readToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.storageKeyToken);
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

  isLoggedIn(): boolean {
    return !!this.token();
  }

  getUserName(): string {
    return this.userName() || 'admin';
  }

  register(email: string, password: string, role: 'CUSTOMER' | 'OWNER' | 'MANAGER', address: string, area_code: string , name: string, surname: string):any{
    const salt = 10;
    password = sha256(password);
    const registerPayload = {
      email: email,
      password: password,
      name: name,
      surname: surname,
      address: address,
      area_code:area_code,
      role: role
    };
    console.log(registerPayload);
    const url = `${this.apiBaseUrl}/auth/register`;

    this.http.post(url, registerPayload).subscribe({next: (response) => {
        // Wird bei Status 201 (Created) aufgerufen
        console.log('Registrierung erfolgreich:', response);
        alert('Konto wurde erstellt!');
      },
      error: (err) => {
        // Fehlerbehandlung basierend auf dem Statuscode vom Backend
        if (err.status === 409) {
          // Entspricht deinem res.status(409) im Backend
          console.error('Konflikt:', err.error.error);
          alert('Diese E-Mail-Adresse ist bereits registriert.');
        } else if (err.status === 500) {
          // Entspricht deinem res.status(500) im Backend
          console.error('Server Fehler:', err.error.error);
          alert('Ein interner Serverfehler ist aufgetreten. Bitte später versuchen.');
        } else {
          // Sonstige Fehler (z.B. Netzwerkprobleme)
          console.error('Unerwarteter Fehler:', err);
          alert('Verbindung zum Server fehlgeschlagen.');
        }
        return false;
      },
      complete: () => {
      return true;
        console.log('Registrierungsprozess abgeschlossen');
      }});
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
      }),
    );
  }

  setSession(token: string, user: AuthUser) {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKeyToken, token);
      localStorage.setItem(this.storageKeyUser, JSON.stringify(user));
    }

    this.token.set(token);
    this.user.set(user);
    this.userName.set(user.email);
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.storageKeyToken);
      localStorage.removeItem(this.storageKeyUser);
    }

    this.token.set(null);
    this.userName.set('');
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
    const url = `${this.apiBaseUrl}/owner/${restaurantID}/orders/`;
  }
  getOwnerRestaurant(){
    const url =`${this.apiBaseUrl}/owner/restaurants`;
    /*let restaurants = [
      {
        "restaurant_id": 0,
        "restaurant_name": "Orlando",
        "description": "Bla",
        "address": "string",
        "min_order_value": 20,
        "delivery_radius": 20,
        "service_fee": 10,
        "image_data": "string",
        "geo_lat": 45,
        "geo_lng": 50,
        "is_active": true,
        "category": "Borger"
      },
      {
        "restaurant_id": 1,
        "restaurant_name": "ThomasBudde",
        "description": "Blo",
        "address": "string",
        "min_order_value": 200,
        "delivery_radius": 120,
        "service_fee": 50,
        "image_data": "string",
        "geo_lat": 47,
        "geo_lng": 12,
        "is_active": true,
        "category": "ProteinShakes"
      }
    ]*/
    return this.http.get<any>(url);


  }
}
