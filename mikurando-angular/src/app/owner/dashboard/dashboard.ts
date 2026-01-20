import { Component, ViewChild, AfterViewInit, inject } from '@angular/core'; // inject hinzugefügt
import { GraphComponent } from './graphs/graphs.component';
import {TableComponent} from "./order-tables/order-tables"
import { RouterLink, Router } from '@angular/router';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Router gehört hier NICHT rein, nur RouterLink (für das Template)
  imports: [GraphComponent, RouterLink,TableComponent,MatGridListModule,MatTableModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardOwner implements AfterViewInit {
  // Die moderne Art in Angular (ab v16+), den Router zu initialisieren:
  private router = inject(Router);

  @ViewChild(GraphComponent) graph!: GraphComponent;
  currentSales = [55, 20, 4, 30, 25];
  orders= [
    {position: 1, order_id:1, service_fee: 1, status: "ACCEPTED",price:22,delivery_address:"archen"},
    {position: 2, order_id:2, service_fee: 4, status: "READY",price:42,delivery_address:"Darchen"},
  ];

  constructor() {
    this.loadUserData();
  }

  private loadUserData() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const myUser = JSON.parse(userData);
          if (myUser && myUser.role === "OWNER") {
            this.currentSales = [12, 20, 4, 30, 25];
            return; // Erfolg, wir brechen hier ab
          }
        }
        // Falls kein User oder falsche Rolle: Ab zum Login
        this.router.navigateByUrl('/login');
      } catch (error) {
        console.error("Fehler beim Lesen der User-Daten", error);
        this.router.navigateByUrl('/login');
      }
    }
  }

  getOrders() {


  }
  ngAfterViewInit() {
    // Sicherheitshalber prüfen, ob graph existiert
    if (this.graph) {
      this.graph.updateChart();
    }
  }
}
