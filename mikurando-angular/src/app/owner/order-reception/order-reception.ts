import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { inject } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';


type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'PREPARING'
  | 'READY'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELED';

type IncomingOrder = {
  order_id: number;
  user_id: number;
  status: OrderStatus;
  created_at: string;
  total_price: number;
  delivery_address: string;
};

@Component({
  selector: 'app-order-reception',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
  ],
  templateUrl: './order-reception.html',
  styleUrl: './order-reception.scss',
})
export class OrderReception implements OnInit {

  private destroy$ = new Subject<void>();
  private platformId = inject(PLATFORM_ID);

  testOrders = [
    { order_id: 0, customer: 'Testkunde', status: 'NEW', total: 24.9 }
  ];

  orders: IncomingOrder[] = [];

  restaurantId = 5; // später aus Auth / Route

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return; // KEIN HTTP / Polling auf dem Server
    }

    interval(5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() =>
          this.http.get<IncomingOrder[]>(
            `http://localhost:3000/orders/restaurant/${this.restaurantId}`
          )
        )
      )
      .subscribe({
        next: orders => this.orders = orders,
        error: err => console.error('Order polling failed', err)
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
