import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CustomSidenavComponent } from './custom-sidenav.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

describe('CustomSidenavComponent', () => {
  let component: CustomSidenavComponent;
  let fixture: ComponentFixture<CustomSidenavComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatListModule,
        MatIconModule,
        RouterTestingModule,
        CustomSidenavComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSidenavComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with sideNavCollapsed as true', () => {
    expect(component.sideNavCollapsed()).toBeTrue();
  });

  it('should update sideNavCollapsed when collapsed input changes', () => {
    component.collapsed = false;
    expect(component.sideNavCollapsed()).toBeFalse();
    
    component.collapsed = true;
    expect(component.sideNavCollapsed()).toBeTrue();
  });

  it('should compute profilePicSize based on sideNavCollapsed value', () => {
    expect(component.profilePicSize()).toBe('32');
    
    component.collapsed = false;
    fixture.detectChanges();
    expect(component.profilePicSize()).toBe('100');
  });

  it('should navigate to the correct route when redirectToHome is called', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.redirectToHome('home');
    expect(navigateSpy).toHaveBeenCalledWith(['home']);
  });

  it('should have default menu items', () => {
    expect(component.menuItems().length).toBe(5);
    expect(component.menuItems()[0].label).toBe('Welcome');
    expect(component.menuItems()[1].label).toBe('Scheduler');
  });
});
