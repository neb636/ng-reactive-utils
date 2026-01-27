# useWindowSize

Creates signals that track the window size (width and height). The signals update when the window is resized, with debouncing to prevent excessive updates.

## Usage

```typescript
import { useWindowSize } from 'ng-reactive-utils';

@Component({
  template: `
    <h1>Window: {{ windowSize().width }}px × {{ windowSize().height }}px</h1>
    <p>Is mobile: {{ isMobile() }}</p>
  `,
})
class ResponsiveComponent {
  windowSize = useWindowSize();
  isMobile = computed(() => this.windowSize().width < 768);
}
```

### With Custom Debounce

```typescript
@Component({
  template: `<p>Window: {{ windowSize().width }}px × {{ windowSize().height }}px</p>`,
})
class SlowDebounceComponent {
  // Use a longer debounce for less frequent updates
  windowSize = useWindowSize(300);
}
```

## Parameters

| Parameter    | Type     | Default | Description                           |
| ------------ | -------- | ------- | ------------------------------------- |
| `debounceMs` | `number` | `100`   | Debounce delay for resize events (ms) |

## Returns

`Signal<{ width: number; height: number }>` - A readonly signal containing window dimensions

## Notes

- Returned signal is **readonly** to prevent direct manipulation
- Uses `createSharedComposable` internally - components with the same `debounceMs` value share a single instance
- Different `debounceMs` values create separate instances with their own event listeners
- Debounces resize events by default (100ms) to prevent excessive updates
- Event listeners are automatically cleaned up when no more subscribers

## Source

<<< @/../src/lib/composables/browser/use-window-size/use-window-size.composable.ts
