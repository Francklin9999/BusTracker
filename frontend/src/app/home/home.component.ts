import { Component, ElementRef, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { StopsService } from '../services/stops.service';
import { BusService } from '../services/bus.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  busStops: any[] = [];
  markerIcon!: google.maps.Icon;
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  @ViewChild('departureLocation', { static: false }) departureLocationInput!: ElementRef;
  @ViewChild('arrivalLocation', { static: false }) arrivalLocationInput!: ElementRef;
  @ViewChild('departureDate', { static: false }) departureDateInput!: ElementRef;
  @ViewChild('departureTime', { static: false }) departureTimeInput!: ElementRef;

  map!: google.maps.Map;
  departureAutocomplete!: google.maps.places.Autocomplete;
  arrivalAutocomplete!: google.maps.places.Autocomplete;
  directionsService!: google.maps.DirectionsService;
  directionsRenderer!: google.maps.DirectionsRenderer;
  selectedOption: string = 'whereToGo';
  mapStyles = [
    {
      featureType: "transit.station.bus",
      stylers: [{ visibility: "off" }]
    }
  ];

  routeDuration: string | undefined;
  routeDistance: string | undefined;
  steps: Array<{
    instructions: string;
    transitLine: string | undefined;
    arrivalTime: string | undefined;
    departureTime: string | undefined;
  }> = [];
  
  private buttonClickSubscription: Subscription | null = null;
  private messageSubscription: Subscription | undefined;
  tripData: any = {};

  constructor(private busService: BusService, private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer, private stopsService: StopsService) {}

  ngOnInit(): void {
    this.buttonClickSubscription = this.stopsService.buttonClick$.subscribe(stopCode => {
      this.handleButtonClick(stopCode);
    });
    this.messageSubscription = this.busService.getMessages().subscribe(message => {
      console.log('Received WebSocket message:', message);
      this.tripData = message['Trip Updates'] || {};
    });
  }

  ngOnDestroy(): void {
    if (this.buttonClickSubscription) {
      this.buttonClickSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.initAutocomplete();
    this.stopsService.getParsedData().subscribe((data: any) => {
      this.busStops = Object.values(data);
    },
    (error: any) => {
      console.error('Error fetchong or parsing csv bus stops data', error);
      });
  }

  initMap(): void {
      const mapOptions: google.maps.MapOptions = {
        center: new google.maps.LatLng(45.5016728, -73.5736054),
        zoom: 15,
        styles: this.mapStyles,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.directionsRenderer = new google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(this.map);
      this.stopsService.getParsedData().subscribe(stops => {
      this.stopsService.addMarkers(this.map, stops);
      });
  }

  initAutocomplete(): void {
    this.departureAutocomplete = new google.maps.places.Autocomplete(this.departureLocationInput.nativeElement);
    this.arrivalAutocomplete = new google.maps.places.Autocomplete(this.arrivalLocationInput.nativeElement);

    // this.departureAutocomplete.setTypes(['establishment']);
    // this.departureAutocomplete.setFields(['place_id', 'geometry', 'name']);
    // this.arrivalAutocomplete.setTypes(['establishment']);
    // this.arrivalAutocomplete.setFields(['place_id', 'geometry', 'name']);
  }

  showOption(value: string) {
    this.selectedOption = value;
  }

  handleClick() {
    const departurePlace = this.departureAutocomplete.getPlace();
    const arrivalPlace = this.arrivalAutocomplete.getPlace();

    const departureDateTimeString = `${this.departureDateInput}T${this.departureTimeInput}`;
  
    if (!departurePlace || !arrivalPlace || !departurePlace.geometry?.location || !arrivalPlace.geometry?.location) {
      console.error('One or both of the places are not selected or locations are undefined');
      return;
    }
  
    this.directionsService = new google.maps.DirectionsService();
    this.directionsService.route({
      origin: departurePlace.geometry.location,
      destination: arrivalPlace.geometry.location,
      travelMode: google.maps.TravelMode.TRANSIT,
      transitOptions: {
        departureTime: new Date(departureDateTimeString)
      }
    }, 
    (response: any, status: any) => {
      if (status === "OK") {
        this.directionsRenderer.setDirections(response);
        this.extractTransitDetails(response);
      } else {
        console.error(`Directions request failed due to ${status}`);
      }
    });
  }

  extractTransitDetails(response: google.maps.DirectionsResult) {
    if (response.routes.length > 0) {
      const route = response.routes[0];
      const legs = route.legs;

      this.routeDuration = legs[0]?.duration?.text;
      this.routeDistance = legs[0]?.distance?.text;

      this.steps = legs.flatMap(leg =>
        leg.steps.map(step => ({
          instructions: step.instructions,
          transitLine: step.transit?.line?.short_name,
          arrivalTime: step.transit?.arrival_time?.text,
          departureTime: step.transit?.departure_time?.text
        }))
      );
    }
  }

  handleButtonClick(stopCode: string): void {
    console.log(`Button clicked for stop: ${stopCode}`);
    this.showOption('busNearYou');
    const nearbyStops = this.stopsService.getNearbyStops(stopCode, 250);
    console.log('Nearby stops:', nearbyStops);
    this.cdr.detectChanges();
    this.busService.sendMessage('tripUpdates', { dataArray: nearbyStops });
  }

  getStopIds(): string[] {
    return Object.keys(this.tripData);
  }

  getBusStopName(stopId: string): string {
    const busStop = this.busStops.find(stop => stop.stop_id == stopId);
    return busStop ? busStop.stop_name : 'Unknown Stop';
  }
  
}