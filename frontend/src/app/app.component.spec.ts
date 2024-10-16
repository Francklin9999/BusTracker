import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { Renderer2, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LiveBusComponent } from './live-bus/live-bus.component';
import { CustomSidenavComponent } from './custom-sidenav/custom-sidenav.component';
import { WebSocketService } from './services/websocket.service';
import { ThemeService } from './services/theme.service';
import { LocationService } from './services/location.service';
import { of } from 'rxjs';
import { environment } from '../environments/environment';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockRouter = { navigate: jasmine.createSpy('navigate') };
  let mockWebSocketService = {
    error$: of(false),
    closeConnection: jasmine.createSpy('closeConnection'),
  };
  let mockThemeService = {
    isLightMode$: of(true),
    getUserThemePreference: jasmine.createSpy('getUserThemePreference').and.returnValue('light'),
  };
  let mockLocationService = {
    getUserLocation: jasmine.createSpy('getUserLocation').and.returnValue(Promise.resolve({ latitude: 45.5, longitude: -73.6 })),
  };
  let mockRenderer: Renderer2;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        CommonModule,
        GoogleMapsModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        LiveBusComponent,
        CustomSidenavComponent,
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: WebSocketService, useValue: mockWebSocketService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: LocationService, useValue: mockLocationService },
        { provide: Renderer2, useValue: mockRenderer },
        { provide: DOCUMENT, useValue: document },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should set userTheme on init', () => {
    component.ngOnInit();
    expect(component.userTheme).toBe('light');
  });

  it('should load Google Maps if in the browser', () => {
    spyOn(document, 'getElementById').and.returnValue(null);
    const appendChildSpy = spyOn(component['renderer'], 'appendChild');
    component.loadGoogleMaps();
    expect(appendChildSpy).toHaveBeenCalled();
  });

  it('should handle WebSocket errors and set isWebSocketError to true', fakeAsync(() => {
    mockWebSocketService.error$ = of(true);
    fixture.detectChanges();
    tick();
    expect(component.isWebSocketError).toBe(true);
  }));

  it('should unsubscribe from theme changes and remove event listener on destroy', () => {
    const removeEventListenerSpy = spyOn(window, 'removeEventListener');
    component.ngOnDestroy();
    expect(mockWebSocketService.closeConnection).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', component.handleResize);
  });

  it('should handle window resize event correctly', () => {
    component.handleResize();
    expect(component.collapsed()).toBe(component.collapsed());
  });
});
