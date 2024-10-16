import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { SchedulerComponent } from './scheduler.component';
import { StopsService } from '../services/stops.service';
import { BusService } from '../services/bus.service';
import { LocationService } from '../services/location.service';
import { Subject } from 'rxjs';

describe('SchedulerComponent', () => {
  let component: SchedulerComponent;
  let fixture: ComponentFixture<SchedulerComponent>;
  let mockStopsService: jasmine.SpyObj<StopsService>;
  let mockBusService: jasmine.SpyObj<BusService>;
  let mockLocationService: jasmine.SpyObj<LocationService>;

  const mockButtonClick$ = new Subject<string>();
  const mockTripData = {
    "123": [
      { id: "1", arrival: { time: "1600" }, scheduleRelationship: "scheduled", routeId: "A1", direction: "north" }
    ]
  };

  beforeEach(waitForAsync(() => {
    mockStopsService = jasmine.createSpyObj('StopsService', ['buttonClick$', 'getParsedData', 'getNearbyStops', 'addMarkers'], {
      buttonClick$: mockButtonClick$.asObservable(),
    });
    mockBusService = jasmine.createSpyObj('BusService', ['getMessages', 'sendMessage']);
    mockLocationService = jasmine.createSpyObj('LocationService', ['addMarker', 'watchUserLocation']);

    TestBed.configureTestingModule({
      imports: [GoogleMapsModule, CommonModule],
      declarations: [SchedulerComponent],
      providers: [
        { provide: StopsService, useValue: mockStopsService },
        { provide: BusService, useValue: mockBusService },
        { provide: LocationService, useValue: mockLocationService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize map and autocomplete', () => {
    spyOn(component, 'initMap');
    spyOn(component, 'initAutocomplete');

    component.ngAfterViewInit();

    expect(component.initMap).toHaveBeenCalled();
    expect(component.initAutocomplete).toHaveBeenCalled();
  });

  it('should update tripData and call updateGroupedTripData on receiving messages', () => {
    const tripUpdatesSubject = new Subject<any>();
    mockBusService.getMessages.and.returnValue(tripUpdatesSubject.asObservable());
    spyOn(component, 'updateGroupedTripData');

    component.ngOnInit();
    tripUpdatesSubject.next({ 'Trip Updates': mockTripData });

    expect(component.tripData).toEqual(mockTripData);
    expect(component.updateGroupedTripData).toHaveBeenCalled();
  });

  it('should initialize groupedTripData correctly when updateGroupedTripData is called', () => {
    component.tripData = mockTripData;
    component.updateGroupedTripData();

    expect(component.groupedTripData).toEqual({
      "A1": {
        "north": {
          data: [
            { id: "1", arrivalTime: 1600, relationship: "scheduled", routeId: "A1", direction: "north" }
          ]
        }
      }
    });
  });

  it('should unsubscribe from subscriptions on destroy', () => {
    component.ngOnInit();
    const buttonClickSubscriptionSpy = spyOn(component.buttonClickSubscription!, 'unsubscribe');
    const tripUpdatesSubscriptionSpy = spyOn(component.tripUpdatesSubscription!, 'unsubscribe');

    component.ngOnDestroy();

    expect(buttonClickSubscriptionSpy).toHaveBeenCalled();
    expect(mockBusService.sendMessage).toHaveBeenCalledWith('tripUpdatesClosed', {});
    expect(tripUpdatesSubscriptionSpy).toHaveBeenCalled();
  });

  it('should handle button clicks correctly', () => {
    spyOn(component, 'showOption');
    mockStopsService.getNearbyStops.and.returnValue(['stop1', 'stop2']);

    component.handleButtonClick('stop123');

    expect(component.showOption).toHaveBeenCalledWith('busNearYou');
    expect(mockStopsService.getNearbyStops).toHaveBeenCalledWith('stop123', 250);
    expect(mockBusService.sendMessage).toHaveBeenCalledWith('tripUpdates', { dataArray: ['stop1', 'stop2'] });
  });


  it('should format date and time correctly on initialization', () => {
    const now = new Date();
    component.ngOnInit();

    expect(component.currentDate).toEqual(now.toISOString().split('T')[0]);
    expect(component.currentTime).toEqual(now.toTimeString().slice(0, 5));
  });
});
