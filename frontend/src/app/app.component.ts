import { Component, computed, Inject, Renderer2, signal, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LiveBusComponent } from './live-bus/live-bus.component';
import { CustomSidenavComponent } from "./custom-sidenav/custom-sidenav.component";
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { WebSocketService } from './services/websocket.service';
import { ThemeService } from './services/theme.service';
import { Subscription } from 'rxjs';
import { LocationService } from './services/location.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, GoogleMapsModule, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, LiveBusComponent, CustomSidenavComponent],
  // providers: [provideHttpClient(withFetch())],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  title = 'BusTracker';
  collapsed = signal(true);
  isBrowser: boolean;

  //REPLACE IT WITH YOUR API KEY
  GoogleAPIKEY = environment.GoogleAPIKEY;

  sidenavWidth = computed(() => {
    if (this.isBrowser) {
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        return this.collapsed() ? '0' : '100%';
      } else {
        return this.collapsed() ? '65px' : '250px';
      }
    }
    return '0';
  });
  

  private isLightModeSubscription: Subscription | undefined;

  isWebSocketError: boolean = false;

  clientCoords: GeolocationCoordinates | null = null;

  userTheme: 'dark' | 'light' | null = null;

  constructor(
    private router: Router, 
    private webSocket: WebSocketService, 
    private themeService: ThemeService, 
    private renderer: Renderer2, 
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private locationService: LocationService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() :void {
    this.userTheme = this.themeService.getUserThemePreference();
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleMaps();
    }
    if (performance.navigation?.type === performance.navigation?.TYPE_RELOAD) {
      // console.log('Page was reloaded');
      this.router.navigate(['/']);
    }
    this.isLightModeSubscription = this.themeService.isLightMode$.subscribe(isLightMode => {
      if (isLightMode) {
        this.renderer.addClass(this.document.body, 'light-mode');
        const elements = this.document.querySelectorAll('.background-image');
        elements.forEach(el => this.renderer.addClass(el, 'no-invert'));
      } else {
        this.renderer.removeClass(this.document.body, 'light-mode');
        const elements = this.document.querySelectorAll('.background-image');
        elements.forEach(el => this.renderer.removeClass(el, 'no-invert'));
      }
    });
    this.webSocket.error$.subscribe(errorMessage => {
      this.isWebSocketError = true;
    });
    this.locationService.getUserLocation().then((coords) => {
      if (coords) {
        this.clientCoords = coords;
      }
    }).catch((error) => {
      console.log('Error retrieving user location');
    });
    if (this.isBrowser) {
      window.addEventListener('resize', this.handleResize);
    }
  }
  loadGoogleMaps(): void {
    if (!document.getElementById('google-maps-script')) {
      const script = this.renderer.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.GoogleAPIKEY}&loading=async&libraries=places`;
      script.async = true;
      script.defer = true;
      this.renderer.appendChild(document.body, script);
    }
  }
  ngAfterViewInit() {
    if(this.userTheme !== 'dark') {
      this.renderer.addClass(this.document.body, 'light-mode');
      const elements = this.document.querySelectorAll('.background-image');
      elements.forEach(el => this.renderer.addClass(el, 'no-invert'));
    }
  }
  
  ngOnDestroy(): void {
    this.webSocket.closeConnection();
    if (this.isLightModeSubscription) {
      this.isLightModeSubscription.unsubscribe();
    }
    if (this.isBrowser) {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  handleResize = () => {
    this.collapsed.set(this.collapsed());
  };
}
