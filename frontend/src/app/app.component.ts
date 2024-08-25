import { Component, computed, signal } from '@angular/core';
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
}
