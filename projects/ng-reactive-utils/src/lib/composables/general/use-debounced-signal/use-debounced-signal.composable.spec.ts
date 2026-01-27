import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { useDebouncedSignal } from './use-debounced-signal.composable';

describe('useDebouncedSignal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return initial value from source signal', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial value');
      debouncedSignal = useDebouncedSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.debouncedSignal()).toBe('initial value');
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('test');
      debouncedSignal = useDebouncedSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const debouncedSignal = fixture.componentInstance.debouncedSignal;

    // Should not have .set() method (readonly signal)
    expect((debouncedSignal as any).set).toBeUndefined();
  });

  it('should update after default debounce delay (300ms)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      debouncedSignal = useDebouncedSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Update source signal
    component.sourceSignal.set('updated');

    // Should not update immediately
    expect(component.debouncedSignal()).toBe('initial');

    // Should update after default 300ms delay + buffer
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(component.debouncedSignal()).toBe('updated');
  });

  it('should support custom debounce delay values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 500);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Update source signal
    component.sourceSignal.set('updated');

    // Should not update before delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(component.debouncedSignal()).toBe('initial');

    // Should update after custom 500ms delay + buffer
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(component.debouncedSignal()).toBe('updated');
  });

  it('should only emit last value after rapid changes (debouncing behavior)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(0);
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Rapidly update source signal
    for (let i = 1; i <= 10; i++) {
      component.sourceSignal.set(i);
    }

    // Should still have initial value immediately
    expect(component.debouncedSignal()).toBe(0);

    // Should only emit the last value (10) after debounce delay
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(component.debouncedSignal()).toBe(10);
  });

  it('should reset timer with each new value from source signal', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // First update
    component.sourceSignal.set('first');

    // Wait 150ms (not enough for debounce to trigger)
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Second update - should reset the timer
    component.sourceSignal.set('second');

    // Wait another 150ms (total 300ms from first update, but only 150ms from second)
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should still have initial value because timer was reset
    expect(component.debouncedSignal()).toBe('initial');

    // Wait for second update's debounce to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(component.debouncedSignal()).toBe('second');
  });

  it('should handle string values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('hello');
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set('world');

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(component.debouncedSignal()).toBe('world');
  });

  it('should handle number values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(42);
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set(100);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(component.debouncedSignal()).toBe(100);
  });

  it('should handle object values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal({ name: 'John', age: 30 });
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    const newValue = { name: 'Jane', age: 25 };
    component.sourceSignal.set(newValue);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(component.debouncedSignal()).toEqual(newValue);
  });

  it('should handle array values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal([1, 2, 3]);
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    const newValue = [4, 5, 6];
    component.sourceSignal.set(newValue);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(component.debouncedSignal()).toEqual(newValue);
  });

  it('should handle boolean values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(true);
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set(false);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(component.debouncedSignal()).toBe(false);
  });

  it('should handle null and undefined values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal<string | null | undefined>('value');
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set(null);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(component.debouncedSignal()).toBe(null);

    component.sourceSignal.set(undefined);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(component.debouncedSignal()).toBe(undefined);
  });

  it('should handle zero delay', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set('updated');

    // With 0ms delay, should update very quickly
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.debouncedSignal()).toBe('updated');
  });

  it('should clean up on component destroy (cancel debounce)', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('test');
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 300);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Update signal
    component.sourceSignal.set('updated');

    // Destroy component before debounce completes (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should handle multiple rapid updates with quiet period', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Rapid updates
    component.sourceSignal.set('update1');
    setTimeout(() => component.sourceSignal.set('update2'), 50);
    setTimeout(() => component.sourceSignal.set('update3'), 100);
    setTimeout(() => component.sourceSignal.set('update4'), 150);

    // Should still have initial value during rapid updates
    await new Promise((resolve) => setTimeout(resolve, 180));

    expect(component.debouncedSignal()).toBe('initial');

    // After quiet period, should have the last value
    await new Promise((resolve) => setTimeout(resolve, 220));

    expect(component.debouncedSignal()).toBe('update4');
  });

  it('should work with multiple debounced signals from same source', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      debouncedSignal1 = useDebouncedSignal(this.sourceSignal, 100);
      debouncedSignal2 = useDebouncedSignal(this.sourceSignal, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set('updated');

    // First debounced signal should update after 100ms
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(component.debouncedSignal1()).toBe('updated');
    expect(component.debouncedSignal2()).toBe('initial'); // Not updated yet

    // Second debounced signal should update after 200ms
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(component.debouncedSignal1()).toBe('updated');
    expect(component.debouncedSignal2()).toBe('updated');
  });

  it('should work correctly in template bindings', async () => {
    @Component({
      template: `
        <div data-testid="source-value">Source: {{ sourceSignal() }}</div>
        <div data-testid="debounced-value">Debounced: {{ debouncedSignal() }}</div>
      `,
    })
    class TestComponent {
      sourceSignal = signal('initial');
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 200);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const element = fixture.nativeElement;
    const sourceDiv = element.querySelector('[data-testid="source-value"]');
    const debouncedDiv = element.querySelector('[data-testid="debounced-value"]');

    // Initially both should show 'initial'
    expect(sourceDiv.textContent.trim()).toBe('Source: initial');
    expect(debouncedDiv.textContent.trim()).toBe('Debounced: initial');

    // Update source signal
    component.sourceSignal.set('updated');
    fixture.detectChanges();

    // Source should update immediately, debounced should not
    expect(sourceDiv.textContent.trim()).toBe('Source: updated');
    expect(debouncedDiv.textContent.trim()).toBe('Debounced: initial');

    // After debounce delay, both should show 'updated'
    await new Promise((resolve) => setTimeout(resolve, 250));

    fixture.detectChanges();
    expect(sourceDiv.textContent.trim()).toBe('Source: updated');
    expect(debouncedDiv.textContent.trim()).toBe('Debounced: updated');
  });

  it('should handle continuous updates with different quiet periods', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(0);
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 150);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // First burst of updates
    component.sourceSignal.set(1);
    component.sourceSignal.set(2);
    component.sourceSignal.set(3);

    // Wait for first debounce
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(component.debouncedSignal()).toBe(3);

    // Second burst of updates
    component.sourceSignal.set(4);
    component.sourceSignal.set(5);

    // Wait for second debounce
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(component.debouncedSignal()).toBe(5);
  });

  it('should maintain separate instances for different components', async () => {
    @Component({
      selector: 'test-component-1',
      template: '',
    })
    class TestComponent1 {
      sourceSignal = signal('component1');
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 100);
    }

    @Component({
      selector: 'test-component-2',
      template: '',
    })
    class TestComponent2 {
      sourceSignal = signal('component2');
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 100);
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    const component1 = fixture1.componentInstance;
    const component2 = fixture2.componentInstance;

    // Update only component1's signal
    component1.sourceSignal.set('updated1');

    await new Promise((resolve) => setTimeout(resolve, 150));

    // Component1 should update, component2 should not
    expect(component1.debouncedSignal()).toBe('updated1');
    expect(component2.debouncedSignal()).toBe('component2');
  });

  it('should handle very long delay values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 1000);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set('updated');

    // Should not update before delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(component.debouncedSignal()).toBe('initial');

    // Should update after long delay
    await new Promise((resolve) => setTimeout(resolve, 550));

    expect(component.debouncedSignal()).toBe('updated');
  });

  it('should handle empty string values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('not empty');
      debouncedSignal = useDebouncedSignal(this.sourceSignal, 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set('');

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(component.debouncedSignal()).toBe('');
  });

  it('should demonstrate use case for search input (waits for user to stop typing)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      searchInputText = signal('');
      debouncedSearchInputText = useDebouncedSignal(this.searchInputText, 500);
      // In real app, this would trigger API call
      apiCallCount = 0;

      constructor() {
        // Simulate API call trigger
        const debouncedSignal = this.debouncedSearchInputText;
        const interval = setInterval(() => {
          debouncedSignal(); // Access signal to check value
        }, 100);

        setTimeout(() => clearInterval(interval), 2000);
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Simulate user typing (rapid updates)
    component.searchInputText.set('a');
    setTimeout(() => component.searchInputText.set('an'), 50);
    setTimeout(() => component.searchInputText.set('ang'), 100);
    setTimeout(() => component.searchInputText.set('angu'), 150);
    setTimeout(() => component.searchInputText.set('angul'), 200);
    setTimeout(() => component.searchInputText.set('angula'), 250);
    setTimeout(() => component.searchInputText.set('angular'), 300);

    // During typing, debounced value should not update
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(component.debouncedSearchInputText()).toBe('');

    // After user stops typing (500ms after last keystroke), should update
    await new Promise((resolve) => setTimeout(resolve, 450));

    expect(component.debouncedSearchInputText()).toBe('angular');
  });
});
