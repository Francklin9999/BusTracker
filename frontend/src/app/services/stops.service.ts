import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import * as Papa from 'papaparse';
import { log } from 'console';

@Injectable({
  providedIn: 'root'
})
export class StopsService {

  private filePath = 'assets/files/stops.csv';
  private markers: google.maps.Marker[] = [];
  private previousZoom: number = 15;
  private imageUrl: string = '../assets/images/bus-stop-icon2.png';

  private stops: { [key: string]: any } = {};

  private buttonClickSubject = new Subject<string>();
  buttonClick$ = this.buttonClickSubject.asObservable();

  constructor(private http: HttpClient) { }

  getParsedData() : Observable<any> {
    return new Observable(observer => {
      this.http.get(this.filePath, { responseType: 'text'}).subscribe(
        csvData => {
          Papa.parse(csvData, {
            header: true,
            dynamicTyping: true,
            complete: (result: any) => {
              this.stops = this.transformData(result.data);
              observer.next(this.stops);
              observer.complete();
            },
            error: (error: any) => {
              observer.error(error);
            }
          });
        },
        error => observer.error(error)
      );
    });
  }

  private transformData(data: any[]): { [key: string]: any } {
    const result: { [key: string]: any} = {};
    data.forEach(row => {
      if (row.stop_code) {
        result[row.stop_code] = {
          stop_code: row.stop_code,
          stop_id: row.stop_id,
          stop_name: row.stop_name,
          stop_lat: parseFloat(row.stop_lat),
          stop_lon: parseFloat(row.stop_lon),
        };
      }
  });
  return result;
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

    const infoWindow = new google.maps.InfoWindow();

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

      marker.addListener('mouseover', () => {
        infoWindow.setContent(`
          <div>Arrêt: <strong>${stop.stop_name}</strong></div>
          <br/>
          <div>Id: <strong>${stop.stop_code}</strong></div>
          <br/>
          <button id="infoWindowButton-${stopCode}">Click to see bus near this location.</button>
        `);
        infoWindow.open(map, marker);

        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
          const button = document.getElementById(`infoWindowButton-${stopCode}`);
          if (button) {
            button.addEventListener('click', () => {
              this.buttonClickSubject.next(stop.stop_code);
            });
          }
        });
      });

      marker.addListener('mouseout', () => {
        infoWindow.close();
      });

      this.markers.push(marker);
    });

    map.addListener('zoom_changed', updateMarkerSize);
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }

  getNearbyStops(stopCode: string, distance: number): any[] {
    const centerStop = this.stops[stopCode];
    if (!centerStop) {
      return [];
    }

    const nearbyStops:  any[] = [];
    Object.keys(this.stops).forEach(key => {
      const stop = this.stops[key];
      if (stop.stop_code !== stopCode) {
        const dist = this.calculateDistance(centerStop.stop_lat, centerStop.stop_lon, stop.stop_lat, stop.stop_lon);
        if (dist <= distance) {
          nearbyStops.push(stop.stop_code);
        }
      }
    });

    return nearbyStops;
  }

  getNearbyStopsByLocation(lat: number, lng: number, distance: number): any[] {
    const nearbyStops: any[] = [];
    
    Object.keys(this.stops).forEach(key => {
        const stop = this.stops[key];
        const dist = this.calculateDistance(lat, lng, stop.stop_lat, stop.stop_lon);
        if (dist <= distance) {
            nearbyStops.push(stop.stop_code);
        }
    });

    return nearbyStops;
}

}