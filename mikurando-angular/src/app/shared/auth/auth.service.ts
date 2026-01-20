import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { delay, Observable, of, throwError } from 'rxjs';
import {HttpClient} from '@angular/common/http';
import { genSaltSync, hashSync } from "bcrypt-ts";
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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
  private apiURL = 'http://localhost:3000/auth';
  constructor(private http: HttpClient) {
  }
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

  isLoggedIn(): boolean {
    return !!this.token();
  }

  getemail(): string {
    return this.email() || 'admin';
  }

  register(email: string | null | undefined, password: string | null | undefined, role: string | null | undefined, adress: string | null | undefined, areacode: string | null | undefined, name: string | null | undefined, surname: string | null | undefined){
    const salt = genSaltSync(10);
    const password_hash = hashSync(<string>password, salt);
    const registerData={email,password_hash,name,surname,adress,role};
    const url = `${this.apiURL}/register`;

    this.http.post(url, registerData).subscribe({next: (response) => {
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
      },
      complete: () => {
        console.log('Registrierungsprozess abgeschlossen');
      }});
  }
  login(email: string, password: string): Observable<{token: string; user: Record<string, object> }> {
    const loginData = {email, password};
    const url = `${this.apiURL}/login`
    return this.http.post<{token: string; user: Record<string, object> }>(url, loginData) ;
    /*
      if (email === 'admin' && password === 'admin') {
        return of({ token: 'fake-jwt-token', user: 'Admin' }).pipe(delay(400));
      }

      return throwError(() => new Error('Invalid email or password')).pipe(delay(400));
      */
  }

  persistSession(token: string, user: Record<string, object>) {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKeyToken, token);
      localStorage.setItem(this.storageKeyUser, JSON.stringify(user));
    }

    this.token.set(token);
    this.email.set(JSON.stringify(user)); // JSON.parse(this.email);
  }

  setSession(token: string, user: AuthUser) {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKeyToken, token);
      localStorage.setItem(this.storageKeyUser, JSON.stringify(user));
    }

    this.token.set(token);
    this.user.set(user);
    this.email.set(user.email);
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.storageKeyToken);
      localStorage.removeItem(this.storageKeyUser);
    }

    this.token.set(null);
    this.email.set('');
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
}
