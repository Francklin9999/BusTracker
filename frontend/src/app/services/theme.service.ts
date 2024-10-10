import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private lightModeSubject = new BehaviorSubject<boolean>(false);
  isLightMode$ = this.lightModeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  getUserThemePreference(): 'dark' | 'light' | null {
    if (isPlatformBrowser(this.platformId)) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return null;
  }

  toggleLightMode(isLightMode: boolean): void {
    this.lightModeSubject.next(isLightMode);
  }
}
