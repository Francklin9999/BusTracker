import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private wsUrl = 'ws://localhost:8080/ws';
  private socket: WebSocket | undefined;
  private messageSubject = new Subject<string>();

  public messages$ = this.messageSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.connectWebSocket();
    }
  }

  private connectWebSocket() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
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
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  sendMessage(action: string, params: any): void {
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

  // sendMessage(message: string): void {
  //   if (this.socket && this.socket.readyState === WebSocket.OPEN) {
  //     this.socket.send(message);
  //   } else {
  //     console.error('WebSocket is not connected.');
  //   }
  // }

  closeConnection(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
  }

  // private handleVisibilityChange(): void {
  //   if (document.visibilityState === 'hidden') {
  //     this.closeConnection();
  //   }
  // }
}
