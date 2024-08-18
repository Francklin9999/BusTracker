import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsService {
  private mapApiLoaded = false;

  loadGoogleMapsApi(): Promise<void> {
    if (this.mapApiLoaded) {
      return Promise.resolve();
    }

    const apiKey = '';
    const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.mapApiLoaded = true;
        resolve();
      };
      script.onerror = () => reject('Failed to load Google Maps API');
      document.head.appendChild(script);
    });
  }
}
