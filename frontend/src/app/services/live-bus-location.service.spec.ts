import { TestBed } from '@angular/core/testing';

import { LiveBusLocationService } from './live-bus-location.service';

describe('LiveBusLocationService', () => {
  let service: LiveBusLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveBusLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
