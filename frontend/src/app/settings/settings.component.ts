import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Location } from '@angular/common';
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
  ignoreFirstClick = true;

  constructor( 
    private themeService: ThemeService,
    private location: Location 
  ) {}

  onToggleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.toggleMode(target.checked);
    }
  }

  toggleMode(value: boolean): void {
    if (value == null) {
      return;
    }
    this.themeService.toggleLightMode(value);
  }

  closeSettings(): void {
    this.isSettingsVisible = false;
    this.location.back();
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (this.ignoreFirstClick) {
      this.ignoreFirstClick = false;
      return;
    }

    const target = event.target as HTMLElement;
    if (this.isSettingsVisible && !target.closest('.container')) {
      this.closeSettings();
    }
  }

  ngOnInit() {
    setTimeout(() => {
      this.ignoreFirstClick = false;
    }, 100);
  }
}