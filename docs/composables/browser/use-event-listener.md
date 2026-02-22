# useEventListener

Attaches an event listener to a target with automatic cleanup when the component is destroyed.

**MDN Reference:** [EventTarget.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

## When to Use

Use `useEventListener` for **global events** (`window`, `document`) and for **building reusable composables** that encapsulate event logic.

For elements inside your own template, prefer Angular's built-in event binding — it's cleaner and automatically cleaned up:

```html
<!-- Prefer this for component-local elements -->
<button (click)="submit()">Submit</button>
<div (mouseenter)="highlight()" (mouseleave)="unhighlight()">Hover me</div>
```

## Usage

### Building a Reusable Composable

The primary use case is encapsulating event logic into a composable that can be shared across components:

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

  // The returned function removes the listener early if needed
  removeListener = useEventListener('beforeunload', (event) => {
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
| `event`   | `string`                             | Event name (e.g. `'click'`, `'keydown'`) |
| `handler` | `(event: Event) => void`             | Event handler function                |
| `options` | `UseEventListenerOptions` (optional) | Configuration options                 |

### Options

| Property  | Type                                                                       | Default  | Description                                            |
| --------- | -------------------------------------------------------------------------- | -------- | ------------------------------------------------------ |
| `target`  | `Window \| Document \| Signal<Element \| ElementRef \| null \| undefined>` | `window` | Event target                                           |
| `capture` | `boolean`                                                                  | `false`  | Use capture phase                                      |
| `passive` | `boolean`                                                                  | `false`  | Mark listener as passive (improves scroll performance) |
| `once`    | `boolean`                                                                  | `false`  | Remove listener after first invocation                 |

## Returns

`() => void` — A cleanup function that removes the listener immediately. Safe to call multiple times. Automatic cleanup on component destroy still runs safely if called early.

## Notes

- **SSR safe**: No-ops on the server; listeners are only attached in the browser.
- **Signal targets**: When `target` is a signal (e.g. from `viewChild()`), the listener re-registers whenever the signal value changes. `undefined` values are handled gracefully — the listener waits until a valid element is available.
- **Passive listeners**: Use `passive: true` for scroll, wheel, and touch events to improve scroll performance.

## Source

<<< @/../src/lib/composables/browser/use-event-listener/use-event-listener.composable.ts
