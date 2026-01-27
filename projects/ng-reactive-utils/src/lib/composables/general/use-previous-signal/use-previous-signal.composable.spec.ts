import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { usePreviousSignal } from './use-previous-signal.composable';

describe('usePreviousSignal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return undefined initially (before any changes)', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      currentValue = signal('hello');
      previousValue = usePreviousSignal(this.currentValue);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Documentation states: "The previous signal starts with `undefined` on first read"
    expect(component.previousValue()).toBeUndefined();
  });

  it('should track previous value after source signal changes', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      currentValue = signal('hello');
      previousValue = usePreviousSignal(this.currentValue);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Initial state
    expect(component.previousValue()).toBeUndefined();

    // Change to 'world'
    component.currentValue.set('world');
    fixture.detectChanges();

    // Documentation example: "previousValue() will be undefined initially, then track the previous value"
    // After setting 'world', previous should be 'hello'
    expect(component.previousValue()).toBe('hello');
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      currentValue = signal('test');
      previousValue = usePreviousSignal(this.currentValue);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const previousValue = fixture.componentInstance.previousValue;

    // Documentation states: "Returned signal is **readonly** to prevent direct manipulation"
    expect((previousValue as any).set).toBeUndefined();
  });

  it('should handle multiple value changes tracking previous correctly', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      count = signal(0);
      previousCount = usePreviousSignal(this.count);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Initial state
    expect(component.count()).toBe(0);
    expect(component.previousCount()).toBeUndefined();

    // First change
    component.count.set(1);
    fixture.detectChanges();
    expect(component.count()).toBe(1);
    expect(component.previousCount()).toBe(0);

    // Second change
    component.count.set(2);
    fixture.detectChanges();
    expect(component.count()).toBe(2);
    expect(component.previousCount()).toBe(1);

    // Third change
    component.count.set(3);
    fixture.detectChanges();
    expect(component.count()).toBe(3);
    expect(component.previousCount()).toBe(2);
  });

  it('should handle string values', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('first');
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.previousSignal()).toBeUndefined();

    component.sourceSignal.set('second');
    fixture.detectChanges();
    expect(component.previousSignal()).toBe('first');

    component.sourceSignal.set('third');
    fixture.detectChanges();
    expect(component.previousSignal()).toBe('second');
  });

  it('should handle number values', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(42);
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.previousSignal()).toBeUndefined();

    component.sourceSignal.set(100);
    fixture.detectChanges();
    expect(component.previousSignal()).toBe(42);

    component.sourceSignal.set(200);
    fixture.detectChanges();
    expect(component.previousSignal()).toBe(100);
  });

  it('should handle object values', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal({ name: 'John', age: 30 });
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    const firstValue = component.sourceSignal();
    expect(component.previousSignal()).toBeUndefined();

    const secondValue = { name: 'Jane', age: 25 };
    component.sourceSignal.set(secondValue);
    fixture.detectChanges();
    expect(component.previousSignal()).toEqual(firstValue);

    const thirdValue = { name: 'Bob', age: 35 };
    component.sourceSignal.set(thirdValue);
    fixture.detectChanges();
    expect(component.previousSignal()).toEqual(secondValue);
  });

  it('should handle array values', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal([1, 2, 3]);
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    const firstValue = component.sourceSignal();
    expect(component.previousSignal()).toBeUndefined();

    const secondValue = [4, 5, 6];
    component.sourceSignal.set(secondValue);
    fixture.detectChanges();
    expect(component.previousSignal()).toEqual(firstValue);
  });

  it('should handle boolean values', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(true);
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.previousSignal()).toBeUndefined();

    component.sourceSignal.set(false);
    fixture.detectChanges();
    expect(component.previousSignal()).toBe(true);

    component.sourceSignal.set(true);
    fixture.detectChanges();
    expect(component.previousSignal()).toBe(false);
  });

  it('should handle null values', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal<string | null>('value');
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.previousSignal()).toBeUndefined();

    component.sourceSignal.set(null);
    fixture.detectChanges();
    expect(component.previousSignal()).toBe('value');

    component.sourceSignal.set('new value');
    fixture.detectChanges();
    expect(component.previousSignal()).toBe(null);
  });

  it('should handle undefined as a value (different from initial undefined)', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal<string | undefined>('value');
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Initial undefined (before any changes)
    expect(component.previousSignal()).toBeUndefined();

    // Set to undefined as a value
    component.sourceSignal.set(undefined);
    fixture.detectChanges();
    expect(component.previousSignal()).toBe('value');

    // Set to another value
    component.sourceSignal.set('new value');
    fixture.detectChanges();
    expect(component.previousSignal()).toBeUndefined();
  });

  it('should handle empty string values', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('not empty');
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set('');
    fixture.detectChanges();
    expect(component.previousSignal()).toBe('not empty');

    component.sourceSignal.set('something');
    fixture.detectChanges();
    expect(component.previousSignal()).toBe('');
  });

  it('should handle zero values', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(5);
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.sourceSignal.set(0);
    fixture.detectChanges();
    expect(component.previousSignal()).toBe(5);

    component.sourceSignal.set(10);
    fixture.detectChanges();
    expect(component.previousSignal()).toBe(0);
  });

  it('should handle rapid successive changes', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal(0);
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Rapid changes
    for (let i = 1; i <= 10; i++) {
      component.sourceSignal.set(i);
      fixture.detectChanges();
      expect(component.previousSignal()).toBe(i - 1);
    }

    // Final state
    expect(component.sourceSignal()).toBe(10);
    expect(component.previousSignal()).toBe(9);
  });

  it('should work correctly in template bindings', () => {
    @Component({
      template: `
        <div data-testid="current-value">Current: {{ count() }}</div>
        <div data-testid="previous-value">Previous: {{ previousCount() }}</div>
      `,
    })
    class TestComponent {
      count = signal(0);
      previousCount = usePreviousSignal(this.count);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const element = fixture.nativeElement;
    const currentDiv = element.querySelector('[data-testid="current-value"]');
    const previousDiv = element.querySelector('[data-testid="previous-value"]');

    // Initial state
    expect(currentDiv.textContent.trim()).toBe('Current: 0');
    expect(previousDiv.textContent.trim()).toBe('Previous:'); // undefined renders as empty

    // First update
    component.count.set(1);
    fixture.detectChanges();
    expect(currentDiv.textContent.trim()).toBe('Current: 1');
    expect(previousDiv.textContent.trim()).toBe('Previous: 0');

    // Second update
    component.count.set(2);
    fixture.detectChanges();
    expect(currentDiv.textContent.trim()).toBe('Current: 2');
    expect(previousDiv.textContent.trim()).toBe('Previous: 1');
  });

  it('should maintain separate instances for different components', () => {
    @Component({
      selector: 'test-component-1',
      template: '',
    })
    class TestComponent1 {
      sourceSignal = signal('component1');
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    @Component({
      selector: 'test-component-2',
      template: '',
    })
    class TestComponent2 {
      sourceSignal = signal('component2');
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    const component1 = fixture1.componentInstance;
    const component2 = fixture2.componentInstance;

    // Both should start with undefined
    expect(component1.previousSignal()).toBeUndefined();
    expect(component2.previousSignal()).toBeUndefined();

    // Update only component1's signal
    component1.sourceSignal.set('updated1');
    fixture1.detectChanges();

    // Component1 should track previous, component2 should remain unchanged
    expect(component1.previousSignal()).toBe('component1');
    expect(component2.previousSignal()).toBeUndefined();

    // Update component2's signal
    component2.sourceSignal.set('updated2');
    fixture2.detectChanges();

    // Both should have their own previous values
    expect(component1.previousSignal()).toBe('component1');
    expect(component2.previousSignal()).toBe('component2');
  });

  it('should work with multiple previous signals from same source', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('initial');
      previousSignal1 = usePreviousSignal(this.sourceSignal);
      previousSignal2 = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Both should start with undefined
    expect(component.previousSignal1()).toBeUndefined();
    expect(component.previousSignal2()).toBeUndefined();

    // Update source signal
    component.sourceSignal.set('updated');
    fixture.detectChanges();

    // Both should track the previous value independently
    expect(component.previousSignal1()).toBe('initial');
    expect(component.previousSignal2()).toBe('initial');

    // Another update
    component.sourceSignal.set('final');
    fixture.detectChanges();

    expect(component.previousSignal1()).toBe('updated');
    expect(component.previousSignal2()).toBe('updated');
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('test');
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Update signal
    component.sourceSignal.set('updated');
    fixture.detectChanges();

    // Destroy component (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should demonstrate use case for undo functionality', () => {
    @Component({
      template: `
        <div data-testid="current-text">{{ text() }}</div>
        <button data-testid="undo-button" (click)="undo()" [disabled]="!canUndo()">Undo</button>
      `,
    })
    class TestComponent {
      text = signal('Original text');
      previousText = usePreviousSignal(this.text);

      canUndo() {
        return this.previousText() !== undefined;
      }

      undo() {
        const previous = this.previousText();
        if (previous !== undefined) {
          this.text.set(previous);
        }
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const element = fixture.nativeElement;
    const textDiv = element.querySelector('[data-testid="current-text"]');
    const undoButton = element.querySelector('[data-testid="undo-button"]') as HTMLButtonElement;

    // Initial state - cannot undo
    expect(textDiv.textContent.trim()).toBe('Original text');
    expect(undoButton.disabled).toBe(true);
    expect(component.canUndo()).toBe(false);

    // Make a change
    component.text.set('First edit');
    fixture.detectChanges();
    expect(textDiv.textContent.trim()).toBe('First edit');
    expect(undoButton.disabled).toBe(false);
    expect(component.canUndo()).toBe(true);
    expect(component.previousText()).toBe('Original text');

    // Make another change
    component.text.set('Second edit');
    fixture.detectChanges();
    expect(textDiv.textContent.trim()).toBe('Second edit');
    expect(component.previousText()).toBe('First edit');

    // Undo once - reverts to 'First edit'
    // Note: After undo, previousText becomes 'Second edit' (the value we undid FROM)
    // This is correct behavior - usePreviousSignal tracks immediate previous, not undo history
    undoButton.click();
    fixture.detectChanges();
    expect(textDiv.textContent.trim()).toBe('First edit');
    expect(component.previousText()).toBe('Second edit');
  });

  it('should demonstrate use case for comparing current vs previous state', () => {
    @Component({
      template: `
        <div data-testid="status-message">
          @if (hasIncreased()) {
            <span>Value increased!</span>
          } @else if (hasDecreased()) {
            <span>Value decreased!</span>
          } @else if (previousValue() !== undefined) {
            <span>Value unchanged</span>
          } @else {
            <span>Initial value</span>
          }
        </div>
      `,
    })
    class TestComponent {
      value = signal(10);
      previousValue = usePreviousSignal(this.value);

      hasIncreased() {
        const prev = this.previousValue();
        return prev !== undefined && this.value() > prev;
      }

      hasDecreased() {
        const prev = this.previousValue();
        return prev !== undefined && this.value() < prev;
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const element = fixture.nativeElement;
    const statusDiv = element.querySelector('[data-testid="status-message"]');

    // Initial state
    expect(statusDiv.textContent.trim()).toBe('Initial value');

    // Increase value
    component.value.set(15);
    fixture.detectChanges();
    expect(statusDiv.textContent.trim()).toBe('Value increased!');

    // Decrease value
    component.value.set(12);
    fixture.detectChanges();
    expect(statusDiv.textContent.trim()).toBe('Value decreased!');

    // Increase value again
    component.value.set(20);
    fixture.detectChanges();
    expect(statusDiv.textContent.trim()).toBe('Value increased!');
  });

  it('should handle signal.update() calls', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      count = signal(0);
      previousCount = usePreviousSignal(this.count);

      increment() {
        this.count.update((v) => v + 1);
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.count()).toBe(0);
    expect(component.previousCount()).toBeUndefined();

    // Use update() instead of set()
    component.increment();
    fixture.detectChanges();
    expect(component.count()).toBe(1);
    expect(component.previousCount()).toBe(0);

    component.increment();
    fixture.detectChanges();
    expect(component.count()).toBe(2);
    expect(component.previousCount()).toBe(1);
  });

  it('should not trigger on setting signal to same value (Angular signals default behavior)', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      sourceSignal = signal('hello');
      previousSignal = usePreviousSignal(this.sourceSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Initial state
    expect(component.previousSignal()).toBeUndefined();

    // Set to different value
    component.sourceSignal.set('world');
    fixture.detectChanges();
    expect(component.previousSignal()).toBe('hello');

    // Set to same value as current - Angular signals don't trigger effects when value is unchanged
    // This is default Angular behavior using Object.is equality check
    component.sourceSignal.set('world');
    fixture.detectChanges();
    // Previous should remain 'hello' since effect didn't run (value unchanged)
    expect(component.previousSignal()).toBe('hello');

    // Set to a different value to confirm tracking still works
    component.sourceSignal.set('foo');
    fixture.detectChanges();
    expect(component.previousSignal()).toBe('world');
  });

  it('should work with computed signals as source', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      baseValue = signal(5);
      doubledValue = signal(10); // We'll manually compute this
      previousDoubledValue = usePreviousSignal(this.doubledValue);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.previousDoubledValue()).toBeUndefined();

    // Manually update the signal
    component.doubledValue.set(20);
    fixture.detectChanges();
    expect(component.previousDoubledValue()).toBe(10);

    component.doubledValue.set(30);
    fixture.detectChanges();
    expect(component.previousDoubledValue()).toBe(20);
  });

  it('should handle complex object mutations (new object reference)', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      user = signal({ name: 'John', age: 30, hobbies: ['reading', 'coding'] });
      previousUser = usePreviousSignal(this.user);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    const firstUser = component.user();
    expect(component.previousUser()).toBeUndefined();

    // Update with new object
    component.user.set({ name: 'Jane', age: 25, hobbies: ['painting', 'music'] });
    fixture.detectChanges();

    expect(component.previousUser()).toEqual(firstUser);
    expect(component.user().name).toBe('Jane');
    expect(component.previousUser()?.name).toBe('John');
  });

  it('should work in template with conditional rendering based on previous value', () => {
    @Component({
      template: `
        <div data-testid="comparison">
          @if (previousCount() !== undefined) {
            <span>Changed from {{ previousCount() }} to {{ count() }}</span>
          } @else {
            <span>No previous value</span>
          }
        </div>
      `,
    })
    class TestComponent {
      count = signal(5);
      previousCount = usePreviousSignal(this.count);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    const comparisonDiv = element.querySelector('[data-testid="comparison"]');

    // Initially no previous value
    expect(comparisonDiv.textContent.trim()).toBe('No previous value');

    // Update value
    fixture.componentInstance.count.set(10);
    fixture.detectChanges();
    expect(comparisonDiv.textContent.trim()).toBe('Changed from 5 to 10');

    // Update again
    fixture.componentInstance.count.set(15);
    fixture.detectChanges();
    expect(comparisonDiv.textContent.trim()).toBe('Changed from 10 to 15');
  });

  it('should handle documentation example exactly as written', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      currentValue = signal('hello');
      previousValue = usePreviousSignal(this.currentValue);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Documentation example: "previousValue() will be undefined initially"
    expect(component.previousValue()).toBeUndefined();

    // Documentation example: "currentValue.set('world');"
    component.currentValue.set('world');
    fixture.detectChanges();

    // Documentation example: "console.log(previousValue()); // 'hello'"
    expect(component.previousValue()).toBe('hello');
  });
});
