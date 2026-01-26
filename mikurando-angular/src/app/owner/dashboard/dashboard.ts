import { Component, OnInit, Input, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {GraphComponent} from "./graphs/graphs.component";
import { TableComponent } from './order-tables/order-tables';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatButtonToggleModule,
    GraphComponent,
    TableComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardOwner implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  @Input() restaurantData: any; // Daten kommen vom Tab-Loop
  @Input() restaurantIndex: number = 0;

  // Anzeige-Variablen
  public restaurantName: string = '';
  public orderCount: number = 0;
  public revenue: number = 0;
  public img: string = '';
  public orders: any[] = [];

  // Graph-Steuerung
  public selectedValue: string = 'W';
  public selectedSale: string = 'Sales';
  public currentSales: number[] = [];
  public currentLabels: string[] = [];

  ngOnInit() {
    if (this.restaurantData) {
      this.parseRestaurantData();
    }
  }

  private parseRestaurantData() {
    const data = this.restaurantData;
    this.restaurantName = data.restaurant_name;
    this.orderCount = data.total_orders || 0;
    this.revenue = data.total_revenue || 0;
    this.orders = data.orders || [];

    // Bild-Konvertierung (Spezialfall für deinen Buffer-String)
    if (data.image_data && data.image_data.data) {
      this.img = this.convertBufferToString(data.image_data.data);
    }

    // Initialisierung des Graphen
    this.updateGraphData();
    this.cdr.detectChanges();
  }

  private convertBufferToString(bufferData: number[]): string {
    // Entfernt BOM falls vorhanden
    let startIndex = (bufferData[0] === 239) ? 3 : 0;
    let result = '';
    for (let i = startIndex; i < bufferData.length; i++) {
      result += String.fromCharCode(bufferData[i]);
    }
    // Entfernt eventuelle Anführungszeichen am Anfang/Ende
    return result.replace(/^"|"$/g, '');
  }

  // Event-Handler für die Toggles im HTML
  onValueChange(value: string) {
    this.selectedValue = value;
    this.updateGraphData();
  }

  onSalesChange(value: string) {
    this.selectedSale = value;
    this.updateGraphData();
  }

  private updateGraphData() {
    // Hier würdest du normalerweise basierend auf selectedValue (W, M, Y)
    // und selectedSale (Sales, Orders) die Daten filtern.
    // Beispiel-Dummy-Daten:
    if (this.selectedSale === 'Sales') {
      this.currentSales = [12, 19, 3, 5, 2, 3, 9];
      this.currentLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    } else {
      this.currentSales = [5, 10, 8, 15, 7, 12, 4];
      this.currentLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    }
    this.cdr.detectChanges();
  }
}
