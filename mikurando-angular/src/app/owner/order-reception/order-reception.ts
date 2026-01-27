import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { inject } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { startWith } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { catchError, of } from 'rxjs';


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
  // Payload property hinzufügen
  payload?: any;
};

@Component({
  selector: 'app-order-reception',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
  ],
  templateUrl: './order-reception.html',
  styleUrl: './order-reception.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderReception implements OnInit {

  restaurantId = 5;
  expandedOrderId: number | null = null;

  orders$ = interval(5000).pipe(
    startWith(0),
    switchMap(() =>
      this.http
        .get<IncomingOrder[]>(
          `http://localhost:3000/orders/restaurant/${this.restaurantId}`
        )
        .pipe(
          catchError(err => {
            if (err.status !== 401) { //der fehler ist erwartet, und wird deshalb ausgeblendet
              console.error('Orders loading failed', err);
            }
            return of([]);
          })
        )
    )
  );

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  toggleOrderDetails(orderId: number) {
    this.expandedOrderId =
      this.expandedOrderId === orderId ? null : orderId;
  }
}
