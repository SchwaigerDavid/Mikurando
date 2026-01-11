import { Injectable, signal } from '@angular/core';

export type RestaurantStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type Restaurant = {
  id: number;
  name: string;
  category: string;
  approved: boolean;
  active: boolean;
  areaCode: string;
  status: RestaurantStatus;
};

export type Voucher = {
  id: number;
  code: string;
  value: number;
  isPercent: boolean;
  validUntil: string;
};

export type PlatformSettings = {
  serviceFeePercent: number;
  allowedZones: string[];
};

export type UserAccount = {
  id: number;
  email: string;
  role: 'CUSTOMER' | 'OWNER' | 'MANAGER' | 'SITE_MANAGER';
  status: 'ACTIVE' | 'SUSPENDED';
  warnings: number;
  lastActionAt: string;
};

@Injectable({ providedIn: 'root' })
export class SiteManagerMockService {
  private restaurants = signal<Restaurant[]>([
    { id: 1, name: 'Pizza Palace', category: 'Italian', approved: true, active: true, areaCode: 'A1', status: 'APPROVED' },
    { id: 2, name: 'Sushi Express', category: 'Japanese', approved: true, active: true, areaCode: 'B2', status: 'APPROVED' },
    { id: 3, name: 'Burger Town', category: 'American', approved: false, active: false, areaCode: 'A2', status: 'PENDING' },
  ]);

  private vouchers = signal<Voucher[]>([
    { id: 1, code: 'FOOD2026', value: 5, isPercent: true, validUntil: new Date(Date.now() + 7 * 86400000).toISOString() },
  ]);

  private settings = signal<PlatformSettings>({
    serviceFeePercent: 7.5,
    allowedZones: ['A1', 'A2', 'B1', 'B2'],
  });

  private userActivity = signal<number>(128);

  private users = signal<UserAccount[]>([
    {
      id: 1,
      email: 'abuse@user.com',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      warnings: 1,
      lastActionAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 2,
      email: 'owner@restaurant.com',
      role: 'OWNER',
      status: 'ACTIVE',
      warnings: 0,
      lastActionAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: 3,
      email: 'fraud@user.com',
      role: 'CUSTOMER',
      status: 'SUSPENDED',
      warnings: 3,
      lastActionAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ]);

  // selectors
  getRestaurants() {
    return this.restaurants.asReadonly();
  }

  getPendingRestaurants() {
    return () => this.restaurants().filter((r) => r.status === 'PENDING');
  }

  getSettings() {
    return this.settings.asReadonly();
  }

  getVouchers() {
    return this.vouchers.asReadonly();
  }

  getStats() {
    return () => {
      const totalOrders = 342; // mock
      const revenue = 12450.75; // mock
      const activeRestaurants = this.restaurants().filter((r) => r.active).length;
      const pendingRestaurants = this.restaurants().filter((r) => !r.approved).length;
      const userActivity = this.userActivity();
      return { totalOrders, revenue, activeRestaurants, pendingRestaurants, userActivity };
    };
  }

  getUsers() {
    return this.users.asReadonly();
  }

  // commands
  approveRestaurant(id: number) {
    this.restaurants.update((list) =>
      list.map((r) => (r.id === id ? { ...r, approved: true, active: true, status: 'APPROVED' } : r)),
    );
  }

  rejectRestaurant(id: number) {
    this.restaurants.update((list) =>
      list.map((r) => (r.id === id ? { ...r, approved: false, active: false, status: 'REJECTED' } : r)),
    );
  }

  setServiceFeePercent(v: number) {
    this.settings.update((s) => ({ ...s, serviceFeePercent: v }));
  }

  addZone(code: string) {
    const z = code.trim().toUpperCase();
    if (!z) return;
    this.settings.update((s) => ({ ...s, allowedZones: Array.from(new Set([...s.allowedZones, z])).sort() }));
  }

  removeZone(code: string) {
    this.settings.update((s) => ({ ...s, allowedZones: s.allowedZones.filter((z) => z !== code) }));
  }

  createVoucher(v: Omit<Voucher, 'id'>) {
    this.vouchers.update((list) => [{ id: Math.max(0, ...list.map((x) => x.id)) + 1, ...v }, ...list]);
  }

  deleteVoucher(id: number) {
    this.vouchers.update((list) => list.filter((v) => v.id !== id));
  }

  suspendUser(id: number) {
    this.users.update((list) =>
      list.map((u) => (u.id === id ? { ...u, status: 'SUSPENDED', lastActionAt: new Date().toISOString() } : u)),
    );
  }

  unsuspendUser(id: number) {
    this.users.update((list) =>
      list.map((u) => (u.id === id ? { ...u, status: 'ACTIVE', lastActionAt: new Date().toISOString() } : u)),
    );
  }

  warnUser(id: number) {
    this.users.update((list) =>
      list.map((u) => (u.id === id ? { ...u, warnings: u.warnings + 1, lastActionAt: new Date().toISOString() } : u)),
    );
  }
}
