import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { AuthService } from './shared/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('mikurando-angular');

  private auth = inject(AuthService);
  private router = inject(Router);


  isLoggedIn = computed(() => this.auth.isLoggedIn());
  userName = computed(() => this.auth.getUserName());
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
