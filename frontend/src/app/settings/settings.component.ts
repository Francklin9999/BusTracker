import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  isSettingsVisible = true; 

  constructor(private themeService: ThemeService) {}

  // toggleTheme() {
  //   this.themeService.toggleTheme();
  // }

  toggleMode(value: boolean): void {
    this.themeService.toggleLightMode(value);
  }

  closeSettings(): void {
    this.isSettingsVisible = false;
  }
}