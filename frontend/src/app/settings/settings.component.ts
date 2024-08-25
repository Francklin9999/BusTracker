import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  isSettingsVisible = true; // Control visibility

  setMode(mode: string): void {
    // Implement your logic for setting day/night mode
    console.log(`Switching to ${mode} mode`);
  }

  closeSettings(): void {
    this.isSettingsVisible = false;
  }
}