import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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

  login(email: string, password: string): Observable<LoginResponse> {
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

  register(payload: {
    email: string;
    password: string;
    role: 'CUSTOMER' | 'OWNER';
    surname: string;
    name: string;
    address?: string;
    area_code?: string;
    geo_lat?: number;
    geo_lng?: number;
  }): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/auth/register`, payload);
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
}
