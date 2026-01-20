import {Component, Input} from '@angular/core';
import {MatTableModule} from '@angular/material/table';

export interface PeriodicElement {
  order_id: number;
  position: number;
  service_fee:number;
  price:number;
  status:string;
  delivery_address: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, order_id:1, service_fee: 1, status: "ACCEPTED",price:22,delivery_address:"archen"},
  {position: 1, order_id:2, service_fee: 4, status: "READY",price:42,delivery_address:"archen"},
];

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'order-tables',
  styleUrl: 'order-tables.scss',
  templateUrl: 'order-tables.html',
  imports: [MatTableModule],
})

export class TableComponent {
  displayedColumns: string[] = ['position', 'order_id', 'service_fee', 'status','price', 'delivery_address'];
  @Input() dataSource: PeriodicElement[]= [];
}
