import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapDataService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}


  getDataForMap(): Observable<any> {
    return forkJoin({
      user: this.http.get(`${this.apiUrl}/user/profile`),
      restaurants: this.http.get(`${this.apiUrl}/restaurants`)
    });
  }
}
