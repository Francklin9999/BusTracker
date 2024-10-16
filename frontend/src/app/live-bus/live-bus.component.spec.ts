import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LiveBusComponent } from './live-bus.component';
import { LiveBusLocationService } from '../services/live-bus-location.service';
import { BusService } from '../services/bus.service';
import { StopsService } from '../services/stops.service';
import { LocationService } from '../services/location.service';
import { of } from 'rxjs';
import { ElementRef } from '@angular/core';

const mockLiveBusLocationService = {
  getMessages: jasmine.createSpy('getMessages').and.returnValue(of({})),
  sendMessage: jasmine.createSpy('sendMessage'),
};

const mockBusService = {
  getMessages: jasmine.createSpy('getMessages').and.returnValue(of({})),
  sendMessage: jasmine.createSpy('sendMessage'),
};

const mockStopsService = {
  buttonClick$: of(''),
  getParsedData: jasmine.createSpy('getParsedData').and.returnValue(of({})),
  getNearbyStopsByLocation: jasmine.createSpy('getNearbyStopsByLocation').and.returnValue([]),
};

const mockLocationService = {
  addMarker: jasmine.createSpy('addMarker'),
  watchUserLocation: jasmine.createSpy('watchUserLocation'),
};

describe('LiveBusComponent', () => {
  let component: LiveBusComponent;
  let fixture: ComponentFixture<LiveBusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [LiveBusComponent],
      providers: [
        { provide: LiveBusLocationService, useValue: mockLiveBusLocationService },
        { provide: BusService, useValue: mockBusService },
        { provide: StopsService, useValue: mockStopsService },
        { provide: LocationService, useValue: mockLocationService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveBusComponent);
    component = fixture.componentInstance;
    component.mapElement = new ElementRef(document.createElement('div'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize map on ngAfterViewInit', () => {
    spyOn(component, 'initMap');
    component.ngAfterViewInit();
    expect(component.initMap).toHaveBeenCalled();
  });

  it('should subscribe to live bus location updates on ngOnInit', () => {
    component.ngOnInit();
    expect(mockLiveBusLocationService.getMessages).toHaveBeenCalled();
  });

  it('should unsubscribe from live bus location on ngOnDestroy', () => {
    component.ngOnInit();
    component.ngOnDestroy();
    expect(mockLiveBusLocationService.sendMessage).toHaveBeenCalledWith('vehiclePositionsClosed', {});
  });


  it('should update bus locations when receiving messages', () => {
    const mockMessage = {
      vehiclePositions: JSON.stringify({
        'bus1': {
          position: { latitude: 45.5, longitude: -73.6 },
          timeDifference: 30,
        },
      }),
    };
    mockLiveBusLocationService.getMessages.and.returnValue(of(mockMessage));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.busLocation).toEqual(JSON.parse(mockMessage.vehiclePositions));
  });

  it('should remove stale markers', () => {
    component.markerData = {
      'bus1': { timeDiff: Math.floor(Date.now() / 1000) - 70 },
    };
    component.markers['bus1'] = new google.maps.Marker();
    spyOn(component.markers['bus1'], 'setMap');
    component.removeStaleMarkers();
    expect(component.markers['bus1'].setMap).toHaveBeenCalledWith(null);
  });

});
