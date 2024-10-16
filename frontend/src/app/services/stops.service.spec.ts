import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StopsService } from './stops.service';
import * as Papa from 'papaparse';

describe('StopsService', () => {
  let service: StopsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StopsService],
    });

    service = TestBed.inject(StopsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch and parse CSV data', (done) => {
    const mockCsvData = `stop_code,stop_id,stop_name,stop_lat,stop_lon
    S1,1,"Stop 1",45.123,-75.123
    S2,2,"Stop 2",45.124,-75.124`;

    service.getParsedData().subscribe((stops) => {
      expect(stops).toEqual({
        S1: { stop_code: 'S1', stop_id: '1', stop_name: 'Stop 1', stop_lat: 45.123, stop_lon: -75.123 },
        S2: { stop_code: 'S2', stop_id: '2', stop_name: 'Stop 2', stop_lat: 45.124, stop_lon: -75.124 },
      });
      done();
    });

    const req = httpMock.expectOne('assets/files/stops.csv');
    expect(req.request.method).toBe('GET');
    req.flush(mockCsvData);
  });

  it('should transform data correctly', () => {
    const mockData = [
      { stop_code: 'S1', stop_id: '1', stop_name: 'Stop 1', stop_lat: '45.123', stop_lon: '-75.123' },
      { stop_code: 'S2', stop_id: '2', stop_name: 'Stop 2', stop_lat: '45.124', stop_lon: '-75.124' },
    ];

    const transformedData = service['transformData'](mockData);
    expect(transformedData).toEqual({
      S1: { stop_code: 'S1', stop_id: '1', stop_name: 'Stop 1', stop_lat: 45.123, stop_lon: -75.123 },
      S2: { stop_code: 'S2', stop_id: '2', stop_name: 'Stop 2', stop_lat: 45.124, stop_lon: -75.124 },
    });
  });

  it('should calculate distance between two points', () => {
    const lat1 = 45.123;
    const lon1 = -75.123;
    const lat2 = 45.124;
    const lon2 = -75.124;

    const distance = service.calculateDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeCloseTo(14.144, 3);
  });

  it('should find nearby stops by stop code', () => {
    service['stops'] = {
      S1: { stop_code: 'S1', stop_lat: 45.123, stop_lon: -75.123 },
      S2: { stop_code: 'S2', stop_lat: 45.124, stop_lon: -75.124 },
      S3: { stop_code: 'S3', stop_lat: 45.200, stop_lon: -75.200 },
    };

    const nearbyStops = service.getNearbyStops('S1', 1000); 
    expect(nearbyStops).toEqual(['S2']); 
  });

  it('should find nearby stops by location', () => {
    service['stops'] = {
      S1: { stop_code: 'S1', stop_lat: 45.123, stop_lon: -75.123 },
      S2: { stop_code: 'S2', stop_lat: 45.124, stop_lon: -75.124 },
      S3: { stop_code: 'S3', stop_lat: 45.200, stop_lon: -75.200 },
    };

    const nearbyStops = service.getNearbyStopsByLocation(45.123, -75.123, 1000); 
    expect(nearbyStops).toEqual(['S2']);
  });
});
