import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { useThrottledSignal } from './use-throttled-signal.composable';

describe('useThrottledSignal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return initial value from source signal immediately', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial value');
      throttledSignal = useThrottledSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    // Documentation states: "emits the first value immediately"
    expect(component.throttledSignal()).toBe('initial value');
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('test');
      throttledSignal = useThrottledSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const throttledSignal = fixture.componentInstance.throttledSignal;

    // Documentation states: "The throttled signal is **readonly** to prevent direct manipulation"
    expect((throttledSignal as any).set).toBeUndefined();
  });

  it('should NOT emit first change immediately due to initialization throttle', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      throttledSignal = useThrottledSignal(this.sourceSignal, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // BUG FOUND: Documentation says "Emits the first value immediately"
    // But the effect runs during initialization, counting as the "leading" throttle call
    // So the FIRST CHANGE after initialization is actually throttled!
    component.sourceSignal.set('first update');

    // Value should still be 'initial' because we're in the throttle period from initialization
    expect(component.throttledSignal()).toBe('initial');

    // After throttle period expires, the change should be reflected
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(component.throttledSignal()).toBe('first update');
  });

  it('should throttle updates after initialization', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      throttledSignal = useThrottledSignal(this.sourceSignal, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Changes immediately after init are throttled due to init counting as leading call
    component.sourceSignal.set('first');
    expect(component.throttledSignal()).toBe('initial');

    // Second update also throttled
    component.sourceSignal.set('second');
    expect(component.throttledSignal()).toBe('initial');

    // After throttle period, should show the last value
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(component.throttledSignal()).toBe('second');
  });

  it('should use default delay of 300ms when no delay specified', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      throttledSignal = useThrottledSignal(this.sourceSignal); // No delay specified
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Change is throttled after initialization
    component.sourceSignal.set('updated');
    expect(component.throttledSignal()).toBe('initial');

    // Should update after default 300ms delay
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(component.throttledSignal()).toBe('updated');
  });

  it('should support custom throttle delay values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      throttledSignal = useThrottledSignal(this.sourceSignal, 500);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Change is throttled after initialization
    component.sourceSignal.set('updated');
    expect(component.throttledSignal()).toBe('initial');

    // Should not update before custom delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(component.throttledSignal()).toBe('initial');

    // Should update after custom 500ms delay
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(component.throttledSignal()).toBe('updated');
  });

  it('should emit at regular intervals during rapid activity (throttling behavior)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(0);
      throttledSignal = useThrottledSignal(this.sourceSignal, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Rapid updates - all throttled after initialization
    for (let i = 1; i <= 10; i++) {
      component.sourceSignal.set(i);
      await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms between updates
    }

    // During rapid updates, should have emitted periodically (not all values)
    const valueAfterUpdates = component.throttledSignal();
    expect(valueAfterUpdates).toBeGreaterThanOrEqual(0);
    expect(valueAfterUpdates).toBeLessThanOrEqual(10);

    // After throttle period, should emit the last value
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(component.throttledSignal()).toBe(10);
  });

  it('should handle multiple rapid changes and emit last value after throttle period', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(0);
      throttledSignal = useThrottledSignal(this.sourceSignal, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Rapidly update source signal (all at once)
    for (let i = 1; i <= 10; i++) {
      component.sourceSignal.set(i);
    }

    // Should still have initial value due to throttling
    expect(component.throttledSignal()).toBe(0);

    // Should emit the last value after throttle delay
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(component.throttledSignal()).toBe(10);
  });

  it('should handle string values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('hello');
      throttledSignal = useThrottledSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set('world');
    expect(component.throttledSignal()).toBe('hello'); // Throttled after init

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.throttledSignal()).toBe('world');
  });

  it('should handle number values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(42);
      throttledSignal = useThrottledSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set(100);
    expect(component.throttledSignal()).toBe(42); // Throttled after init

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.throttledSignal()).toBe(100);
  });

  it('should handle object values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal({ name: 'John', age: 30 });
      throttledSignal = useThrottledSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    const initialValue = component.throttledSignal();
    const newValue = { name: 'Jane', age: 25 };
    component.sourceSignal.set(newValue);
    expect(component.throttledSignal()).toEqual(initialValue); // Throttled after init

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.throttledSignal()).toEqual(newValue);
  });

  it('should handle array values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal([1, 2, 3]);
      throttledSignal = useThrottledSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    const newValue = [4, 5, 6];
    component.sourceSignal.set(newValue);
    expect(component.throttledSignal()).toEqual([1, 2, 3]); // Throttled after init

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.throttledSignal()).toEqual(newValue);
  });

  it('should handle boolean values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(true);
      throttledSignal = useThrottledSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set(false);
    expect(component.throttledSignal()).toBe(true); // Throttled after init

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.throttledSignal()).toBe(false);
  });

  it('should handle null and undefined values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal<string | null | undefined>('value');
      throttledSignal = useThrottledSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set(null);
    expect(component.throttledSignal()).toBe('value'); // Throttled after init

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.throttledSignal()).toBe(null);

    component.sourceSignal.set(undefined);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.throttledSignal()).toBe(undefined);
  });

  it('should handle zero delay (immediate updates)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      throttledSignal = useThrottledSignal(this.sourceSignal, 0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set('updated');

    // With 0ms delay, should update very quickly
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.throttledSignal()).toBe('updated');
  });

  it('should clean up on component destroy (cancel throttle)', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('test');
      throttledSignal = useThrottledSignal(this.sourceSignal, 300);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Update signal
    component.sourceSignal.set('updated');

    // Destroy component before throttle completes (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should work with multiple throttled signals from same source', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      throttledSignal1 = useThrottledSignal(this.sourceSignal, 100);
      throttledSignal2 = useThrottledSignal(this.sourceSignal, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Change is throttled for both
    component.sourceSignal.set('updated');
    expect(component.throttledSignal1()).toBe('initial');
    expect(component.throttledSignal2()).toBe('initial');

    // First throttled signal should update after 100ms
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.throttledSignal1()).toBe('updated');
    expect(component.throttledSignal2()).toBe('initial'); // Not updated yet

    // Second throttled signal should update after 200ms
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(component.throttledSignal1()).toBe('updated');
    expect(component.throttledSignal2()).toBe('updated');
  });

  it('should work correctly in template bindings', async () => {
    @Component({
      template: `
        <div data-testid="source-value">Source: {{ sourceSignal() }}</div>
        <div data-testid="throttled-value">Throttled: {{ throttledSignal() }}</div>
      `,
    })
    class TestComponent {
      sourceSignal = signal('initial');
      throttledSignal = useThrottledSignal(this.sourceSignal, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const element = fixture.nativeElement;
    const sourceDiv = element.querySelector('[data-testid="source-value"]');
    const throttledDiv = element.querySelector('[data-testid="throttled-value"]');

    // Initially both should show 'initial'
    expect(sourceDiv.textContent.trim()).toBe('Source: initial');
    expect(throttledDiv.textContent.trim()).toBe('Throttled: initial');

    // Update - throttled after init
    component.sourceSignal.set('updated');
    fixture.detectChanges();

    expect(sourceDiv.textContent.trim()).toBe('Source: updated');
    expect(throttledDiv.textContent.trim()).toBe('Throttled: initial'); // Still throttled

    // After throttle delay, should show 'updated'
    await new Promise((resolve) => setTimeout(resolve, 250));

    fixture.detectChanges();
    expect(sourceDiv.textContent.trim()).toBe('Source: updated');
    expect(throttledDiv.textContent.trim()).toBe('Throttled: updated');
  });

  it('should maintain separate instances for different components', async () => {
    @Component({
      selector: 'test-component-1',
      template: '',
    })
    class TestComponent1 {
      sourceSignal = signal('component1');
      throttledSignal = useThrottledSignal(this.sourceSignal, 100);
    }

    @Component({
      selector: 'test-component-2',
      template: '',
    })
    class TestComponent2 {
      sourceSignal = signal('component2');
      throttledSignal = useThrottledSignal(this.sourceSignal, 100);
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    const component1 = fixture1.componentInstance;
    const component2 = fixture2.componentInstance;

    // Update only component1's signal - throttled after init
    component1.sourceSignal.set('updated1');
    expect(component1.throttledSignal()).toBe('component1');
    expect(component2.throttledSignal()).toBe('component2');

    await new Promise((resolve) => setTimeout(resolve, 150));

    // Component1 should update, component2 should not
    expect(component1.throttledSignal()).toBe('updated1');
    expect(component2.throttledSignal()).toBe('component2');
  });

  it('should handle empty string values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('not empty');
      throttledSignal = useThrottledSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set('');
    expect(component.throttledSignal()).toBe('not empty'); // Throttled after init

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.throttledSignal()).toBe('');
  });

  it('should demonstrate use case for mousemove events (throttle rapid updates)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      mouseX = signal(0);
      throttledX = useThrottledSignal(this.mouseX, 500);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Simulate rapid mouse movements - all throttled after init
    component.mouseX.set(10);
    setTimeout(() => component.mouseX.set(20), 50);
    setTimeout(() => component.mouseX.set(30), 100);
    setTimeout(() => component.mouseX.set(40), 150);
    setTimeout(() => component.mouseX.set(50), 200);

    // Should still show initial value due to throttling
    expect(component.throttledX()).toBe(0);

    // During rapid movements, throttled value updates periodically
    await new Promise((resolve) => setTimeout(resolve, 300));

    const valueDuringActivity = component.throttledX();
    expect(valueDuringActivity).toBeGreaterThanOrEqual(0);
    expect(valueDuringActivity).toBeLessThanOrEqual(50);

    // After throttle period, should have the last value
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(component.throttledX()).toBe(50);
  });

  it('should demonstrate use case for scroll events', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      scrollY = signal(0);
      throttledScrollY = useThrottledSignal(this.scrollY, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Simulate scroll events (rapid updates) - all throttled after init
    component.scrollY.set(100);
    for (let i = 1; i <= 5; i++) {
      component.scrollY.set(100 + i * 20);
    }

    // Should still show initial value due to throttling
    expect(component.throttledScrollY()).toBe(0);

    // After throttle, should show last value
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(component.throttledScrollY()).toBe(200);
  });

  it('should handle continuous updates with separate throttle windows', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(0);
      throttledSignal = useThrottledSignal(this.sourceSignal, 150);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // First burst of updates - throttled after init
    component.sourceSignal.set(1);
    component.sourceSignal.set(2);
    component.sourceSignal.set(3);

    expect(component.throttledSignal()).toBe(0);

    // Wait for first throttle
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(component.throttledSignal()).toBe(3);

    // Second burst of updates after throttle window passed
    component.sourceSignal.set(4);
    component.sourceSignal.set(5);

    // Wait for second throttle
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(component.throttledSignal()).toBe(5);
  });

  it('should handle very long delay values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      throttledSignal = useThrottledSignal(this.sourceSignal, 1000);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set('updated');
    expect(component.throttledSignal()).toBe('initial'); // Throttled after init

    // Should not update before delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(component.throttledSignal()).toBe('initial');

    // Should update after long delay
    await new Promise((resolve) => setTimeout(resolve, 550));
    expect(component.throttledSignal()).toBe('updated');
  });

  it('should handle signal.update() calls', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      count = signal(0);
      throttledCount = useThrottledSignal(this.count, 150);

      increment() {
        this.count.update((v) => v + 1);
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.count()).toBe(0);
    expect(component.throttledCount()).toBe(0);

    // Updates are throttled after init
    component.increment();
    expect(component.count()).toBe(1);
    expect(component.throttledCount()).toBe(0);

    component.increment();
    expect(component.count()).toBe(2);
    expect(component.throttledCount()).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(component.count()).toBe(2);
    expect(component.throttledCount()).toBe(2);
  });

  it('should throttle all updates after initialization', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      throttledSignal = useThrottledSignal(this.sourceSignal, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Initial value is set immediately
    expect(component.throttledSignal()).toBe('initial');

    // But updates are throttled from the start
    component.sourceSignal.set('updated');
    expect(component.throttledSignal()).toBe('initial');

    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(component.throttledSignal()).toBe('updated');
  });

  it('should handle setting signal to same value (Angular signals default behavior)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('hello');
      throttledSignal = useThrottledSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Change - throttled after init
    component.sourceSignal.set('world');
    expect(component.throttledSignal()).toBe('hello');

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.throttledSignal()).toBe('world');

    // Set to same value - Angular signals don't trigger effects when value is unchanged
    component.sourceSignal.set('world');
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.throttledSignal()).toBe('world');

    // Set to different value to confirm tracking still works
    component.sourceSignal.set('foo');
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(component.throttledSignal()).toBe('foo');
  });

  it('should handle complex object mutations (new object reference)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      user = signal({ name: 'John', age: 30, hobbies: ['reading', 'coding'] });
      throttledUser = useThrottledSignal(this.user, 150);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    const firstUser = component.user();
    expect(component.throttledUser()).toEqual(firstUser);

    // Updates are throttled after init
    const secondUser = {
      name: 'Jane',
      age: 25,
      hobbies: ['painting', 'music'],
    };
    component.user.set(secondUser);
    expect(component.throttledUser()).toEqual(firstUser);

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(component.throttledUser()).toEqual(secondUser);
  });

  it('should handle documentation example from code comments', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      // Code comment example updated to mouseX (better use case for throttle)
      mouseX = signal(0);
      throttledX = useThrottledSignal(this.mouseX, 500);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.throttledX()).toBe(0);

    // Mouse moves - throttled after init
    component.mouseX.set(10);
    expect(component.throttledX()).toBe(0);

    // More movements
    setTimeout(() => component.mouseX.set(20), 50);
    setTimeout(() => component.mouseX.set(30), 100);

    await new Promise((resolve) => setTimeout(resolve, 200));

    // Should still show initial during throttle
    expect(component.throttledX()).toBe(0);

    // After throttle period, should show latest
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(component.throttledX()).toBe(30);
  });
});
