import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isLightModeSubject = new BehaviorSubject<boolean>(false);
  isLightMode$ = this.isLightModeSubject.asObservable();

  toggleTheme() {
    this.isLightModeSubject.next(!this.isLightModeSubject.value);
  }
}