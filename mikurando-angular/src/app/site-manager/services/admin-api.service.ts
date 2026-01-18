import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type AdminDashboardDto = {
  total_orders: number;
  revenue: number;
  active_restaurants: number;
  user_activity: number;
  pending_restaurants: number;
};

export type AdminPendingRestaurantDto = {
  restaurant_id: number;
  restaurant_name: string;
  area_code: string;
  category: string | null;
  approved: boolean;
  is_active: boolean;
};

export type AdminUserDto = {
  user_id: number;
  email: string;
  role: 'CUSTOMER' | 'OWNER' | 'MANAGER';
  is_active: boolean;
};

export type AdminVoucherDto = {
  voucher_id: number;
  code: string;
  voucher_value: number;
  voucher_value_is_percentage: boolean;
  valid_until: string;
};

export type AdminSettingsDto = {
  default_service_fee: number;
};

export type DeliveryZoneDto = {
  id: number;
  zone_name: string;
  max_radius_km: number | null;
};

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/admin';

  getDashboard(): Observable<AdminDashboardDto> {
    return this.http.get<AdminDashboardDto>('${this.baseUrl}/dashboard');
  }

  getRestaurants(): Observable<AdminPendingRestaurantDto[]> {
    return this.http.get<AdminPendingRestaurantDto[]>('${this.baseUrl}/restaurants');
  }

  getPendingRestaurants(): Observable<AdminPendingRestaurantDto[]> {
    return this.http.get<AdminPendingRestaurantDto[]>('${this.baseUrl}/restaurants/pending');
  }

  approveRestaurant(id: number, approved: boolean): Observable<any> {
    return this.http.patch('${this.baseUrl}/restaurants/${id}/approve', { approved });
  }

  listUsers(): Observable<AdminUserDto[]> {
    return this.http.get<AdminUserDto[]>('${this.baseUrl}/users');
  }

  banUser(userId: number, isBanned: boolean): Observable<any> {
    return this.http.patch('${this.baseUrl}/users/${userId}/ban', { is_banned: isBanned });
  }

  listVouchers(): Observable<AdminVoucherDto[]> {
    return this.http.get<AdminVoucherDto[]>('${this.baseUrl}/vouchers');
  }

  createVoucher(payload: {
    code: string;
    value: number;
    is_percent: boolean;
    valid_until: string;
  }): Observable<AdminVoucherDto> {
    return this.http.post<AdminVoucherDto>('${this.baseUrl}/vouchers', payload);
  }

  deleteVoucher(voucherId: number): Observable<any> {
    return this.http.delete('${this.baseUrl}/vouchers/${voucherId}');
  }

  getSettings(): Observable<AdminSettingsDto> {
    return this.http.get<AdminSettingsDto>('${this.baseUrl}/settings');
  }

  updateSettings(payload: { default_service_fee: number }): Observable<AdminSettingsDto> {
    return this.http.put<AdminSettingsDto>('${this.baseUrl}/settings', payload);
  }

  resetSettings(): Observable<AdminSettingsDto> {
    return this.http.delete<AdminSettingsDto>('${this.baseUrl}/settings');
  }

  getDeliveryZones(): Observable<DeliveryZoneDto[]> {
    return this.http.get<DeliveryZoneDto[]>('${this.baseUrl}/delivery-zones');
  }

  createDeliveryZone(payload: { zone_name: string; max_radius_km?: number | null }): Observable<DeliveryZoneDto> {
    return this.http.post<DeliveryZoneDto>('${this.baseUrl}/delivery-zones', payload);
  }

  deleteDeliveryZone(id: number): Observable<any> {
    return this.http.delete('${this.baseUrl}/delivery-zones/${id}');
  }

  reportOrders(params: { start: string; end: string }): Observable<any[]> {
    return this.http.get<any[]>('${this.baseUrl}/reports/orders', { params: params as any });
  }

  reportRevenue(params: { start: string; end: string }): Observable<any[]> {
    return this.http.get<any[]>('${this.baseUrl}/reports/revenue', { params: params as any });
  }

  reportUserActivity(params: { start: string; end: string }): Observable<any[]> {
    return this.http.get<any[]>('${this.baseUrl}/reports/user-activity', { params: params as any });
  }
}
