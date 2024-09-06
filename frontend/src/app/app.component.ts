import { Component, computed, Renderer2, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
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

  sidenavWidth = computed(() => this.collapsed() ? '65px' : '250px');

  private isLightModeSubscription: Subscription | undefined;

  constructor(private router: Router, private webSocket: WebSocketService, private themeService: ThemeService, private renderer: Renderer2) {}

  ngOnInit() :void {
    if (performance.navigation?.type === performance.navigation?.TYPE_RELOAD) {
      console.log('Page was reloaded');
      this.router.navigate(['/']);
    }
    this.isLightModeSubscription = this.themeService.isLightMode$.subscribe(isLightMode => {
      if (isLightMode) {
        this.renderer.addClass(document.body, 'light-mode');
      } else {
        this.renderer.removeClass(document.body, 'light-mode');
      }
    });
  }

  ngOnDestroy(): void {
    this.webSocket.closeConnection();
    if (this.isLightModeSubscription) {
      this.isLightModeSubscription.unsubscribe();
    }
  }
}
