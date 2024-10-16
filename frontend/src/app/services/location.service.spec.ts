import { TestBed } from '@angular/core/testing';
import { LocationService } from './location.service';

describe('LocationService', () => {
  let service: LocationService;
  let mockMap: any;
  let mockMarker: any;

  beforeEach(() => {
    mockMap = {
      setCenter: jasmine.createSpy('setCenter'),
    };

    mockMarker = {
      setPosition: jasmine.createSpy('setPosition'),
    };

    (window as any).google = {
      maps: {
        LatLng: jasmine.createSpy('LatLng').and.callFake(() => ({})),
        Marker: jasmine.createSpy('Marker').and.callFake(() => mockMarker),
      },
    };

    TestBed.configureTestingModule({
      providers: [LocationService],
    });

    service = TestBed.inject(LocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('should get user location', (done) => {
  //   const mockPosition = {
  //     coords: {
  //       latitude: 45.4215,
  //       longitude: -75.6972,
  //     },
  //   };

  //   spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((success) => {
  //     success(mockPosition);
  //   });

  //   service.getUserLocation().then((coords) => {
  //     expect(coords).toEqual(mockPosition.coords);
  //     done();
  //   });
  // });

  // it('should handle error when getting user location', (done) => {
  //   const mockError = new Error('Permission denied');

  //   spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((_, error) => {
  //     error(mockError);
  //   });

  //   service.getUserLocation().catch((error) => {
  //     expect(error).toEqual(mockError);
  //     done();
  //   });
  // });

  // it('should add a marker to the map', () => {
  //   const coords = { latitude: 45.4215, longitude: -75.6972 };

  //   service.addMarker(mockMap, coords);

  //   expect(mockMarker.setPosition).not.toHaveBeenCalled();
  //   expect(window.google.maps.Marker).toHaveBeenCalledWith({
  //     position: jasmine.any(Object), 
  //     map: mockMap,
  //     title: 'Your Location',
  //   });
  // });

  // it('should update marker position', () => {
  //   const coords = { latitude: 45.4215, longitude: -75.6972 };

  //   service.addMarker(mockMap, coords);

  //   const newCoords = { latitude: 45.4216, longitude: -75.6973 };
  //   service.updateMarker(newCoords);

  //   expect(mockMarker.setPosition).toHaveBeenCalled();
  //   expect(mockMarker.setPosition).toHaveBeenCalledWith(jasmine.any(Object)); 
  // });

  // it('should watch user location', () => {
  //   const mockPosition = {
  //     coords: {
  //       latitude: 45.4215,
  //       longitude: -75.6972,
  //     },
  //   };

  //   spyOn(navigator.geolocation, 'watchPosition').and.callFake((success) => {
  //     success(mockPosition);
  //   });

  //   service.watchUserLocation(mockMap);

  //   expect(mockMap.setCenter).toHaveBeenCalledWith({
  //     lat: mockPosition.coords.latitude,
  //     lng: mockPosition.coords.longitude,
  //   });
  //   expect(mockMarker.setPosition).toHaveBeenCalledWith(jasmine.any(Object)); 
  // });
});
