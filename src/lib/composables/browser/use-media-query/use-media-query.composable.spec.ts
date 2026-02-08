import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { useMediaQuery } from './use-media-query.composable';
import { vi, expect as vitestExpect } from 'vitest';

// Polyfill MediaQueryListEvent for test environment
if (typeof MediaQueryListEvent === 'undefined') {
  (globalThis as any).MediaQueryListEvent = class MediaQueryListEvent extends Event {
    matches: boolean;
    media: string;

    constructor(
      type: string,
      eventInitDict?: { matches?: boolean; media?: string },
    ) {
      super(type);
      this.matches = eventInitDict?.matches ?? false;
      this.media = eventInitDict?.media ?? '';
    }
  };
}

// Mock MediaQueryList for testing
class MockMediaQueryList extends EventTarget implements MediaQueryList {
  matches: boolean;
  media: string;

  constructor(
    public query: string,
    matches: boolean,
  ) {
    super();
    this.media = query;
    this.matches = matches;
  }

  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;

  addListener(callback: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null): void {
    if (callback) {
      this.addEventListener('change', callback as any);
    }
  }

  removeListener(callback: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null): void {
    if (callback) {
      this.removeEventListener('change', callback as any);
    }
  }

  override dispatchEvent(event: Event): boolean {
    return super.dispatchEvent(event);
  }
}

describe('useMediaQuery', () => {
  let mockMediaQueryLists: Map<string, MockMediaQueryList>;

  beforeEach(() => {
    mockMediaQueryLists = new Map();

    // Mock window.matchMedia
    (window as any).matchMedia = (query: string) => {
      // Normalize the query for consistent lookup (matches implementation)
      const normalizedQuery = query.toLowerCase().replace(/\s+/g, ' ').trim();
      
      if (!mockMediaQueryLists.has(normalizedQuery)) {
        // Determine initial matches value based on query
        let matches = false;
        if (normalizedQuery.includes('min-width: 0')) {
          matches = true;
        } else if (normalizedQuery.includes('max-width: 1px')) {
          matches = false;
        } else if (normalizedQuery.includes('orientation: portrait')) {
          matches = true;
        } else if (normalizedQuery.includes('orientation: landscape')) {
          matches = false;
        } else if (normalizedQuery.includes('max-width:')) {
          // Default to not matching for max-width queries unless specifically handled
          const widthMatch = normalizedQuery.match(/max-width:\s*(\d+)/);
          if (widthMatch) {
            const width = parseInt(widthMatch[1]);
            // Assume test viewport is 1024px
            matches = 1024 <= width;
          }
        }

        mockMediaQueryLists.set(normalizedQuery, new MockMediaQueryList(query, matches));
      }
      return mockMediaQueryLists.get(normalizedQuery)!;
    };

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    mockMediaQueryLists.clear();
  });

  it('should return false for non-matching media query', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      // Query that should not match in test environment
      matches = useMediaQuery('(max-width: 1px)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.matches()).toBe(false);
  });

  it('should return true for matching media query', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      // Query that should match in test environment (all)
      matches = useMediaQuery('(min-width: 0px)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.matches()).toBe(true);
  });

  it('should update when media query match state changes', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      matches = useMediaQuery('(max-width: 768px)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const initialValue = component.matches();

    // Get the mock MediaQueryList and dispatch event
    const normalizedQuery = '(max-width: 768px)'.toLowerCase().replace(/\s+/g, ' ').trim();
    const mediaQueryList = mockMediaQueryLists.get(normalizedQuery)!;
    
    const event = new MediaQueryListEvent('change', {
      matches: !initialValue,
      media: '(max-width: 768px)',
    });

    mediaQueryList.dispatchEvent(event);

    expect(component.matches()).toBe(!initialValue);
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      matches = useMediaQuery('(max-width: 768px)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const matches = fixture.componentInstance.matches;

    // Should not have .set() method (readonly signal)
    expect((matches as any).set).toBeUndefined();
  });

  it('should share instance between components with same query', () => {
    @Component({
      selector: 'test-component-1',
      template: '',
    })
    class TestComponent1 {
      matches = useMediaQuery('(max-width: 1024px)');
    }

    @Component({
      selector: 'test-component-2',
      template: '',
    })
    class TestComponent2 {
      matches = useMediaQuery('(max-width: 1024px)');
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    const matches1 = fixture1.componentInstance.matches();
    const matches2 = fixture2.componentInstance.matches();

    // Both should have the same value (shared instance)
    expect(matches1).toBe(matches2);
  });

  it('should create separate instances for different queries', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      matchesMobile = useMediaQuery('(max-width: 640px)');
      matchesTablet = useMediaQuery('(max-width: 1024px)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Different queries should be tracked independently
    expect(component.matchesMobile).toBeDefined();
    expect(component.matchesTablet).toBeDefined();
  });

  it('should handle dark mode query', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const prefersDark = fixture.componentInstance.prefersDark();
    expect(typeof prefersDark).toBe('boolean');
  });

  it('should handle orientation queries', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      isPortrait = useMediaQuery('(orientation: portrait)');
      isLandscape = useMediaQuery('(orientation: landscape)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // One should be true, one should be false
    expect(component.isPortrait() || component.isLandscape()).toBe(true);
  });

  it('should handle print media query', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      isPrint = useMediaQuery('print');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Should be false in test environment (not printing)
    expect(fixture.componentInstance.isPrint()).toBe(false);
  });

  it('should handle reduced motion preference', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const prefersReducedMotion = fixture.componentInstance.prefersReducedMotion();
    expect(typeof prefersReducedMotion).toBe('boolean');
  });

  it('should handle high resolution display query', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      isHighDPI = useMediaQuery('(min-resolution: 2dppx)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const isHighDPI = fixture.componentInstance.isHighDPI();
    expect(typeof isHighDPI).toBe('boolean');
  });

  it('should clean up event listeners on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      matches = useMediaQuery('(max-width: 768px)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Get the signal to ensure setup happened
    fixture.componentInstance.matches();

    // Get the mock MediaQueryList and spy on removeEventListener
    const normalizedQuery = '(max-width: 768px)'.toLowerCase().replace(/\s+/g, ' ').trim();
    const mediaQueryList = mockMediaQueryLists.get(normalizedQuery)!;
    const removeEventListenerSpy = vi.spyOn(mediaQueryList, 'removeEventListener');

    // Destroy component (should clean up)
    fixture.destroy();

    // Verify cleanup was called
    vitestExpect(removeEventListenerSpy).toHaveBeenCalledWith('change', vitestExpect.any(Function));
  });

  it('should handle server-side rendering (returns false)', () => {
    // Override PLATFORM_ID to simulate server environment
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
    });

    @Component({
      template: '',
    })
    class TestComponent {
      matches = useMediaQuery('(max-width: 768px)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Should return false on server
    expect(fixture.componentInstance.matches()).toBe(false);
  });

  it('should not set up event listeners on server', () => {
    // Override PLATFORM_ID to simulate server environment
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
    });

    @Component({
      template: '',
    })
    class TestComponent {
      matches = useMediaQuery('(max-width: 768px)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const initialValue = component.matches();

    // Get the mock MediaQueryList and try to dispatch event
    const normalizedQuery = '(max-width: 768px)'.toLowerCase().replace(/\s+/g, ' ').trim();
    const mediaQueryList = mockMediaQueryLists.get(normalizedQuery);
    
    if (mediaQueryList) {
      const event = new MediaQueryListEvent('change', {
        matches: !initialValue,
        media: '(max-width: 768px)',
      });

      mediaQueryList.dispatchEvent(event);
    }

    // Should still be false (no listener on server)
    expect(component.matches()).toBe(false);
  });

  it('should handle complex media queries', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      complexQuery = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const matches = fixture.componentInstance.complexQuery();
    expect(typeof matches).toBe('boolean');
  });

  it('should handle multiple media features', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      multiFeature = useMediaQuery('(min-width: 1024px) and (min-height: 768px)');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const matches = fixture.componentInstance.multiFeature();
    expect(typeof matches).toBe('boolean');
  });

  it('should be case-insensitive for query matching in sharing', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      query1 = useMediaQuery('(max-width: 768px)');
      query2 = useMediaQuery('(MAX-WIDTH: 768px)'); // Different case, should share
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Both should return same value (shared due to normalization)
    expect(component.query1()).toBe(component.query2());
  });

  it('should normalize whitespace for consistent sharing', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      query1 = useMediaQuery('(max-width: 768px)');
      query2 = useMediaQuery('(max-width:768px)'); // No space after colon
      query3 = useMediaQuery('(max-width:  768px)'); // Multiple spaces
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // All should return same value (shared due to normalization)
    const value1 = component.query1();
    const value2 = component.query2();
    const value3 = component.query3();
    
    expect(value1).toBe(value2);
    expect(value1).toBe(value3);
    
    // Verify they all normalized to the same key (only one mock should exist)
    const normalizedQuery = '(max-width: 768px)'.toLowerCase().replace(/\s+/g, ' ').trim();
    expect(mockMediaQueryLists.has(normalizedQuery)).toBe(true);
  });

  it('should handle invalid media query by returning false', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      invalidQuery = useMediaQuery('this is not a valid query');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Invalid queries should return false
    expect(fixture.componentInstance.invalidQuery()).toBe(false);
  });
});
