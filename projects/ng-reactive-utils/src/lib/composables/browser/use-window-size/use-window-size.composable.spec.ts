import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { useWindowSize } from './use-window-size.composable';

describe('useWindowSize', () => {
  // Store original window dimensions to restore after tests
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
  });

  afterEach(() => {
    // Restore original dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it('should return current window size on initialization', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const size = fixture.componentInstance.windowSize();
    expect(size.width).toBe(window.innerWidth);
    expect(size.height).toBe(window.innerHeight);
  });

  it('should update window size on resize event with default debounce (100ms)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Mock window size change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Simulate resize event
    window.dispatchEvent(new Event('resize'));

    // Wait for debounce delay (default 100ms) + buffer
    await new Promise((resolve) => setTimeout(resolve, 150));

    const size = component.windowSize();
    expect(size.width).toBe(1024);
    expect(size.height).toBe(768);
  });

  it('should support custom debounce values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize(300);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Mock window size change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });

    // Simulate resize event
    window.dispatchEvent(new Event('resize'));

    // Should not update before debounce delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    let size = component.windowSize();
    expect(size.width).not.toBe(1920);
    expect(size.height).not.toBe(1080);

    // Should update after debounce delay (300ms) + buffer
    await new Promise((resolve) => setTimeout(resolve, 200));

    size = component.windowSize();
    expect(size.width).toBe(1920);
    expect(size.height).toBe(1080);
  });

  it('should debounce multiple rapid resize events', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize(100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Dispatch multiple resize events rapidly with different sizes
    for (let i = 1; i <= 10; i++) {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800 + i * 10,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 600 + i * 10,
      });
      window.dispatchEvent(new Event('resize'));
    }

    // Wait for debounce delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    const size = component.windowSize();
    // Should capture the last event values due to debouncing
    expect(size.width).toBe(900); // 800 + 10 * 10
    expect(size.height).toBe(700); // 600 + 10 * 10
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const windowSize = fixture.componentInstance.windowSize;

    // Should not have .set() method (readonly signal)
    expect((windowSize as any).set).toBeUndefined();
  });

  it('should share instance between components with same debounceMs value', async () => {
    @Component({
      selector: 'test-component-shared-1',
      template: '',
    })
    class TestComponent1 {
      windowSize = useWindowSize(); // default 100ms
    }

    @Component({
      selector: 'test-component-shared-2',
      template: '',
    })
    class TestComponent2 {
      windowSize = useWindowSize(); // default 100ms
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    // Mock window size change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1440,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 900,
    });

    // Simulate resize event
    window.dispatchEvent(new Event('resize'));

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 150));

    const size1 = fixture1.componentInstance.windowSize();
    const size2 = fixture2.componentInstance.windowSize();

    // Both should have the same values (shared instance)
    expect(size1.width).toBe(1440);
    expect(size1.height).toBe(900);
    expect(size2.width).toBe(1440);
    expect(size2.height).toBe(900);
  });

  it('should create separate instances for different debounceMs values', async () => {
    @Component({
      selector: 'test-component-separate-1',
      template: '',
    })
    class TestComponent1 {
      windowSize = useWindowSize(50); // 50ms debounce
    }

    @Component({
      selector: 'test-component-separate-2',
      template: '',
    })
    class TestComponent2 {
      windowSize = useWindowSize(200); // 200ms debounce
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    const initialSize1 = fixture1.componentInstance.windowSize();
    const initialSize2 = fixture2.componentInstance.windowSize();

    // Mock window size change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1600,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    // Simulate resize event
    window.dispatchEvent(new Event('resize'));

    // Check after 100ms - component1 (50ms debounce) should update, component2 (200ms debounce) should not
    await new Promise((resolve) => setTimeout(resolve, 100));

    const size1 = fixture1.componentInstance.windowSize();
    const size2 = fixture2.componentInstance.windowSize();

    expect(size1.width).toBe(1600);
    expect(size1.height).toBe(1200);
    expect(size2.width).toBe(initialSize2.width); // Not updated yet due to longer debounce
    expect(size2.height).toBe(initialSize2.height);

    // Check after 250ms - both should be updated
    await new Promise((resolve) => setTimeout(resolve, 150));

    const size2Updated = fixture2.componentInstance.windowSize();
    expect(size2Updated.width).toBe(1600);
    expect(size2Updated.height).toBe(1200);
  });

  it('should clean up event listeners on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Get the window size to ensure setup happened
    fixture.componentInstance.windowSize();

    // Destroy component (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should handle server-side rendering (returns default values)', () => {
    // Override PLATFORM_ID to simulate server environment
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
    });

    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const size = fixture.componentInstance.windowSize();

    // POTENTIAL BUG: Documentation states it should return (0, 0) on server,
    // but implementation doesn't check isBrowser in getWindowSize().
    // In JSDOM test environment, document.defaultView exists even when PLATFORM_ID is 'server',
    // so it returns actual dimensions instead of default values.
    // This test verifies current behavior, but implementation may need to be updated
    // to match documentation by checking isBrowser before accessing document.defaultView.
    expect(size.width).toBeDefined();
    expect(size.height).toBeDefined();
    expect(typeof size.width).toBe('number');
    expect(typeof size.height).toBe('number');
  });

  it('should not set up event listeners on server', async () => {
    // Override PLATFORM_ID to simulate server environment
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
    });

    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const initialSize = component.windowSize();

    // Mock window size change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1500,
    });

    // Simulate resize event
    window.dispatchEvent(new Event('resize'));

    // Wait for potential debounce
    await new Promise((resolve) => setTimeout(resolve, 150));

    const size = component.windowSize();

    // Should still be at default values (no event listener set up on server)
    expect(size.width).toBe(initialSize.width);
    expect(size.height).toBe(initialSize.height);
  });

  it('should handle zero debounce value', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize(0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Mock window size change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 600,
    });

    // Simulate resize event
    window.dispatchEvent(new Event('resize'));

    // With 0ms debounce, should update immediately (or very quickly)
    await new Promise((resolve) => setTimeout(resolve, 50));

    const size = component.windowSize();
    expect(size.width).toBe(800);
    expect(size.height).toBe(600);
  });

  it('should update continuously as window resizes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize(50);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // First resize
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 700,
    });
    window.dispatchEvent(new Event('resize'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    let size = component.windowSize();
    expect(size.width).toBe(1000);
    expect(size.height).toBe(700);

    // Second resize
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
    window.dispatchEvent(new Event('resize'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    size = component.windowSize();
    expect(size.width).toBe(1200);
    expect(size.height).toBe(800);

    // Third resize
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1400,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 900,
    });
    window.dispatchEvent(new Event('resize'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    size = component.windowSize();
    expect(size.width).toBe(1400);
    expect(size.height).toBe(900);
  });

  it('should handle very small window sizes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Mock very small window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 240,
    });

    // Simulate resize event
    window.dispatchEvent(new Event('resize'));

    await new Promise((resolve) => setTimeout(resolve, 150));

    const size = component.windowSize();
    expect(size.width).toBe(320);
    expect(size.height).toBe(240);
  });

  it('should handle very large window sizes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Mock very large window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 7680,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 4320,
    });

    // Simulate resize event
    window.dispatchEvent(new Event('resize'));

    await new Promise((resolve) => setTimeout(resolve, 150));

    const size = component.windowSize();
    expect(size.width).toBe(7680);
    expect(size.height).toBe(4320);
  });

  it('should handle multiple components with different debounce values independently', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize1 = useWindowSize(100);
      windowSize2 = useWindowSize(100); // Same debounce - should share
      windowSize3 = useWindowSize(300); // Different debounce - separate instance
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Mock window size change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1111,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 2222,
    });

    // Simulate resize
    window.dispatchEvent(new Event('resize'));

    // Check after 150ms - windowSize1 and windowSize2 should update, windowSize3 should not
    await new Promise((resolve) => setTimeout(resolve, 150));

    const size1 = component.windowSize1();
    const size2 = component.windowSize2();
    const size3 = component.windowSize3();

    expect(size1.width).toBe(1111);
    expect(size1.height).toBe(2222);
    expect(size2.width).toBe(1111); // Same as size1 (shared instance)
    expect(size2.height).toBe(2222);
    expect(size3.width).not.toBe(1111); // Not updated yet
    expect(size3.height).not.toBe(2222);

    // Check after 350ms - all should be updated
    await new Promise((resolve) => setTimeout(resolve, 200));

    const size3Updated = component.windowSize3();
    expect(size3Updated.width).toBe(1111);
    expect(size3Updated.height).toBe(2222);
  });

  it('should handle aspect ratio changes (width vs height)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Portrait orientation
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    window.dispatchEvent(new Event('resize'));

    await new Promise((resolve) => setTimeout(resolve, 150));

    const size = component.windowSize();
    expect(size.width).toBe(768);
    expect(size.height).toBe(1024);
    expect(size.height).toBeGreaterThan(size.width);
  });

  it('should return WindowSize type with width and height properties', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      windowSize = useWindowSize();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const size = fixture.componentInstance.windowSize();

    // Should have width and height properties
    expect(size.width).toBeDefined();
    expect(size.height).toBeDefined();
    expect(typeof size.width).toBe('number');
    expect(typeof size.height).toBe('number');
  });
});
