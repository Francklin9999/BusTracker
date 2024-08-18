import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
// import { environment } from '../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { StopsService } from '../services/stops.service';

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

  map!: google.maps.Map;
  departureAutocomplete!: google.maps.places.Autocomplete;
  arrivalAutocomplete!: google.maps.places.Autocomplete;
  directionsService!: google.maps.DirectionsService;
  directionsRenderer!: google.maps.DirectionsRenderer;
  selectedOption: any = 'whereToGo';
  
  constructor(private sanitizer: DomSanitizer, private stopsService: StopsService) {}

  zoom = 12;
  center: google.maps.LatLngLiteral = { lat: 45.502181, lng: -73.660779 };
  options: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true
  };


  ngAfterViewInit(): void {
    this.initMap();
    this.initAutocomplete();
    // this.stopsService.getParsedData().subscribe((data: any) => {
    //   this.busStops = Object.values(data);
    // },
    // (error: any) => {
    //   console.error('Error fetchong or parsing csv bus stops data', error);
    //   });

    // if (typeof google !== 'undefined' && google.maps) {
    // this.markerIcon = {
    //   url: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="black" stroke-width="2" fill="red"/></svg>'),
    //   scaledSize: new google.maps.Size(5, 5), 
    //   anchor: new google.maps.Point(1, 2)
    //   };
    // }
  }

  initMap(): void {
      const mapOptions: google.maps.MapOptions = {
        center: new google.maps.LatLng(45.5016728, -73.5736054),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.directionsRenderer = new google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(this.map);
  }

  initAutocomplete(): void {
    this.departureAutocomplete = new google.maps.places.Autocomplete(this.departureLocationInput.nativeElement);
    this.arrivalAutocomplete = new google.maps.places.Autocomplete(this.arrivalLocationInput.nativeElement);

    this.departureAutocomplete.setTypes(['establishment']);
    this.departureAutocomplete.setFields(['place_id', 'geometry', 'name']);
    this.arrivalAutocomplete.setTypes(['establishment']);
    this.arrivalAutocomplete.setFields(['place_id', 'geometry', 'name']);
  }

  showOption(value: string) {
    this.selectedOption = value;
  }

  handleClick() {
    const departurePlace = this.departureAutocomplete.getPlace();
    const arrivalPlace = this.arrivalAutocomplete.getPlace();
  
    if (!departurePlace || !arrivalPlace || !departurePlace.geometry?.location || !arrivalPlace.geometry?.location) {
      console.error('One or both of the places are not selected or locations are undefined');
      return;
    }
  
    this.directionsService = new google.maps.DirectionsService();
    this.directionsService.route({
      origin: departurePlace.geometry.location,
      destination: arrivalPlace.geometry.location,
      travelMode: google.maps.TravelMode.TRANSIT,
    }, 
    (response: any, status: any) => {
      if (status === "OK") {
        this.directionsRenderer.setDirections(response);
      } else {
        console.error(`Directions request failed due to ${status}`);
      }
    });
  }
}