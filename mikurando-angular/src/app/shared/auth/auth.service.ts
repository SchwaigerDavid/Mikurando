import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { delay, Observable, of, throwError } from 'rxjs';

export type Role = 'CUSTOMER' | 'OWNER' | 'MANAGER';

export type AuthUser = {
  userId: number;
  email: string;
  role: Role;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readonly storageKeyToken = 'mikurando_token';
  private readonly storageKeyUser = 'mikurando_user';

  readonly token = signal<string | null>(this.readToken());
  readonly userName = signal<string>(this.readUserName());

  readonly user = signal<AuthUser | null>(this.readStructuredUser());

  private readToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.storageKeyToken);
  }

  private readUserName(): string {
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

  getUserName(): string {
    return this.userName() || 'admin';
  }

  login(username: string, password: string): Observable<{ token: string; user: string }> {
    if (username === 'admin' && password === 'admin') {
      return of({ token: 'fake-jwt-token', user: 'Admin' }).pipe(delay(400));
    }

    return throwError(() => new Error('Invalid username or password')).pipe(delay(400));
  }

  persistSession(token: string, user: string) {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKeyToken, token);
      localStorage.setItem(this.storageKeyUser, user);
    }

    this.token.set(token);
    this.userName.set(user);
  }

  setSession(token: string, user: AuthUser) {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKeyToken, token);
      localStorage.setItem('user', JSON.stringify(user));
    }

    this.token.set(token);
    this.user.set(user);
    this.userName.set(user.email);
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.storageKeyToken);
      localStorage.removeItem(this.storageKeyUser);
      localStorage.removeItem('user');
    }

    this.token.set(null);
    this.userName.set('');
    this.user.set(null);
  }

  hasRole(role: Role): boolean {
    return this.user()?.role === role;
  }
}
