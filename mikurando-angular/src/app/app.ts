import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from './shared/auth/auth.service';
import { CartService } from './shared/services/cart.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, MatIconModule, MatBadgeModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('mikurando-angular');

  private auth = inject(AuthService);
  private router = inject(Router);
  private cartService = inject(CartService);


  isLoggedIn = computed(() => this.auth.isLoggedIn());
  userName = computed(() => this.auth.getemail());
  cartItemCount = computed(() => this.cartService.itemCount());
  // @ts-ignore
  getHome():string{
   const user:string = localStorage.getItem("user") ?? "";
   const myUser=JSON.parse(user);
   if(myUser.role=="OWNER"){
     return "ownerdash";
   }
   else if(myUser.role=="CUSTOMER") {
     return "home";
   }
   else if(myUser.role=="MANAGER"){
     return "home"
   }
  }
  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
