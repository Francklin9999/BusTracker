import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusComponent } from './status.component';
import { StatusService } from '../services/status.service';
import { of } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;
  let statusServiceSpy: jasmine.SpyObj<StatusService>;

  beforeEach(async () => {
    statusServiceSpy = jasmine.createSpyObj('StatusService', ['getData']);

    await TestBed.configureTestingModule({
      declarations: [StatusComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule
      ],
      providers: [
        { provide: StatusService, useValue: statusServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize `myControl` with an empty string', () => {
    expect(component.myControl.value).toBe('');
  });

  it('should call `statusService.getData` and populate `dataMap` on initialization', () => {
    const mockData = { '1': 'Route 1', '2': 'Route 2' };
    statusServiceSpy.getData.and.returnValue(of(mockData));

    component.ngOnInit();
    expect(statusServiceSpy.getData).toHaveBeenCalled();
    expect(component.dataMap).toEqual(mockData);
    expect(component.filteredItems).toEqual(mockData);
    expect(component.noData).toBeFalse();
  });

  it('should set `noData` to true if `dataMap` is empty', () => {
    statusServiceSpy.getData.and.returnValue(of({}));

    component.ngOnInit();
    expect(statusServiceSpy.getData).toHaveBeenCalled();
    expect(component.noData).toBeTrue();
  });

  it('should filter options correctly', () => {
    component.options = ['1', '12', '123', '456'];
    const filteredOptions = component['_filter']('1');
    expect(filteredOptions).toEqual(['1', '12', '123']);
  });

  it('should update `filteredOptions` based on value changes in `myControl`', (done) => {
    component.ngOnInit();
    component.myControl.setValue('2');

    component.filteredOptions.subscribe(filtered => {
      expect(filtered).toContain('2');
      done();
    });
  });

  it('should return formatted date string correctly', () => {
    const dateStr = '2024-01-01T12:00:00';
    expect(component.formatDate(dateStr)).toBe(new Date(dateStr).toLocaleString());
  });

  it('should return "Not provided" if date string is null', () => {
    expect(component.formatDate(null)).toBe('Not provided');
  });

  it('should return keys of the map correctly', () => {
    const mockMap = { '1': 'Route 1', '2': 'Route 2' };
    expect(component.getKeys(mockMap)).toEqual(['1', '2']);
  });
});
