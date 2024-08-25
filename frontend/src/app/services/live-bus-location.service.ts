import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LiveBusLocationService {

  private markers: google.maps.Marker[] = [];
  private imageUrl: string = '../assets/images/bus-stop-icon.png';

  private wsUrl = 'ws://localhost:8080/ws';
  private socket: WebSocket | undefined;
  private messageSubject: Subject<any> = new Subject<any>();

  constructor(private http: HttpClient) {
    try {
      this.connectWebSocket();
    } catch(error) {
      console.log('Error connecting to WebSocket:', error);
    }
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
    console.log("sendMessage")
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error('WebSocket is not open. Message not sent.');
    }
  }
  
  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  addMarkers(map: google.maps.Map, stops: any): void {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    const minScale = 1; 
    const maxScale = 12; 

    const updateMarkerSize = () => {
      const zoom = map.getZoom() || 15;
      let scale: number;
      if(zoom > 13){
        // if(this.previousZoom >= 15) return;
        scale = maxScale;
      } else {
        // if(this.previousZoom < 12) return;
        scale = minScale;
      }

      this.markers.forEach(marker => {
        marker.setIcon({
          url: this.imageUrl,
          scaledSize: new google.maps.Size(scale, scale),
        });
      });
    };

    Object.keys(stops).forEach(stopCode => {
      const stop = stops[stopCode];
      const marker = new google.maps.Marker({
        position: { lat: stop.stop_lat, lng: stop.stop_lon },
        map: map,
        title: stop.stop_name,
        icon: {
          url: this.imageUrl,
          scaledSize: new google.maps.Size(5, 5),
        },
      });

      const infoWindow = new google.maps.InfoWindow();

      marker.addListener('mouseover', () => {
        infoWindow.setContent(`
          <div>Arrêt: <strong>${stop.stop_name}</strong></div>
          <br/>
          <div>Id: <strong>${stop.stop_code}</strong></div>
          <br/>
          <button id="infoWindowButton-${stopCode}">Click to see bus near this location.</button>
        `);
        infoWindow.open(map, marker);

        // google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        //   const button = document.getElementById(`infoWindowButton-${stopCode}`);
        //   if (button) {
        //     button.addEventListener('click', () => {
        //       this.buttonClickSubject.next(stop.stop_code);
        //     });
        //   }
        // });
      });

      marker.addListener('mouseout', () => {
        infoWindow.close();
      });

      this.markers.push(marker);
    });

    map.addListener('zoom_changed', updateMarkerSize);
  }
}
