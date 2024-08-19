import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private apiUrl = 'http://localhost:8080/bus-near';
  constructor(private http: HttpClient) { }

  getBusesNear(location: string): Observable<any> {
    const url = `${this.apiUrl}?location=${encodeURIComponent(location)}`;
    return this.http.get<any>(url);
  }
}

