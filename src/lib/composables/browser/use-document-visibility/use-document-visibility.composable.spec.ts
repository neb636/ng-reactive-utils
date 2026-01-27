import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { useDocumentVisibility } from './use-document-visibility.composable';

describe('useDocumentVisibility', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return true (visible) on initialization when document is not hidden', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      isVisible = useDocumentVisibility();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const isVisible = fixture.componentInstance.isVisible();
    expect(isVisible).toBe(true);
  });

  it('should update to false when document becomes hidden', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      isVisible = useDocumentVisibility();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Simulate document becoming hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: true,
    });

    // Dispatch visibilitychange event
    const visibilityEvent = new Event('visibilitychange');
    window.dispatchEvent(visibilityEvent);

    expect(component.isVisible()).toBe(false);

    // Reset document.hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: false,
    });
  });

  it('should update to true when document becomes visible', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      isVisible = useDocumentVisibility();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // First, simulate document becoming hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: true,
    });
    window.dispatchEvent(new Event('visibilitychange'));

    expect(component.isVisible()).toBe(false);

    // Now simulate document becoming visible again
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: false,
    });
    window.dispatchEvent(new Event('visibilitychange'));

    expect(component.isVisible()).toBe(true);

    // Reset document.hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: false,
    });
  });

  it('should handle multiple visibility changes', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      isVisible = useDocumentVisibility();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Cycle through visibility changes
    for (let i = 0; i < 5; i++) {
      // Hide
      Object.defineProperty(document, 'hidden', {
        writable: true,
        configurable: true,
        value: true,
      });
      window.dispatchEvent(new Event('visibilitychange'));
      expect(component.isVisible()).toBe(false);

      // Show
      Object.defineProperty(document, 'hidden', {
        writable: true,
        configurable: true,
        value: false,
      });
      window.dispatchEvent(new Event('visibilitychange'));
      expect(component.isVisible()).toBe(true);
    }

    // Reset document.hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: false,
    });
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      isVisible = useDocumentVisibility();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const isVisible = fixture.componentInstance.isVisible;

    // Should not have .set() method (readonly signal)
    expect((isVisible as any).set).toBeUndefined();
  });

  it('should share instance between components', () => {
    @Component({
      selector: 'test-component-shared-1',
      template: '',
    })
    class TestComponent1 {
      isVisible = useDocumentVisibility();
    }

    @Component({
      selector: 'test-component-shared-2',
      template: '',
    })
    class TestComponent2 {
      isVisible = useDocumentVisibility();
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    // Both should start with true
    expect(fixture1.componentInstance.isVisible()).toBe(true);
    expect(fixture2.componentInstance.isVisible()).toBe(true);

    // Simulate document becoming hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: true,
    });
    window.dispatchEvent(new Event('visibilitychange'));

    // Both should update to false (shared instance)
    expect(fixture1.componentInstance.isVisible()).toBe(false);
    expect(fixture2.componentInstance.isVisible()).toBe(false);

    // Reset document.hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: false,
    });
  });

  it('should clean up event listeners on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      isVisible = useDocumentVisibility();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Get the visibility to ensure setup happened
    fixture.componentInstance.isVisible();

    // Destroy component (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should handle server-side rendering (returns true by default)', () => {
    // Override PLATFORM_ID to simulate server environment
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
    });

    @Component({
      template: '',
    })
    class TestComponent {
      isVisible = useDocumentVisibility();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const isVisible = fixture.componentInstance.isVisible();

    // Should return true on server (default visible)
    expect(isVisible).toBe(true);
  });

  it('should not set up event listeners on server', () => {
    // Override PLATFORM_ID to simulate server environment
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
    });

    @Component({
      template: '',
    })
    class TestComponent {
      isVisible = useDocumentVisibility();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Simulate document becoming hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: true,
    });
    window.dispatchEvent(new Event('visibilitychange'));

    // Should still be true (no event listener set up on server)
    expect(component.isVisible()).toBe(true);

    // Reset document.hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: false,
    });
  });

  it('should reflect initial hidden state when document starts hidden', () => {
    // Set document.hidden to true before creating component
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: true,
    });

    @Component({
      template: '',
    })
    class TestComponent {
      isVisible = useDocumentVisibility();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const isVisible = fixture.componentInstance.isVisible();
    expect(isVisible).toBe(false);

    // Reset document.hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: false,
    });
  });

  it('should work correctly in template bindings', () => {
    @Component({
      template: `
        <div data-testid="visibility-status">
          @if (isVisible()) {
            <span>Tab is visible</span>
          } @else {
            <span>Tab is hidden</span>
          }
        </div>
      `,
    })
    class TestComponent {
      isVisible = useDocumentVisibility();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    const statusDiv = element.querySelector('[data-testid="visibility-status"]');

    // Initially visible
    expect(statusDiv.textContent.trim()).toBe('Tab is visible');

    // Hide document
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: true,
    });
    window.dispatchEvent(new Event('visibilitychange'));
    fixture.detectChanges();

    expect(statusDiv.textContent.trim()).toBe('Tab is hidden');

    // Show document again
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: false,
    });
    window.dispatchEvent(new Event('visibilitychange'));
    fixture.detectChanges();

    expect(statusDiv.textContent.trim()).toBe('Tab is visible');

    // Reset document.hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: false,
    });
  });

  it('should maintain state across multiple subscribers in same component', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      isVisible1 = useDocumentVisibility();
      isVisible2 = useDocumentVisibility();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Both should start with same value
    expect(component.isVisible1()).toBe(component.isVisible2());

    // Hide document
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: true,
    });
    window.dispatchEvent(new Event('visibilitychange'));

    // Both should update together (shared instance)
    expect(component.isVisible1()).toBe(false);
    expect(component.isVisible2()).toBe(false);
    expect(component.isVisible1()).toBe(component.isVisible2());

    // Reset document.hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: false,
    });
  });
});
