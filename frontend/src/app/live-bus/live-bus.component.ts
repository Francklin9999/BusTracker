import { Component, ElementRef, ViewChild } from '@angular/core';
import { LiveBusLocationService } from '../services/live-bus-location.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-bus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-bus.component.html',
  styleUrl: './live-bus.component.scss'
})
export class LiveBusComponent {

  private liveBusSubscription: Subscription | undefined;
  busLocation: any = [];
  markers: { [key: string]: google.maps.Marker } = {};
  markerData: { [key: string]: any } = {};
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map: google.maps.Map | any;

  mapStyles = [
    {
      featureType: "transit.station.bus",
      stylers: [{ visibility: "off" }]
    }
  ];

  darkModeStyles: google.maps.MapTypeStyle[] = [
    {
      elementType: 'geometry',
      stylers: [{ color: '#212121' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.fill',
      stylers: [{ color: '#2c2c2c' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212121' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }],
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#212121' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#181818' }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [{ color: '#757575' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#212121' }],
    },
  ];

  constructor(private liveBus: LiveBusLocationService)  {}


    ngOnInit(): void {
      this.liveBusSubscription = this.liveBus.getMessages().subscribe(message => {
        console.log('Received WebSocket message:', message);
        this.busLocation = JSON.parse(message['vehiclePositions'] || {});
        console.log(this.busLocation);
        this.updateBusLocations();
      });
    }
    ngOnDestroy(): void {
      if (this.liveBusSubscription) {
        // this.liveBus.sendMessage('vehiclePositionsClosed', {})
        this.liveBusSubscription.unsubscribe();
      }
      // this.clearMarkers();
    }

    ngAfterViewInit(): void {
      this.initMap();
      setTimeout(() => {
        this.liveBus.sendMessage('vehiclePositions', {});
    }, 10000)
    }
  
    initMap(): void {
        const mapOptions: google.maps.MapOptions = {
          center: new google.maps.LatLng(45.5016728, -73.5736054),
          zoom: 15,
          styles: [
            ...this.mapStyles,
            ...this.darkModeStyles,
          ],
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        };
  
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    }

    private updateBusLocations(): void {
      for (const key in this.busLocation) {
        const bus = this.busLocation[key];
        const lat = bus.position.latitude;
        const lng = bus.position.longitude;
  
        if (this.markers[key]) {
          this.markers[key].setPosition({ lat, lng });
          this.markers[key].setTitle(`Bus ID: ${key}`);
        } else {
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: this.map,
            title: `Bus ID: ${key}`,
            icon: this.markerIcon,
          });
  
          this.markers[key] = marker;
        }
        this.markerData[key] = {
          id: key,
          lat: lat,
          lng: lng,
          status: bus.currentStatus,
          occupancy: bus.occupancyStatus,
          timeDiff: bus.timeDifference,
        };
      }
    }

    getMarkerKeys(): string[] {
      return Object.keys(this.markerData);
    }
    
    private markerIcon: google.maps.Icon = {
      url: '../../assets/images/bus-stop-icon.png',
      scaledSize: new google.maps.Size(32, 32), 
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(16, 32)
    };
}
