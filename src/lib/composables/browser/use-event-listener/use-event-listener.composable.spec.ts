import { TestBed } from '@angular/core/testing';
import {
  Component,
  provideZonelessChangeDetection,
  PLATFORM_ID,
  ElementRef,
  viewChild,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { useEventListener } from './use-event-listener.composable';

describe('useEventListener', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should attach event listener to window by default', () => {
    let eventFired = false;

    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener('custom-test-event', () => {
          eventFired = true;
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Dispatch event on window
    window.dispatchEvent(new Event('custom-test-event'));

    expect(eventFired).toBe(true);
  });

  it('should attach event listener to document when specified', () => {
    let eventFired = false;

    @Component({
      template: '',
    })
    class TestComponent {
      private document = TestBed.inject(DOCUMENT);

      constructor() {
        useEventListener(
          'custom-doc-event',
          () => {
            eventFired = true;
          },
          { target: this.document },
        );
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Dispatch event on document
    fixture.componentInstance['document'].dispatchEvent(new Event('custom-doc-event'));

    expect(eventFired).toBe(true);
  });

  it('should attach event listener to element when specified', () => {
    let eventFired = false;

    @Component({
      template: '<div #testDiv></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef>('testDiv');

      constructor() {
        useEventListener(
          'custom-element-event',
          () => {
            eventFired = true;
          },
          { target: this.divRef },
        );
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Get the native element and dispatch event
    const divElement = fixture.componentInstance.divRef()?.nativeElement;
    divElement?.dispatchEvent(new Event('custom-element-event'));

    expect(eventFired).toBe(true);
  });

  it('should pass event object to handler', () => {
    let receivedEvent: Event | null = null;

    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener('test-event', (event) => {
          receivedEvent = event;
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const customEvent = new Event('test-event');
    window.dispatchEvent(customEvent);

    expect(receivedEvent).toBe(customEvent as any);
  });

  it('should handle keyboard events with correct typing', () => {
    let keyPressed: string | null = null;

    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener('keydown', (event) => {
          keyPressed = event.key;
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    window.dispatchEvent(keyEvent);

    expect(keyPressed as any).toBe('Enter');
  });

  it('should handle mouse events with correct typing', () => {
    let clickPosition: { x: number; y: number } | null = null;

    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener('click', (event) => {
          clickPosition = { x: event.clientX, y: event.clientY };
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const clickEvent = new MouseEvent('click', { clientX: 100, clientY: 200 });
    window.dispatchEvent(clickEvent);

    expect(clickPosition as any).toEqual({ x: 100, y: 200 });
  });

  it('should support passive option', () => {
    let eventFired = false;

    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener(
          'scroll',
          () => {
            eventFired = true;
          },
          { passive: true },
        );
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    window.dispatchEvent(new Event('scroll'));

    expect(eventFired).toBe(true);
  });

  it('should support capture option', () => {
    let eventFired = false;

    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener(
          'test-capture',
          () => {
            eventFired = true;
          },
          { capture: true },
        );
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    window.dispatchEvent(new Event('test-capture'));

    expect(eventFired).toBe(true);
  });

  it('should support once option', () => {
    let eventCount = 0;

    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener(
          'test-once',
          () => {
            eventCount++;
          },
          { once: true },
        );
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Dispatch event multiple times
    window.dispatchEvent(new Event('test-once'));
    window.dispatchEvent(new Event('test-once'));
    window.dispatchEvent(new Event('test-once'));

    // Should only fire once
    expect(eventCount).toBe(1);
  });

  it('should clean up event listener on component destroy', () => {
    let eventCount = 0;

    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener('test-cleanup', () => {
          eventCount++;
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Event should fire before destroy
    window.dispatchEvent(new Event('test-cleanup'));
    expect(eventCount).toBe(1);

    // Destroy component
    fixture.destroy();

    // Event should not fire after destroy
    window.dispatchEvent(new Event('test-cleanup'));
    expect(eventCount).toBe(1); // Still 1, not 2
  });

  it('should handle signal targets that change', () => {
    let eventCount = 0;

    @Component({
      template: '<div #div1></div><div #div2></div>',
    })
    class TestComponent {
      div1Ref = viewChild<ElementRef>('div1');
      div2Ref = viewChild<ElementRef>('div2');
      currentTarget = signal<ElementRef | null>(null);

      constructor() {
        useEventListener(
          'test-signal',
          () => {
            eventCount++;
          },
          { target: this.currentTarget },
        );
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Initially no target
    const div1 = component.div1Ref()?.nativeElement;
    const div2 = component.div2Ref()?.nativeElement;

    div1?.dispatchEvent(new Event('test-signal'));
    expect(eventCount).toBe(0); // No target set yet

    // Set target to div1
    component.currentTarget.set(component.div1Ref()!);
    fixture.detectChanges();

    div1?.dispatchEvent(new Event('test-signal'));
    expect(eventCount).toBe(1);

    // Change target to div2
    component.currentTarget.set(component.div2Ref()!);
    fixture.detectChanges();

    div1?.dispatchEvent(new Event('test-signal'));
    expect(eventCount).toBe(1); // Should not fire on div1 anymore

    div2?.dispatchEvent(new Event('test-signal'));
    expect(eventCount).toBe(2); // Should fire on div2
  });

  it('should handle ElementRef targets directly', () => {
    let eventFired = false;

    @Component({
      template: '<button #btn>Click me</button>',
    })
    class TestComponent {
      btnRef = viewChild<ElementRef>('btn');

      constructor() {
        useEventListener(
          'click',
          () => {
            eventFired = true;
          },
          { target: this.btnRef },
        );
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const button = fixture.componentInstance.btnRef()?.nativeElement;
    button?.dispatchEvent(new Event('click'));

    expect(eventFired).toBe(true);
  });

  it('should handle null targets gracefully', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener(
          'test-null',
          () => {
            // Should not throw
          },
          { target: null },
        );
      }
    }

    expect(() => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should be no-op on server', () => {
    // Override PLATFORM_ID to simulate server environment
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
    });

    let eventFired = false;

    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener('test-ssr', () => {
          eventFired = true;
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Event should not fire on server
    window.dispatchEvent(new Event('test-ssr'));
    expect(eventFired).toBe(false);
  });

  it('should handle custom events with detail', () => {
    let eventDetail: any = null;

    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener('custom-detail', (event) => {
          eventDetail = (event as CustomEvent).detail;
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const customEvent = new CustomEvent('custom-detail', { detail: { data: 'test' } });
    window.dispatchEvent(customEvent);

    expect(eventDetail).toEqual({ data: 'test' });
  });

  it('should allow multiple listeners for same event', () => {
    let count1 = 0;
    let count2 = 0;

    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener('multi-listener', () => {
          count1++;
        });
        useEventListener('multi-listener', () => {
          count2++;
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    window.dispatchEvent(new Event('multi-listener'));

    expect(count1).toBe(1);
    expect(count2).toBe(1);
  });

  it('should handle rapid event firing', () => {
    let eventCount = 0;

    @Component({
      template: '',
    })
    class TestComponent {
      constructor() {
        useEventListener('rapid-fire', () => {
          eventCount++;
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Fire event 100 times rapidly
    for (let i = 0; i < 100; i++) {
      window.dispatchEvent(new Event('rapid-fire'));
    }

    expect(eventCount).toBe(100);
  });

  it('should handle viewChild signal timing correctly (undefined in constructor)', () => {
    let eventCount = 0;

    @Component({
      template: '<div #testDiv></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef>('testDiv');

      constructor() {
        // In Angular's test environment, viewChild may already be initialized
        // The important behavior is that the composable handles both cases gracefully
        useEventListener(
          'test-timing',
          () => {
            eventCount++;
          },
          { target: this.divRef },
        );
      }
    }

    const fixture = TestBed.createComponent(TestComponent);

    // Trigger change detection to ensure view is fully initialized
    fixture.detectChanges();

    // Element should be available and listener attached
    const divElement = fixture.componentInstance.divRef()?.nativeElement;
    expect(divElement).toBeDefined();

    // Event should fire
    divElement?.dispatchEvent(new Event('test-timing'));
    expect(eventCount).toBe(1);
  });

  it('should not re-register listener when signal emits same element reference', () => {
    let addEventListenerCalls = 0;
    let removeEventListenerCalls = 0;

    @Component({
      template: '<div #testDiv></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef>('testDiv');
      targetSignal = signal<ElementRef | null>(null);

      constructor() {
        useEventListener('test-same-ref', () => {}, { target: this.targetSignal });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const divElement = fixture.componentInstance.divRef()?.nativeElement;
    const originalAddEventListener = divElement.addEventListener.bind(divElement);
    const originalRemoveEventListener = divElement.removeEventListener.bind(divElement);

    // Spy on addEventListener and removeEventListener
    divElement.addEventListener = function (...args: any[]) {
      addEventListenerCalls++;
      return originalAddEventListener(...args);
    };

    divElement.removeEventListener = function (...args: any[]) {
      removeEventListenerCalls++;
      return originalRemoveEventListener(...args);
    };

    // Set target first time
    const elementRef = fixture.componentInstance.divRef()!;
    fixture.componentInstance.targetSignal.set(elementRef);
    fixture.detectChanges();

    expect(addEventListenerCalls).toBe(1);
    expect(removeEventListenerCalls).toBe(0);

    // Set same target again (same reference)
    fixture.componentInstance.targetSignal.set(elementRef);
    fixture.detectChanges();

    // Should NOT re-register listener
    expect(addEventListenerCalls).toBe(1); // Still 1, not 2
    expect(removeEventListenerCalls).toBe(0); // Still 0

    // Trigger signal update by setting to null then back
    fixture.componentInstance.targetSignal.set(null);
    fixture.detectChanges();

    expect(removeEventListenerCalls).toBe(1); // Should remove

    fixture.componentInstance.targetSignal.set(elementRef);
    fixture.detectChanges();

    expect(addEventListenerCalls).toBe(2); // Should re-add
  });
});
