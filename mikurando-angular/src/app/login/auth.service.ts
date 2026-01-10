import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiURL = 'https://mikurando-api.de/api/login';
  constructor(private http: HttpClient) {
  }
  login(username: string, password: string) {
    const loginData = {username, password};
    return this.http.post(this.apiURL, loginData);
  }
}
