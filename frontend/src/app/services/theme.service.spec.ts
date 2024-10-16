import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

describe('ThemeService', () => {
  let service: ThemeService;
  const mockPlatformId = 'browser';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: PLATFORM_ID, useValue: mockPlatformId },
      ],
    });
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserThemePreference', () => {
    beforeEach(() => {
      const matchMediaSpy = (query: string) => {
        return {
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
        };
      };
      // spyOn(window, 'matchMedia').and.callFake(matchMediaSpy);
    });

    it('should return "dark" if user prefers dark mode', () => {
      const preference = service.getUserThemePreference();
      expect(preference).toBe('dark');
    });

    it('should return "light" if user prefers light mode', () => {
      const matchMediaSpy = (query: string) => {
        return {
          matches: query === '(prefers-color-scheme: light)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
        };
      };
      // spyOn(window, 'matchMedia').and.callFake(matchMediaSpy);
      const preference = service.getUserThemePreference();
      expect(preference).toBe('light');
    });

    it('should return null if not in browser platform', () => {
      service = new ThemeService('server');
      const preference = service.getUserThemePreference();
      expect(preference).toBe(null);
    });

    it('should return null if no preference is set', () => {
      const matchMediaSpy = (query: string) => {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
        };
      };
      // spyOn(window, 'matchMedia').and.callFake(matchMediaSpy);
      const preference = service.getUserThemePreference();
      expect(preference).toBe(null);
    });
  });

  describe('toggleLightMode', () => {
    it('should toggle light mode', () => {
      service.isLightMode$.subscribe((isLightMode) => {
        expect(isLightMode).toBe(false); 
      });
      service.toggleLightMode(true);
      service.isLightMode$.subscribe((isLightMode) => {
        expect(isLightMode).toBe(true);
      });
    });
  });
});
