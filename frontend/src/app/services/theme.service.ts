import { Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isLightModeSubject = new BehaviorSubject<boolean>(false);
  // isLightMode$ = this.isLightModeSubject.asObservable();

  private lightModeSubject = new BehaviorSubject<boolean>(false);
  isLightMode$ = this.lightModeSubject.asObservable();

  // toggleTheme() {
  //   this.isLightModeSubject.next(!this.isLightModeSubject.value);
  // }

  toggleLightMode(isLightMode: boolean): void {
    this.lightModeSubject.next(isLightMode);
  }
}