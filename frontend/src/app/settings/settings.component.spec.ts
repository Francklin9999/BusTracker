import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { Location } from '@angular/common';
import { ThemeService } from '../services/theme.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let locationSpy: jasmine.SpyObj<Location>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    locationSpy = jasmine.createSpyObj('Location', ['back']);
    themeServiceSpy = jasmine.createSpyObj('ThemeService', ['toggleLightMode']);

    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [
        { provide: Location, useValue: locationSpy },
        { provide: ThemeService, useValue: themeServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize `isSettingsVisible` as true', () => {
    expect(component.isSettingsVisible).toBeTrue();
  });

  it('should not call `toggleLightMode` when the target is null', () => {
    component.onToggleChange({ target: null } as Event);
    expect(themeServiceSpy.toggleLightMode).not.toHaveBeenCalled();
  });

  it('should set `isSettingsVisible` to false and call `location.back` when `closeSettings` is called', () => {
    component.closeSettings();
    expect(component.isSettingsVisible).toBeFalse();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should set `ignoreFirstClick` to false after 100ms in `ngOnInit`', fakeAsync(() => {
    component.ngOnInit();
    expect(component.ignoreFirstClick).toBeTrue();
    tick(100);
    expect(component.ignoreFirstClick).toBeFalse();
  }));

  it('should ignore the first click event', () => {
    component.ignoreFirstClick = true;
    component.onClick(new MouseEvent('click'));
    expect(component.ignoreFirstClick).toBeFalse();
    expect(locationSpy.back).not.toHaveBeenCalled();
  });

  it('should call `closeSettings` when clicking outside of `.container`', () => {
    spyOn(component, 'closeSettings');
    const mockEvent = new MouseEvent('click');
    const mockElement = document.createElement('div');
    mockElement.classList.add('outside');
    spyOnProperty(mockEvent, 'target', 'get').and.returnValue(mockElement);

    component.isSettingsVisible = true;
    component.onClick(mockEvent);
    expect(component.closeSettings).toHaveBeenCalled();
  });

  it('should not call `closeSettings` when clicking inside `.container`', () => {
    spyOn(component, 'closeSettings');
    const mockEvent = new MouseEvent('click');
    const mockElement = document.createElement('div');
    mockElement.classList.add('container');
    spyOnProperty(mockEvent, 'target', 'get').and.returnValue(mockElement);

    component.isSettingsVisible = true;
    component.onClick(mockEvent);
    expect(component.closeSettings).not.toHaveBeenCalled();
  });
});
