import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {delay, Observable, of, throwError} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiURL = 'https://mikurando-api.de/api/login';
  constructor(private http: HttpClient) {
  }
  login(username: string, password: string) {
    const loginData = {username, password};
    //return this.http.post(this.apiURL, loginData);
    if(username==="admin" && password==="admin"){
      return of({token:"fake-jwt-token", user:"Admin"}).pipe(delay(1000));
    }
    else {
      return throwError(()=> new Error("Invalid username or password")).pipe(delay(1000));
    }
  }
}
