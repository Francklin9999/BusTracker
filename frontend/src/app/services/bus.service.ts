import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private apiUrl = 'http://localhost:8080/bus-near';
  private wsUrl = 'ws://localhost:8080/ws';
  private socket: WebSocket | undefined;
  private messageSubject: Subject<any> = new Subject<any>();

  constructor(private http: HttpClient) {
    this.connectWebSocket();
  }

  getBusesNear(location: string): Observable<any> {
    const url = `${this.apiUrl}?location=${encodeURIComponent(location)}`;
    return this.http.get<any>(url);
  }

  private connectWebSocket() {
    this.socket = new WebSocket(this.wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageSubject.next(data);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed', event);
    };
  }

  sendMessage(action: string, params: any) {
    const message = JSON.stringify({ action, params });
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error('WebSocket is not open. Message not sent.');
    }
  }
  
  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }
}


