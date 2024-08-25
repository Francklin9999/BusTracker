import { Component, computed, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';


export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
}

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, RouterModule],
  templateUrl: './custom-sidenav.component.html',
  styleUrl: './custom-sidenav.component.scss'
})
export class CustomSidenavComponent {

  sideNavCollapsed = signal(true);
  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }

  menuItems = signal<MenuItem[]>([
    {
      icon: 'dashboard',
      label: 'Welcome',
      route: 'home',
    },
    {
      icon: 'calendar_today',
      label: 'Scheduler',
      route: 'trip',
    },
    {
      icon: 'live_tv',
      label: 'Live Updates',
      route: 'map',
    },
    {
      icon: 'info',
      label: 'Service Status',
      route: 'status',
    },
    {
      icon: 'settings',
      label: 'Settings',
      route: 'settings',
    },
  ]);

  constructor(private router: Router) {}

  profilePicSize = computed(() => this.sideNavCollapsed() ? '32' : '100');


  redirectToHome(path: string) {
    this.router.navigate([path]);
  }
}
