import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { delay, Observable, of, throwError } from 'rxjs';
import {HttpClient} from '@angular/common/http';

export type Role = 'CUSTOMER' | 'OWNER' | 'MANAGER';

export type AuthUser = {
  userId: number;
  email: string;
  role: Role;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiURL = 'http://localhost:3000/auth';
  constructor(private http: HttpClient) {
  }
  private readonly platformId = inject(PLATFORM_ID);
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readonly storageKeyToken = 'mikurando_token';
  private readonly storageKeyUser = 'mikurando_user';

  readonly token = signal<string | null>(this.readToken());
  readonly email = signal<string>(this.reademail());

  readonly user = signal<AuthUser | null>(this.readStructuredUser());

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
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  getemail(): string {
    return this.email() || 'admin';
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
      localStorage.setItem('user', JSON.stringify(user));
    }

    this.token.set(token);
    this.user.set(user);
    this.email.set(user.email);
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.storageKeyToken);
      localStorage.removeItem(this.storageKeyUser);
      localStorage.removeItem('user');
    }

    this.token.set(null);
    this.email.set('');
    this.user.set(null);
  }

  hasRole(role: Role): boolean {
    return this.user()?.role === role;
  }
}
