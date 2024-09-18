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
import { provideHttpClient, withFetch } from '@angular/common/http';
import { Router } from '@angular/router';
import { WebSocketService } from './services/websocket.service';
import { ThemeService } from './services/theme.service';
import { Subscription } from 'rxjs';

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

  //REPLACE IT WITH YOUR API KEY
  yourGoogleAPIKEY = 'AIzaSyAvA_6QVheDXXUhvT6nG5LBLBaIfCeZYWQ';

  sidenavWidth = computed(() => this.collapsed() ? '65px' : '250px');

  private isLightModeSubscription: Subscription | undefined;

  isWebSocketError: boolean = false;

  constructor(
    private router: Router, 
    private webSocket: WebSocketService, 
    private themeService: ThemeService, 
    private renderer: Renderer2, 
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() :void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleMaps();
    }
    if (performance.navigation?.type === performance.navigation?.TYPE_RELOAD) {
      console.log('Page was reloaded');
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
  }
  loadGoogleMaps(): void {
    if (!document.getElementById('google-maps-script')) {
      const script = this.renderer.createElement('script');
      script.id = 'google-maps-script';
      //THIS IS KEY DOES NOT WORK LOL I'M NOT DUMB FEEL FREE TO TRY IT
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.yourGoogleAPIKEY}&loading=async&libraries=places`;
      script.async = true;
      script.defer = true;
      this.renderer.appendChild(document.body, script);
    }
  }
  
  ngOnDestroy(): void {
    this.webSocket.closeConnection();
    if (this.isLightModeSubscription) {
      this.isLightModeSubscription.unsubscribe();
    }
  }
}
