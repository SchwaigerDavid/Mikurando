import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../shared/auth/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

interface Order {
  order_id: number;
  restaurant_id: number;
  restaurant_name: string;
  status: string;
  total_price: number;
  created_at: string;
  estimated_delivery_time: any;
}

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './tracking.html',
  styleUrls: ['./tracking.scss']
})
export class Tracking implements OnInit {
  orders: Order[] = [];
  expandedOrderId: number | null = null;
  //private cdr = Inject(ChangeDetectorRef);

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Nur im Browser Orders laden
    if (isPlatformBrowser(this.platformId)) {
      this.loadOrders();
    }
  }


  loadOrders() {
    this.authService.getOrdersForCurrentUser().subscribe({
      next: (res: any) => {
        console.log('FULL RESPONSE:', res);       // DEBUG
        console.log('DATA FIELD:', res.data);     // DEBUG
        this.orders = res.data || []; // || [];
        console.log('ORDERS ARRAY:', this.orders); // DEBUG
      },
      error: (err) => {
        console.error('Fehler beim Laden der Orders:', err);
        this.showError('Orders konnten nicht geladen werden.');
      }
    });

    this.cdr.detectChanges();
  }




  toggleOrderDetails(orderId: number) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  private showError(msg: string) {
    if (isPlatformBrowser(this.platformId)) {
      window.alert(msg);
    } else {
      console.log('Fehler (SSR):', msg);
    }
  }
}
