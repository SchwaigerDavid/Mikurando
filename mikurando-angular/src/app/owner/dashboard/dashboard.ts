import { Component, ViewChild, AfterViewInit, inject,ChangeDetectionStrategy } from '@angular/core'; // inject hinzugefügt
import { GraphComponent } from './graphs/graphs.component';
import {TableComponent} from "./order-tables/order-tables"
import { RouterLink, Router } from '@angular/router';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import {AuthService} from '../../shared/auth/auth.service';
import {MatButtonToggleGroup, MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Router gehört hier NICHT rein, nur RouterLink (für das Template)
  imports: [GraphComponent, RouterLink,TableComponent,MatGridListModule,MatTableModule,FormsModule,MatCheckboxModule,MatButtonToggleModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOwner implements AfterViewInit {
  // Die moderne Art in Angular (ab v16+), den Router zu initialisieren:
  private router = inject(Router);
  public restaurantName="NONE";
  public orderCount="1.000.000";
  public revenue ="100.000";
  public selectedValue="W";
  public selectedSale ="Sales";
  public img:string="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  @ViewChild(GraphComponent) graph!: GraphComponent;
  @ViewChild('salesGroup') salesGroup!: MatButtonToggleGroup;
  @ViewChild('timeGroup') timeGroup!: MatButtonToggleGroup;
  currentSales = [55, 20, 4, 30, 25,2];
  Sales = [55, 20, 4, 30, 25,2];
  currentOrders=[105, 10, 200, 320, 205,222];
  currentLabels:string[]=["Mo","Di","We","Th","Fr","Sa"];
  week=["Mo","Di","We","Th","Fr","Sa"];
  month=["W1","W2","W3","W4"];
  months=["M1","M2","M3","M4","M5","M6"];
  year=["January","February","March","April","May","June","Juli","August","September","October","November","December"];
  orders= [
    {position: 1, order_id:1, service_fee: 1, status: "ACCEPTED",price:22,delivery_address:"archen"},
    {position: 2, order_id:2, service_fee: 4, status: "READY",price:42,delivery_address:"Darchen"},
  ];

  constructor(private authService:AuthService) {
    this.loadUserData();
  }

  private loadUserData() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const myUser = JSON.parse(userData);
          if (myUser && myUser.role === "OWNER") {
            this.currentSales = [12, 20, 4, 30, 25,2];
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
  onValueChange(newValue:string){
    this.selectedValue=newValue;
    if(this.selectedValue=="W"){
      this.currentLabels=this.week;
    }else if(this.selectedValue=="M"){
      this.currentLabels=this.month;
    }
    else if(this.selectedValue=="6M"){
      this.currentLabels=this.months;
    }
    else if(this.selectedValue=="Y"){
      this.currentLabels=this.year;
    }
    this.graph.updateChart();
  }
  onSalesChange(newValue:string){
    this.selectedSale=newValue;
    if(this.selectedSale=="Sales"){
      this.currentSales=this.getSales();
    }else if(this.selectedSale=="Orders"){
      this.currentSales=this.currentOrders;
    }
    this.graph.updateChart();
  }
getSales(){
    return [55, 20, 4, 30, 25,2];
}
getOrderCount(){
    return[105, 10, 200, 320, 205,222];
}
  ngAfterViewInit() {
    // Prüfen, ob wir im Browser sind, bevor wir localStorage anfassen
    const restaurants=this.authService.getOwnerRestaurant();
    console.log(restaurants);
    if (this.graph) {
      this.graph.updateChart();
    }
  }
  get fullImageSource(){
    return `data:image/png;base64,${this.img}`;
  }
}
