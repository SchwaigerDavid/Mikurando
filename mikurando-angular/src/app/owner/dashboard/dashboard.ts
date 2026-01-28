import { Component, OnInit, Input, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {GraphComponent} from "./graphs/graphs.component";
import { TableComponent } from './order-tables/order-tables';
import { AuthService } from '../../shared/auth/auth.service';


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
  private authService = inject(AuthService);

  // Graph-Steuerung
  public selectedValue: string = 'W';
  public selectedSale: string = 'Sales';
  public currentSales: number[] = [12,14,25,10,14,25,32];
  public sale:number[]=[];
  public order:number[]=[];
  public currentLabels: string[] = ["Monday", "Tuesday", "Wednesday","Thursday","Friday", "Saturday", "Sunday"];

  ngOnInit() {
    if (this.restaurantData) {
      this.parseRestaurantData();
    }
    this.getOrders();
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
      // Wir übergeben das gewählte Format und das Array aus deinem Restaurant-Objekt
    if(this.selectedSale=="Sales") {
      this.processData(value as any, this.orders || []);
    }else{
      this.processOrderCount(value as any, this.orders || []);
    }
    this.updateGraphData();
  }

  onSalesChange(value: string) {
    this.selectedSale = value;
    this.updateGraphData();
  }

  private updateGraphData() {
    console.log(this.selectedSale);
    console.log(this.selectedValue);
    if (this.selectedSale === 'Sales') {
      this.currentSales = this.sale;

    } else {
      this.currentSales = this.order;
    }
    this.cdr.detectChanges();
  }

  private getOrders() {
    console.log(this.restaurantData);
    this.authService.getOwnerOrders(this.restaurantData.restaurant_id).subscribe( {
      next: (response)=>{
        console.log(response);
        this.orders = response;
        this.processData("W",this.orders);
        this.calculateTotals(this.orders);
        this.updateGraphData();
      }
    }
    )
  }
  processData(format: 'W' | 'M' | '6M' | 'Y', orders: any[]) {
    const now = new Date();
    const dataMap = new Map<string, number>();
    let startDate = new Date();

    // Zeitraum festlegen
    if (format === 'W') {startDate.setDate(now.getDate() - 7); this.currentLabels=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];}
    else if (format === 'M') {startDate.setMonth(now.getMonth() - 1); this.currentLabels=['W1','W2','W3','W4']}
    else if (format === '6M') {startDate.setMonth(now.getMonth() - 6);this.currentLabels=['M1','M2','M3','M4','M5','M6']}
    else if (format === 'Y') {startDate.setFullYear(now.getFullYear() - 1);this.currentLabels=['January','Ferburary','March','April','May','June','July','August','September','October','November','December'];}

    // 1. Daten filtern und gruppieren
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      if (orderDate >= startDate) {
        // Gruppierungsschlüssel basierend auf Format
        let label = '';
        if (format === 'W' || format === 'M') {
          label = orderDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
        } else {
          label = orderDate.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
        }

        const price = parseFloat(order.total_price) || 0;
        dataMap.set(label, (dataMap.get(label) || 0) + price);
      }
    });

    // 2. In Chart-Format umwandeln (Sortiert nach Datum)
    const sortedLabels = Array.from(dataMap.keys()); // Evtl. hier noch sortieren, falls API unsortiert liefert
    const sortedValues = sortedLabels.map(label => dataMap.get(label));
    console.log(sortedValues);
    //this.currentLabels = sortedLabels;
    this.sale = sortedValues as number[];
  }
  processOrderCount(format: 'W' | 'M' | '6M' | 'Y', orders: any[]) {
    const now = new Date();
    const dataMap = new Map<string, number>();
    let startDate = new Date();

    // 1. Zeiträume und statische Labels festlegen
    if (format === 'W') {
      startDate.setDate(now.getDate() - 7);
      this.currentLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    } else if (format === 'M') {
      startDate.setMonth(now.getMonth() - 1);
      this.currentLabels = ['W1', 'W2', 'W3', 'W4'];
    } else if (format === '6M') {
      startDate.setMonth(now.getMonth() - 6);
      this.currentLabels = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
    } else if (format === 'Y') {
      startDate.setFullYear(now.getFullYear() - 1);
      this.currentLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    }

    // Map mit 0 initialisieren für alle Labels, damit der Chart keine Lücken hat
    this.currentLabels.forEach(label => dataMap.set(label, 0));

    // 2. Daten filtern und zählen
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      if (orderDate >= startDate) {
        let label = '';

        if (format === 'W') {
          // Wochentag extrahieren
          label = orderDate.toLocaleDateString('en-US', { weekday: 'long' });
        } else if (format === 'M') {
          // Woche im Monat berechnen (Grob 1-4)
          const day = orderDate.getDate();
          const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
          label = this.currentLabels[weekIndex];
        } else if (format === '6M') {
          // Relative Monate M1 (vor 5 Monaten) bis M6 (jetzt)
          const monthDiff = (now.getMonth() + 12 * now.getFullYear()) - (orderDate.getMonth() + 12 * orderDate.getFullYear());
          if (monthDiff >= 0 && monthDiff < 6) {
            label = this.currentLabels[5 - monthDiff];
          }
        } else if (format === 'Y') {
          // Voller Monatsname
          label = orderDate.toLocaleDateString('en-US', { month: 'long' });
        }

        if (dataMap.has(label)) {
          dataMap.set(label, dataMap.get(label)! + 1); // Hier wird gezählt (+1)
        }
      }
    });

    // 3. Werte in das Array für den Graphen übertragen
    this.order = this.currentLabels.map(label => dataMap.get(label) || 0);
    console.log('Order Counts:', this.currentSales);
  }
  calculateTotals(orders: any[]): void {
    // Initialisierung der Zähler
    let totalCount = 0;
    let totalRevenue = 0;

    if (orders && orders.length > 0) {
      orders.forEach(order => {
        // 1. Bestellung zählen
        totalCount++;

        // 2. Umsatz addieren (String in Zahl umwandeln)
        const price = parseFloat(order.total_price) || 0;
        totalRevenue += price;
      });
    }

    // Zuweisung an die Variablen für dein HTML-Template
    this.orderCount = totalCount;
    this.revenue = parseFloat(totalRevenue.toFixed(2)); // Auf 2 Nachkommastellen runden

    console.log(`Berechnung abgeschlossen: ${this.orderCount} Orders, ${this.revenue}€ Umsatz.`);
  }

}
