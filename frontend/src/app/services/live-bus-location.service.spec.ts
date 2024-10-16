import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LiveBusLocationService } from './live-bus-location.service';
import { WebSocketService } from './websocket.service';
import { Subject } from 'rxjs';

class MockWebSocketService {
  private messagesSubject = new Subject<any>();

  getMessages() {
    return this.messagesSubject.asObservable();
  }

  sendMessage(action: string, params: any) {
  }

  emitMessage(message: any) {
    this.messagesSubject.next(message);
  }
}

describe('LiveBusLocationService', () => {
  let service: LiveBusLocationService;
  let webSocketService: MockWebSocketService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    webSocketService = new MockWebSocketService();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LiveBusLocationService,
        { provide: WebSocketService, useValue: webSocketService },
      ],
    });

    service = TestBed.inject(LiveBusLocationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a message via WebSocket', () => {
    spyOn(webSocketService, 'sendMessage');

    const action = 'testAction';
    const params = { key: 'value' };
    service.sendMessage(action, params);

    expect(webSocketService.sendMessage).toHaveBeenCalledWith(action, params);
  });

  it('should receive messages from WebSocket', (done) => {
    const testMessage = { key: 'value' };

    service.getMessages().subscribe((message) => {
      expect(message).toEqual(testMessage);
      done();
    });

    webSocketService.emitMessage(testMessage);
  });

  // it('should add markers to the map', () => {
  //   const map = {
  //     getZoom: () => 10, 
  //     addListener: jasmine.createSpy('addListener'),
  //   };

  //   const stops = {
  //     '1': { stop_lat: 45.4215, stop_lon: -75.6972, stop_name: 'Stop 1', stop_code: '1' },
  //     '2': { stop_lat: 45.4216, stop_lon: -75.6973, stop_name: 'Stop 2', stop_code: '2' },
  //   };

  //   service.addMarkers(map, stops);

  //   expect(service['markers'].length).toBe(2);
  //   expect(service['markers'][0].getPosition().lat()).toBe(45.4215);
  //   expect(service['markers'][1].getPosition().lng()).toBe(-75.6973);
  // });

  // it('should update marker size on zoom change', () => {
  //   const map = {
  //     getZoom: () => 14,
  //     addListener: jasmine.createSpy('addListener'),
  //   };

  //   const stops = {
  //     '1': { stop_lat: 45.4215, stop_lon: -75.6972, stop_name: 'Stop 1', stop_code: '1' },
  //   };

  //   service.addMarkers(map, stops);

  //   map.getZoom = () => 15;
  //   expect(service['markers'][0].getIcon().scaledSize).toEqual(new google.maps.Size(12, 12));
  // });
});
