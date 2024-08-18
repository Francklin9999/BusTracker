import { Component, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, GoogleMapsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  title = 'BusTracker';
}
