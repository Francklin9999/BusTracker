import { Component, ElementRef, AfterViewInit, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { StopsService } from '../services/stops.service';
import { BusService } from '../services/bus.service';
import { LocationService } from '../services/location.service';


@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent {
  @Input() clientCoords: GeolocationCoordinates | null = null;
  busStops: any[] = [];
  groupedTripData: { [key: string]: { [key: string]: { data: any[] } } } = {};
  markerIcon!: google.maps.Icon;
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  @ViewChild('departureLocation', { static: false }) departureLocationInput!: ElementRef;
  @ViewChild('arrivalLocation', { static: false }) arrivalLocationInput!: ElementRef;
  @ViewChild('departureDate', { static: false }) departureDateInput!: ElementRef;
  @ViewChild('departureTime', { static: false }) departureTimeInput!: ElementRef;

  map: google.maps.Map | any;
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
  

  routeDuration: string | undefined;
  routeDistance: string | undefined;
  steps: Array<{
    instructions: string;
    transitLine: string | undefined;
    arrivalTime: string | undefined;
    departureTime: string | undefined;
  }> = [];
  
  private buttonClickSubscription: Subscription | null = null;
  private tripUpdatesSubscription: Subscription | undefined;
  tripData: any = {};
  noTripData: boolean = true;

  selectedKey: string | null = null;

  isWebsocket: boolean | undefined;

  constructor(private busService: BusService, private cdr: ChangeDetectorRef, private stopsService: StopsService, private locationService: LocationService) {}

  ngOnInit(): void {
    this.buttonClickSubscription = this.stopsService.buttonClick$.subscribe(stopCode => {
      this.handleButtonClick(stopCode);
    });
    this.tripUpdatesSubscription = this.busService.getMessages().subscribe(message => {
      // console.log('Received WebSocket message:', message);
      this.tripData = message['Trip Updates'] || {};
      this.noTripData = (this.tripData.length === 0);
      this.updateGroupedTripData();
    });
    if (this.map && this.clientCoords) {
      this.map!.setCenter({ lat: this.clientCoords.latitude, lng: this.clientCoords.longitude });
      this.locationService.addMarker(this.map!, this.clientCoords);
      this.locationService.watchUserLocation(this.map!);
    }
  }

  ngOnDestroy(): void {
    if (this.buttonClickSubscription) {
      this.buttonClickSubscription.unsubscribe();
    }
    if (this.tripUpdatesSubscription) {
      this.busService.sendMessage('tripUpdatesClosed', {})
      this.tripUpdatesSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.initAutocomplete();
    this.stopsService.getParsedData().subscribe((data: any) => {
      this.busStops = Object.values(data);
      this.stopsService.addMarkers(this.map, data);
    },
    (error: any) => {
      console.error('Error fetching or parsing csv bus stops data', error);
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
      this.directionsRenderer = new google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(this.map);
  }

  initAutocomplete(): void {
    if(this.selectedOption === "whereToGo") {
      this.departureAutocomplete = new google.maps.places.Autocomplete(this.departureLocationInput.nativeElement);
      this.arrivalAutocomplete = new google.maps.places.Autocomplete(this.arrivalLocationInput.nativeElement);
      }
    }

  showOption(value: string) {
    this.selectedOption = value;
    if(value === "whereToGo")
    setTimeout(()=>
      this.initAutocomplete(), 100)
  }

  handleClick() {
    const departurePlace = this.departureAutocomplete.getPlace();
    const arrivalPlace = this.arrivalAutocomplete.getPlace();

    const departureDateTimeString = `${this.departureDateInput.nativeElement.value}T${this.departureTimeInput.nativeElement.value}`;
  
    if (!departurePlace || !arrivalPlace || !departurePlace.geometry?.location || !arrivalPlace.geometry?.location) {
      console.log('One or both of the places are not selected or locations are undefined');
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
  updateGroupedTripData() {
    this.groupedTripData = {};
  
    for (const stopId in this.tripData) {
      this.tripData[stopId].forEach((trip: any) => {
        console.log(trip)
        const id = trip.id;
        const arrivalTime = parseInt(trip.arrival.time, 10);
        const relationship = trip.scheduleRelationship;
        const routeId = trip.routeId;
        const direction = trip.direction;

        const newTrip = { id, arrivalTime, relationship, routeId, direction }

        if (!this.groupedTripData[routeId]) {
          this.groupedTripData[routeId] = {};
        }
  
        if (!this.groupedTripData[routeId][direction]) {
          this.groupedTripData[routeId][direction] = { data: [] };
        }
  
        this.groupedTripData[routeId][direction].data.push(newTrip);
      });
    }
  
    for (const routeId in this.groupedTripData) {
      for (const direction in this.groupedTripData[routeId]) {
        this.groupedTripData[routeId][direction].data.sort((a: any, b: any) => a.arrivalTime - b.arrivalTime);
      }
    }
  }  

  getDirections(routeId: string): string[] {
    return Object.keys(this.groupedTripData[routeId]);
  }
  
  getRouteIds(stopId: string): string[] {
    return Object.keys(this.tripData[stopId].reduce((acc: any, trip: any) => {
      console.log(trip)
      acc[trip.routeId] = true;
      return acc;
    }, {}));
  }  

  handleButtonClick(stopCode: string): void {
    // console.log(`Button clicked for stop: ${stopCode}`);
    this.showOption('busNearYou');
    const nearbyStops = this.stopsService.getNearbyStops(stopCode, 250);
    // console.log('Nearby stops:', nearbyStops);
    this.cdr.detectChanges();
    this.busService.sendMessage('tripUpdates', { dataArray: nearbyStops });
  }

  getStopIds(): string[] {
    return Object.keys(this.tripData);
  }

  toggleDropdown(key: string): void {
    this.selectedKey = this.selectedKey === key ? null : key;
  }

  getBusStopName(stopId: string): string {
    const busStop = this.busStops.find(stop => stop.stop_id == stopId);
    return busStop ? busStop.stop_name : 'Unknown Stop';
  }
  
}