# useEventListener

Attaches an event listener to a target (window, document, or element) with automatic cleanup. The listener is automatically removed when the component is destroyed.

**MDN Reference:** [EventTarget.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

## Usage

### Window Events

```typescript
import { useEventListener } from 'ng-reactive-utils';

@Component({
  template: `
    <p>Key pressed: {{ lastKey() }}</p>
    <p>Total clicks: {{ clickCount() }}</p>
  `,
})
class WindowEventsComponent {
  lastKey = signal('');
  clickCount = signal(0);

  constructor() {
    // Listen to keydown events on window
    useEventListener('keydown', (event) => {
      this.lastKey.set(event.key);
    });

    // Listen to click events on window
    useEventListener('click', () => {
      this.clickCount.update((count) => count + 1);
    });
  }
}
```

### Document Events

```typescript
import { DOCUMENT } from '@angular/common';

@Component({
  template: `<p>Mouse button: {{ mouseButton() }}</p>`,
})
class DocumentEventsComponent {
  private document = inject(DOCUMENT);
  mouseButton = signal('');

  constructor() {
    // Listen to mousedown events on document
    useEventListener(
      'mousedown',
      (event) => {
        this.mouseButton.set(`Button ${event.button}`);
      },
      { target: this.document },
    );
  }
}
```

### Element Events

```typescript
@Component({
  template: `
    <div #box>Hover over me</div>
    <p>Mouse in box: {{ isHovering() }}</p>
  `,
})
class ElementEventsComponent {
  boxRef = viewChild<ElementRef>('box');
  isHovering = signal(false);

  constructor() {
    // Listen to mouseenter/mouseleave on element
    // Note: boxRef() is undefined in constructor, but the composable
    // handles this gracefully - listener attaches once element is available
    useEventListener(
      'mouseenter',
      () => {
        this.isHovering.set(true);
      },
      { target: this.boxRef },
    );

    useEventListener(
      'mouseleave',
      () => {
        this.isHovering.set(false);
      },
      { target: this.boxRef },
    );
  }
}
```

### Manual Cleanup

```typescript
@Component({
  template: `
    <p>Tracking: {{ isTracking() }}</p>
    <p>Move count: {{ moveCount() }}</p>
    <button (click)="stopTracking()">Stop Tracking</button>
  `,
})
class ManualCleanupComponent {
  isTracking = signal(true);
  moveCount = signal(0);

  cleanupMouseMove = useEventListener('mousemove', () => {
    this.moveCount.update((count) => count + 1);
  });

  stopTracking() {
    this.cleanupMouseMove();
    this.isTracking.set(false);
  }
}
```

### Manual Cleanup with Signal Target

```typescript
@Component({
  template: `
    <div #box>Hover zone</div>
    <button (click)="disableTracking()">Disable</button>
  `,
})
class SignalCleanupComponent {
  boxRef = viewChild<ElementRef>('box');
  private cleanupHover: () => void;

  constructor() {
    // Cleanup also works with signal targets — destroys the
    // underlying effect and removes the current listener
    this.cleanupHover = useEventListener('mouseenter', () => console.log('Entered'), {
      target: this.boxRef,
    });
  }

  disableTracking() {
    this.cleanupHover();
  }
}
```

### Scroll Event with Throttling

```typescript
@Component({
  template: `<p>Scroll position: {{ scrollY() }}</p>`,
})
class ScrollTrackerComponent {
  scrollY = signal(0);

  constructor() {
    const throttledHandler = throttle((event: Event) => {
      this.scrollY.set(window.scrollY);
    }, 100);

    useEventListener('scroll', throttledHandler, { passive: true });
  }
}
```

### Keyboard Shortcuts

```typescript
@Component({
  template: `<p>Press Ctrl+S to save ({{ saveCount() }} times)</p>`,
})
class KeyboardShortcutsComponent {
  saveCount = signal(0);

  constructor() {
    useEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        this.saveCount.update((count) => count + 1);
        console.log('Save triggered!');
      }
    });
  }
}
```

### Resize with Debouncing

```typescript
@Component({
  template: `<p>Resize count: {{ resizeCount() }}</p>`,
})
class ResizeCounterComponent {
  resizeCount = signal(0);

  constructor() {
    const debouncedHandler = debounce(() => {
      this.resizeCount.update((count) => count + 1);
    }, 300);

    useEventListener('resize', debouncedHandler);
  }
}
```

### Click Outside Detection

```typescript
@Component({
  template: `
    <div #modal [class.hidden]="!isOpen()">
      <p>Click outside to close</p>
    </div>
  `,
})
class ModalComponent {
  modalRef = viewChild<ElementRef>('modal');
  isOpen = signal(true);

  constructor() {
    useEventListener('click', (event) => {
      const modal = this.modalRef()?.nativeElement;
      if (modal && !modal.contains(event.target as Node)) {
        this.isOpen.set(false);
      }
    });
  }
}
```

### Before Unload Warning

```typescript
@Component({
  template: `<form>Unsaved changes...</form>`,
})
class UnsavedChangesComponent {
  hasUnsavedChanges = signal(true);

  constructor() {
    useEventListener('beforeunload', (event) => {
      if (this.hasUnsavedChanges()) {
        event.preventDefault();
        event.returnValue = ''; // Chrome requires returnValue to be set
      }
    });
  }
}
```

### Custom Event on Element

```typescript
@Component({
  template: `<div #customElement>Custom events enabled</div>`,
})
class CustomEventComponent {
  elementRef = viewChild<ElementRef>('customElement');

  constructor() {
    useEventListener(
      'custom-event',
      (event) => {
        console.log('Custom event received:', event.detail);
      },
      { target: this.elementRef },
    );
  }

  triggerCustomEvent() {
    const element = this.elementRef()?.nativeElement;
    if (element) {
      element.dispatchEvent(new CustomEvent('custom-event', { detail: { data: 'test' } }));
    }
  }
}
```

### Multiple Event Types

```typescript
@Component({
  template: `<p>Input interaction detected: {{ interactions() }}</p>`,
})
class MultipleEventsComponent {
  interactions = signal(0);

  constructor() {
    const handler = () => {
      this.interactions.update((count) => count + 1);
    };

    // Track multiple input methods
    useEventListener('mousedown', handler);
    useEventListener('touchstart', handler);
    useEventListener('keydown', handler);
  }
}
```

## Parameters

| Parameter | Type                                 | Description                           |
| --------- | ------------------------------------ | ------------------------------------- |
| `event`   | `string`                             | Event name (e.g., 'click', 'keydown') |
| `handler` | `(event: Event) => void`             | Event handler function                |
| `options` | `UseEventListenerOptions` (optional) | Configuration options                 |

### Options Object

| Property  | Type                                                                       | Default  | Description                                            |
| --------- | -------------------------------------------------------------------------- | -------- | ------------------------------------------------------ |
| `target`  | `Window \| Document \| Signal<Element \| ElementRef \| null \| undefined>` | `window` | Event target (window, document, element, or signal)    |
| `capture` | `boolean`                                                                  | `false`  | Use capture phase for event propagation                |
| `passive` | `boolean`                                                                  | `false`  | Mark listener as passive (improves scroll performance) |
| `once`    | `boolean`                                                                  | `false`  | Remove listener after first invocation                 |

## Returns

`() => void` - A cleanup function that removes the event listener immediately. Safe to call multiple times — subsequent calls are no-ops. If the listener has already been removed (manually or via component destroy), calling the cleanup function again has no effect.

## Notes

- **Automatic cleanup**: Event listeners are automatically removed when the component is destroyed
- **Manual cleanup**: The returned cleanup function allows removing the listener early, before the component is destroyed
- **Safe to call multiple times**: The cleanup function is idempotent — calling it after the listener has already been removed is a safe no-op
- **Works with component destroy**: If cleanup is called manually, the automatic `onDestroy` cleanup gracefully handles the already-cleaned-up state
- **SSR safe**: Returns a no-op function on the server, listeners only attached in the browser
- **Signal support**: Target can be a signal containing an element/ElementRef that changes over time. Manual cleanup destroys the underlying effect and removes the current listener
- **Signal timing**: When using `viewChild()` or `viewChildren()` signals, they are `undefined` during constructor execution. The composable handles this gracefully - the effect waits for a non-null value before attaching listeners
- **Element identity check**: When signal targets update, the composable checks if the element reference actually changed to avoid unnecessary listener re-registration
- **Standard options**: Supports all standard `addEventListener` options (capture, passive, once)
- **Type safety**: Event handler receives properly typed event object based on event name
- **No memory leaks**: DestroyRef ensures cleanup even if component is destroyed unexpectedly
- When target is a signal, the listener automatically updates when the signal value changes
- Passive listeners improve scroll performance - use for scroll, wheel, touch events
- Capture phase listeners receive events before target phase - useful for event interception

## Common Use Cases

- **Global keyboard shortcuts**: Listen to keydown events on window
- **Click outside detection**: Close modals/dropdowns when clicking outside
- **Scroll tracking**: Monitor scroll position for infinite scroll or animations
- **Resize handling**: Respond to window resize events
- **Custom events**: Listen to custom events dispatched by other components
- **Drag and drop**: Handle mouse/touch move events
- **Form warnings**: Warn users about unsaved changes before leaving
- **Accessibility**: Track focus/blur for keyboard navigation

## Performance Tips

- Use `passive: true` for scroll, wheel, and touch events to improve performance
- Throttle or debounce high-frequency events (scroll, resize, mousemove)
- Use `capture: true` sparingly as it can impact event propagation performance
- Use `once: true` for events that should only fire once to save cleanup overhead

## Best Practices

### When to Use Template Event Binding vs useEventListener

**Use template event binding `(click)="..."`** for:

- Component-local interactions with template elements
- Simple event handlers that don't need dynamic targets
- Better readability and Angular's idiomatic patterns

**Use `useEventListener`** for:

- Window or document-level events
- Programmatic element listeners where template binding isn't feasible
- Dynamic event targets (especially signal-based targets)
- Events that need custom options (passive, capture, once)
- Cross-tab communication or global state management

### ViewChild Signal Timing

```typescript
// ✅ Safe: Works in constructor (effect waits for non-null value)
boxRef = viewChild<ElementRef>('box');

constructor() {
  useEventListener('click', handler, { target: this.boxRef });
  // Listener attaches once boxRef() becomes non-null after view initialization
}

// ✅ Also works: Explicit lifecycle hook (if you prefer)
boxRef = viewChild<ElementRef>('box');

constructor() {
  afterNextRender(() => {
    // boxRef() is guaranteed to be available here
    useEventListener('click', handler, { target: this.boxRef });
  });
}
```

### Avoiding Common Pitfalls

```typescript
// ❌ Don't: Use for simple template interactions
constructor() {
  useEventListener('click', () => {
    this.handleClick();
  }, { target: this.buttonRef });
}

// ✅ Do: Use template binding instead
// <button (click)="handleClick()">Click me</button>

// ✅ Do: Use for window/document events
constructor() {
  useEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  });
}
```

## Source

<<< @/../src/lib/composables/browser/use-event-listener/use-event-listener.composable.ts

---

Maybe we should have something like below as well>

```ts

mouseMoveCounter = useEventListener('mousemove', (currentValue) => {
   return currentValue {}
});
```

What could we call it? Any issues? Not useful?

What other ways could you write the same functionality?
