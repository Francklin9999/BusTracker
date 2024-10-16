import { TestBed } from '@angular/core/testing';
import { WebSocketService } from './websocket.service';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWebSocket: WebSocket;

  beforeEach(() => {
    mockWebSocket = {
      readyState: WebSocket.CLOSED,
      onopen: jasmine.createSpy('onopen'),
      onmessage: jasmine.createSpy('onmessage'),
      onerror: jasmine.createSpy('onerror'),
      onclose: jasmine.createSpy('onclose'),
      send: jasmine.createSpy('send'),
      close: jasmine.createSpy('close'),
    } as unknown as WebSocket;

    TestBed.configureTestingModule({
      providers: [
        WebSocketService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(WebSocketService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should connect to WebSocket when in browser', () => {
    spyOn(window, 'WebSocket').and.returnValue(mockWebSocket);

    service = TestBed.inject(WebSocketService);

    expect(mockWebSocket.onopen).toBeDefined();
    expect(mockWebSocket.onmessage).toBeDefined();
    expect(mockWebSocket.onerror).toBeDefined();
    expect(mockWebSocket.onclose).toBeDefined();
    expect(window.WebSocket).toHaveBeenCalledWith(environment.wsApiUrl + '/ws');
  });

  // it('should handle incoming messages', () => {
  //   spyOn(window, 'WebSocket').and.returnValue(mockWebSocket);

  //   service = TestBed.inject(WebSocketService);
    
  //   const testMessage = JSON.stringify({ message: 'test' });
  //   const event = { data: testMessage };

  //   mockWebSocket.onopen();
  //   mockWebSocket.onmessage(event);

  //   service.messages$.subscribe((message) => {
  //     expect(message).toEqual({ message: 'test' });
  //   });
  // });

  // it('should handle WebSocket errors', () => {
  //   spyOn(window, 'WebSocket').and.returnValue(mockWebSocket);
    
  //   service = TestBed.inject(WebSocketService);
    
  //   mockWebSocket.onopen();

  //   mockWebSocket.onerror('Error message');

  //   service.error$.subscribe((error) => {
  //     expect(error).toContain('WebSocket error: Error message');
  //   });
  // });

  // it('should send messages if WebSocket is open', () => {
  //   spyOn(window, 'WebSocket').and.returnValue(mockWebSocket);
    
  //   service = TestBed.inject(WebSocketService);
    
  //   mockWebSocket.readyState = WebSocket.OPEN;
    
  //   const action = 'testAction';
  //   const params = { key: 'value' };
  //   const expectedMessage = JSON.stringify({ action, params });

  //   service.sendMessage(action, params);

  //   expect(mockWebSocket.send).toHaveBeenCalledWith(expectedMessage);
  // });

  // it('should not send messages if WebSocket is not open', () => {
  //   spyOn(window, 'WebSocket').and.returnValue(mockWebSocket);
    
  //   service = TestBed.inject(WebSocketService);
    
  //   mockWebSocket.readyState = WebSocket.CLOSED;

  //   const action = 'testAction';
  //   const params = { key: 'value' };

  //   service.sendMessage(action, params);

  //   expect(mockWebSocket.send).not.toHaveBeenCalled();
  // });

  it('should close the WebSocket connection', () => {
    spyOn(window, 'WebSocket').and.returnValue(mockWebSocket);
    
    service = TestBed.inject(WebSocketService);
    
    service.closeConnection();
    expect(mockWebSocket.close).toHaveBeenCalled();
    expect(service['socket']).toBeUndefined();
  });
});
