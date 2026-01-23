import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

type OrderStatus = 'NEW' | 'REJECTED' | 'PREPARING' | 'READY' | 'DISPATCHED';

interface Order {
  id: number;
  customerName: string;
  items: { name: string; qty: number }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

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
export class OrderReception {

  orders: Order[] = [
    {
      id: 101,
      customerName: 'Marcel Davis',
      items: [
        { name: 'Pizza Margherita', qty: 1 },
        { name: 'Cola', qty: 2 }],
      total: 24.90,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    },
    {
      id: 102,
      customerName: 'Jasper Blatt',
      items: [{ name: 'Pasta Carbonara', qty: 1 }],
      total: 18.50,
      status: 'PREPARING',
      createdAt: new Date().toISOString(),
    },
  ];

  accept(order: Order) {
    order.status = 'PREPARING';
  }

  reject(order: Order) {
    order.status = 'REJECTED';
  }

  markReady(order: Order) {
    order.status = 'READY';
  }

  dispatch(order: Order) {
    order.status = 'DISPATCHED';
  }
}
