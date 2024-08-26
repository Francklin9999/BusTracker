import { Component, ElementRef, ViewChild } from '@angular/core';
import { LiveBusLocationService } from '../services/live-bus-location.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { BusService } from '../services/bus.service';
import { StopsService } from '../services/stops.service';
@Component({
  selector: 'app-live-bus',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './live-bus.component.html',
  styleUrl: './live-bus.component.scss'
})
export class LiveBusComponent {

  private liveBusSubscription: Subscription | undefined;
  isLocation: boolean = false;
  busLocation: any = [];
  markers: { [key: string]: google.maps.Marker } = {};
  markerData: { [key: string]: any } = {};
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map: google.maps.Map | any;

  private buttonClickSubscription: Subscription | null = null;
  private messageSubscription: Subscription | undefined;
  tripData: any = {};
  noTripData: boolean = true;

  busStops: any[] | null = null;

  selectedKey: string | null = null;

  location = {
    lat: 0,
    lng: 0,
  }

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

  occupancyMap: { [key: string ]: string } = {
    "MANY_SEATS_AVAILABLE" : "Many seats available",
    "FEW_SEATS_AVAILABLE" : "Few seats available",
    "STANDING_ROOM_ONLY" : "Standing places left",
  }

  statusMap: { [key: string]: string } = {
    "IN_TRANSIT_TO" : "Moving",
    "STOPPED_AT" : "Stopped",
  }

  constructor(private liveBus: LiveBusLocationService, private busService: BusService, private stopsService: StopsService)  {}


    ngOnInit(): void {
      this.liveBusSubscription = this.liveBus.getMessages().subscribe(message => {
        // console.log('Received WebSocket message:', message);
        this.busLocation = JSON.parse(message['vehiclePositions'] || {});
        // console.log(this.busLocation);
        this.updateBusLocations();
      });
      this.buttonClickSubscription = this.stopsService.buttonClick$.subscribe(stopCode => {
        // this.handleButtonClick(stopCode);
      });
      this.messageSubscription = this.busService.getMessages().subscribe(message => {
        // console.log('Received WebSocket message:', message);
        this.tripData = message['Trip Updates'] || {};
        this.noTripData = (this.tripData.length === 0);
        // console.log(this.tripData);
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
      this.stopsService.getParsedData().subscribe((data: any) => {
        this.busStops = Object.values(data);
      },
      (error: any) => {
        console.error('Error fetching or parsing csv bus stops data', error);
        });
      this.liveBus.getWebSocket().subscribe((ws) => {
        if (ws) {
          this.liveBus.sendMessage('vehiclePositions', {});
        }
      });
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

        let currentMarker: google.maps.Marker | null = null;

        this.map.addListener("click", (event: any) => {
          const clickedLocation = event.latLng;
          const lat = clickedLocation.lat();
          const lng = clickedLocation.lng();

          this.location.lat = lat;
          this.location.lng = lng;

          if (currentMarker) {
            currentMarker.setMap(null);
        }
        
          currentMarker = new google.maps.Marker({
            position: clickedLocation,
            map: this.map,
        });
        this.isLocation = true;
        const nearbyStops = this.stopsService.getNearbyStopsByLocation(lat, lng, 250);
        // console.log('Nearby stops:', nearbyStops);
        this.busService.sendMessage('tripUpdates', { dataArray: nearbyStops });
      });
    }

    private updateBusLocations(): void {
      for (const key in this.busLocation) {
        const bus = this.busLocation[key];
        if (this.checkTimeDifference(bus.timeDifference) > 120) continue;
        const lat = bus.position.latitude;
        const lng = bus.position.longitude;
        const currentStatus = this.statusMap[bus.currentStatus] || bus.currentStatus;
        const occupancy = this.occupancyMap[bus.occupancyStatus] || bus.occupancyStatus;
        const tripId = bus.tripId;

        const infoWindowContent = `
          <div>Line: <strong>${key}</strong></div>
          <br/>
          <div>Status: <strong>${currentStatus}</strong></div>
          <br/>
          <div>Occupancy: <strong>${occupancy}</strong></div>
          <br/>
          <div>Last update: <strong>${this.calculateTimeDifference(bus.timeDifference)} </strong></div>
          <br/>
          <div>Trip Id: <strong>${tripId}</strong></div>
        `;
  
        if (this.markers[key]) {
          this.markers[key].setPosition({ lat, lng });
          this.markers[key].setTitle(`Bus ID: ${key}`);

          const infoWindow = this.markers[key].get('infoWindow');

          if (infoWindow) {
            infoWindow.setContent('');
            infoWindow.setContent(infoWindowContent);
          } 

        } else {
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: this.map,
            title: `Bus ID: ${key}`,
            icon: this.markerIcon,
          });

          const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent,
          });

          marker.addListener('mouseover', () => {
            infoWindow.open(this.map, marker);
          });
    
          marker.addListener('mouseout', () => {
            infoWindow.close();
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
      url: '../../assets/images/live-bus-icon.png',
      scaledSize: new google.maps.Size(32, 32), 
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(16, 32)
    };

    private calculateTimeDifference(timestamp: number): string {
      const now = Math.floor(Date.now() / 1000);
    
      const difference = now - timestamp;
    
      if (difference < 60) {
        return `${difference} seconds ago`;
      } else {
        const minutes = Math.round(difference / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
    }

    private checkTimeDifference(timestamp: number): number {
      const now = Math.floor(Date.now() / 1000);
    
      return now - timestamp;
  }

  isRealTimeBus(busNumber: any): boolean {
    const number = parseInt(busNumber);
    if(this.markers[number]) {
      return true;
    }
    return false;
  }
  getKeys(obj: object): string[] {
    return Object.keys(obj);
  }

  toggleDropdown(key: string): void {
    this.selectedKey = this.selectedKey === key ? null : key;
  }

  getBusStopName(stopId: string): string {
    const busStop = this.busStops?.find(stop => stop.stop_id == stopId);
    return busStop ? busStop.stop_name : 'Unknown Stop';
  }

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
