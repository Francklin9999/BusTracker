import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class StopsService {

  private filePath = 'assets/files/stops.csv';
  private markers: google.maps.Marker[] = [];
  private previousZoom: number = 15;

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
              const parsedData = this.transformData(result.data);
              observer.next(parsedData);
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

  private transformData(data: any[]): any {
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
    const maxScale = 5; 

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
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="black" stroke-width="2" fill="red"/>
            </svg>
          `),
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
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="black" stroke-width="2" fill="red"/>
            </svg>
          `),
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

        // Wait for the InfoWindow to be rendered
        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
          // Find the button by its ID and add a click event listener
          const button = document.getElementById(`infoWindowButton-${stopCode}`);
          if (button) {
            button.addEventListener('click', () => {
              // Emit the button click event
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

  handleButtonClick(stopCode: string): void {
    console.log(`Button clicked for stop: ${stopCode}`);
  }
}