import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveBusComponent } from './live-bus.component';

describe('LiveBusComponent', () => {
  let component: LiveBusComponent;
  let fixture: ComponentFixture<LiveBusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveBusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveBusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
