# useEventListener

Attaches an event listener to a target (window, document, or element) with automatic cleanup. The listener is automatically removed when the component is destroyed.

**MDN Reference:** [EventTarget.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

## When to Use `useEventListener`

`useEventListener` is best suited for **global or document-level events** where Angular template binding isn't available, and for **building reusable composables** that encapsulate event-driven behaviour.

**Prefer Angular template binding `(event)="handler()"`** for interactions with elements inside your component's template. Template bindings are automatically cleaned up, more readable, and idiomatic Angular.

```html
<!-- ✅ Prefer this for element interactions -->
<div (mouseenter)="onMouseEnter()" (mouseleave)="onMouseLeave()">Hover me</div>
```

**Use `useEventListener`** when you need to listen to `window`, `document`, or when building a composable that other components can consume.

## Usage

### Building a Reusable Composable

The primary value of `useEventListener` is encapsulating event logic into a composable that can be shared across components. Here the hover behaviour is self-contained and reusable:

```typescript
import { useEventListener } from 'ng-reactive-utils';

function useIsHovered(element: Signal<ElementRef | undefined>) {
  const isHovering = signal(false);

  useEventListener('mouseenter', () => isHovering.set(true), { target: element });
  useEventListener('mouseleave', () => isHovering.set(false), { target: element });

  return isHovering.asReadonly();
}

@Component({
  template: `
    <div #box>Hover over me</div>
    <p>Hovering: {{ isHovering() }}</p>
  `,
})
class HoverExampleComponent {
  boxRef = viewChild<ElementRef>('box');
  isHovering = useIsHovered(this.boxRef);
}
```

### Before Unload Warning

```typescript
@Component({
  template: `<form>Unsaved changes...</form>`,
})
class UnsavedChangesComponent {
  hasUnsavedChanges = signal(true);

  // Returned remove listener is avaliable to use manually if you need to remove before the component is destroyed
  cleanupListenerFn = useEventListener('beforeunload', (event) => {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
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

## Performance Tips

- Use `passive: true` for scroll, wheel, and touch events to improve performance
- Throttle or debounce high-frequency events (scroll, resize, mousemove)
- Use `capture: true` sparingly as it can impact event propagation performance
- Use `once: true` for events that should only fire once to save cleanup overhead

## Best Practices

### Prefer Template Binding for Element Events

For interactions with elements in your own template, Angular's built-in event binding is cleaner, more readable, and automatically cleaned up:

```html
<!-- ✅ Prefer template binding for component-local element events -->
<button (click)="submit()">Submit</button>
<input (focus)="onFocus()" (blur)="onBlur()" />
<div (mouseenter)="highlight()" (mouseleave)="unhighlight()">Hover me</div>
```

Reserve `useEventListener` for `window`/`document` targets, or when creating reusable composables.

## Source

<<< @/../src/lib/composables/browser/use-event-listener/use-event-listener.composable.ts
