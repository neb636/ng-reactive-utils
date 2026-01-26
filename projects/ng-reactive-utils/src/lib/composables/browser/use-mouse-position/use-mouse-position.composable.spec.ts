import { TestBed } from '@angular/core/testing';
import {
  Component,
  provideZonelessChangeDetection,
  PLATFORM_ID,
} from '@angular/core';
import { useMousePosition } from './use-mouse-position.composable';

describe('useMousePosition', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return default mouse position (0, 0) on initialization', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      mousePosition = useMousePosition();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const position = fixture.componentInstance.mousePosition();
    expect(position.x).toBe(0);
    expect(position.y).toBe(0);
  });

  it('should update mouse position on mousemove event with default throttle (100ms)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      mousePosition = useMousePosition();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Simulate mouse move event
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 200,
    });
    window.dispatchEvent(mouseEvent);

    // Wait for throttle delay (default 100ms) + buffer
    await new Promise((resolve) => setTimeout(resolve, 150));

    const position = component.mousePosition();
    expect(position.x).toBe(100);
    expect(position.y).toBe(200);
  });

  it('should throttle multiple rapid mousemove events', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      mousePosition = useMousePosition(100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Dispatch multiple events rapidly
    for (let i = 1; i <= 10; i++) {
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: i * 10,
        clientY: i * 10,
      });
      window.dispatchEvent(mouseEvent);
    }

    // Wait for throttle delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    const position = component.mousePosition();
    // Should capture the last event (100, 100) due to throttling
    expect(position.x).toBe(100);
    expect(position.y).toBe(100);
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      mousePosition = useMousePosition();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const mousePosition = fixture.componentInstance.mousePosition;

    // Should not have .set() method (readonly signal)
    expect((mousePosition as any).set).toBeUndefined();
  });

  it('should share instance between components with same throttleMs value', async () => {
    @Component({
      selector: 'test-component-shared-1',
      template: '',
    })
    class TestComponent1 {
      mousePosition = useMousePosition(); // default 100ms
    }

    @Component({
      selector: 'test-component-shared-2',
      template: '',
    })
    class TestComponent2 {
      mousePosition = useMousePosition(); // default 100ms
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    // Simulate mouse move event
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 300,
      clientY: 400,
    });
    window.dispatchEvent(mouseEvent);

    // Wait for throttle
    await new Promise((resolve) => setTimeout(resolve, 150));

    const position1 = fixture1.componentInstance.mousePosition();
    const position2 = fixture2.componentInstance.mousePosition();

    // Both should have the same values (shared instance)
    expect(position1.x).toBe(300);
    expect(position1.y).toBe(400);
    expect(position2.x).toBe(300);
    expect(position2.y).toBe(400);
  });

  it('should clean up event listeners on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      mousePosition = useMousePosition();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Get the mouse position to ensure setup happened
    fixture.componentInstance.mousePosition();

    // Destroy component (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should handle server-side rendering (returns default values)', () => {
    // Override PLATFORM_ID to simulate server environment
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    @Component({
      template: '',
    })
    class TestComponent {
      mousePosition = useMousePosition();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const position = fixture.componentInstance.mousePosition();

    // Should return default values on server
    expect(position.x).toBe(0);
    expect(position.y).toBe(0);
  });

  it('should not set up event listeners on server', async () => {
    // Override PLATFORM_ID to simulate server environment
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    @Component({
      template: '',
    })
    class TestComponent {
      mousePosition = useMousePosition();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Simulate mouse move event
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 700,
      clientY: 800,
    });
    window.dispatchEvent(mouseEvent);

    // Wait for potential throttle
    await new Promise((resolve) => setTimeout(resolve, 150));

    const position = component.mousePosition();

    // Should still be at default values (no event listener set up on server)
    expect(position.x).toBe(0);
    expect(position.y).toBe(0);
  });

  it('should handle zero throttle value', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      mousePosition = useMousePosition(0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Simulate mouse move event
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 50,
      clientY: 75,
    });
    window.dispatchEvent(mouseEvent);

    // With 0ms throttle, should update immediately (or very quickly)
    await new Promise((resolve) => setTimeout(resolve, 50));

    const position = component.mousePosition();
    expect(position.x).toBe(50);
    expect(position.y).toBe(75);
  });

  it('should update continuously as mouse moves', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      mousePosition = useMousePosition(50);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // First movement
    let mouseEvent = new MouseEvent('mousemove', {
      clientX: 10,
      clientY: 20,
    });
    window.dispatchEvent(mouseEvent);

    await new Promise((resolve) => setTimeout(resolve, 100));

    let position = component.mousePosition();
    expect(position.x).toBe(10);
    expect(position.y).toBe(20);

    // Second movement
    mouseEvent = new MouseEvent('mousemove', {
      clientX: 30,
      clientY: 40,
    });
    window.dispatchEvent(mouseEvent);

    await new Promise((resolve) => setTimeout(resolve, 100));

    position = component.mousePosition();
    expect(position.x).toBe(30);
    expect(position.y).toBe(40);

    // Third movement
    mouseEvent = new MouseEvent('mousemove', {
      clientX: 50,
      clientY: 60,
    });
    window.dispatchEvent(mouseEvent);

    await new Promise((resolve) => setTimeout(resolve, 100));

    position = component.mousePosition();
    expect(position.x).toBe(50);
    expect(position.y).toBe(60);
  });

  it('should handle negative coordinates', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      mousePosition = useMousePosition();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Simulate mouse move with negative coordinates (edge case but possible)
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: -10,
      clientY: -20,
    });
    window.dispatchEvent(mouseEvent);

    await new Promise((resolve) => setTimeout(resolve, 150));

    const position = component.mousePosition();
    expect(position.x).toBe(-10);
    expect(position.y).toBe(-20);
  });

  it('should handle very large coordinate values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      mousePosition = useMousePosition();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Simulate mouse move with large coordinates
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 99999,
      clientY: 88888,
    });
    window.dispatchEvent(mouseEvent);

    await new Promise((resolve) => setTimeout(resolve, 150));

    const position = component.mousePosition();
    expect(position.x).toBe(99999);
    expect(position.y).toBe(88888);
  });
});
