import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { WebSocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private apiUrl = 'http://localhost:8080/bus-near';
  private messageSubject: Subject<any> = new Subject<any>();

  constructor(private http: HttpClient, private webSocket: WebSocketService) {
    this.webSocket.getMessages().subscribe(message => {
      this.messageSubject.next(message);
    });
  }

  getBusesNear(location: string): Observable<any> {
    const url = `${this.apiUrl}?location=${encodeURIComponent(location)}`;
    return this.http.get<any>(url);
  }

  sendMessage(action: string, params: any) {
    this.webSocket.sendMessage(action, params);
  }
  
  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }
}


