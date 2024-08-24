import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LiveBusComponent } from './live-bus/live-bus.component';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { StatusComponent } from './status/status.component'; 

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: HomeComponent,
    },
    {
        path: 'trip',
        component: SchedulerComponent,
    },
    {
        path: 'map',
        component: LiveBusComponent,
    },
    {
        path: 'status',
        component: StatusComponent,
    }
];
