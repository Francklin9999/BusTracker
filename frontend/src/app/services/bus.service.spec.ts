import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BusService } from './bus.service';
import { WebSocketService } from './websocket.service';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

describe('BusService', () => {
  let service: BusService;
  let httpMock: HttpTestingController;
  let mockWebSocketService: jasmine.SpyObj<WebSocketService>;

  beforeEach(() => {
    mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['getMessages', 'sendMessage']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BusService,
        { provide: WebSocketService, useValue: mockWebSocketService }
      ],
    });

    service = TestBed.inject(BusService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get nearby buses', () => {
    const location = 'some-location';
    const expectedBuses = [{ id: 1, name: 'Bus 1' }, { id: 2, name: 'Bus 2' }];
    
    service.getBusesNear(location).subscribe((buses) => {
      expect(buses).toEqual(expectedBuses);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/bus-near?location=${encodeURIComponent(location)}`);
    expect(req.request.method).toBe('GET');
    req.flush(expectedBuses);
  });

  it('should send a message via WebSocket', () => {
    const action = 'testAction';
    const params = { key: 'value' };

    service.sendMessage(action, params);
    expect(mockWebSocketService.sendMessage).toHaveBeenCalledWith(action, params);
  });

  it('should handle incoming WebSocket messages', () => {
    const message = { data: 'some message' };
    
    mockWebSocketService.getMessages.and.returnValue(of(message));
    
    service.getMessages().subscribe((msg) => {
      expect(msg).toEqual(message);
    });

    mockWebSocketService.getMessages().subscribe();
  });
});
