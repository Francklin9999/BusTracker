import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private marker: google.maps.Marker | any;

  constructor() {}

  getUserLocation(): Promise<GeolocationCoordinates | null> {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve(position.coords);
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error('Geolocation not supported'));
      }
    });
  }

  addMarker(map: google.maps.Map, coords: GeolocationCoordinates): void {
    const userLatLng = new google.maps.LatLng(coords.latitude, coords.longitude);

    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: userLatLng,
        map: map,
        title: 'Your Location',
      });
    } else {
      this.updateMarker(coords);
    }
  }

  updateMarker(coords: GeolocationCoordinates): void {
    const userLatLng = new google.maps.LatLng(coords.latitude, coords.longitude);
    if (this.marker) {
      this.marker.setPosition(userLatLng);
    }
  }

  watchUserLocation(map: google.maps.Map): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          const coords = position.coords;
          map.setCenter({ lat: coords.latitude, lng: coords.longitude });
          this.addMarker(map, coords);
        },
        (error) => {
          // console.error('Error watching location:', error);
        }
      );
    }
  }
}
