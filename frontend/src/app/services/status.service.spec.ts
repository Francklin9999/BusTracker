import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StatusService } from './status.service';
import { environment } from '../../environments/environment';

describe('StatusService', () => {
  let service: StatusService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StatusService],
    });

    service = TestBed.inject(StatusService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch data from the API and clean it', () => {
    const mockResponse = {
      data: '<p>Service is running</p>'
    };

    service.getData().subscribe((data) => {
      expect(data).toEqual('Service is running');
    });

    const req = httpMock.expectOne(environment.apiUrl + '/rs/etatservice');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should clean HTML from a string', () => {
    const htmlString = '<div>Hello <strong>World</strong></div>';
    const cleanedString = service['stripHtml'](htmlString);
    expect(cleanedString).toBe('Hello World');
  });

  it('should clean data recursively', () => {
    const mockData = {
      title: '<h1>Title</h1>',
      items: [
        '<p>Item 1</p>',
        { description: '<p>Item 2 Description</p>' }
      ],
      footer: '<footer>Footer</footer>'
    };

    const cleanedData = service['cleanData'](mockData);
    expect(cleanedData).toEqual({
      title: 'Title',
      items: ['Item 1', { description: 'Item 2 Description' }],
      footer: 'Footer'
    });
  });
});
