# useThrottledSignal

Creates a throttled signal from a source signal. The initial value is set immediately when created, then subsequent updates are throttled to emit at most once per throttle period. Unlike debounce which waits for a "quiet period", throttle ensures updates happen at regular intervals during continuous activity.

## Usage

```typescript
import { useThrottledSignal } from 'ng-reactive-utils';

@Component({
  template: `
    <div (mousemove)="updatePosition($event)">
      Mouse updates: {{ mouseX() }}
      <p>Throttled updates: {{ throttledX() }}</p>
    </div>
  `,
})
class ExampleComponent {
  mouseX = signal(0);
  throttledX = useThrottledSignal(this.mouseX, 500);

  updatePosition(event: MouseEvent) {
    this.mouseX.set(event.clientX);
  }
}
```

## Parameters

| Parameter      | Type        | Default    | Description                        |
| -------------- | ----------- | ---------- | ---------------------------------- |
| `sourceSignal` | `Signal<T>` | _required_ | The source signal to throttle      |
| `delayMs`      | `number`    | `300`      | The throttle delay in milliseconds |

## Returns

`Signal<T>` - A readonly signal that emits at regular intervals during activity

## Debounce vs Throttle

| **Debounce**                 | **Throttle**                         |
| ---------------------------- | ------------------------------------ |
| Waits for "quiet period"     | Executes at regular intervals        |
| Good for: search, validation | Good for: scroll, resize, mouse move |
| Last value after inactivity  | Periodic values during activity      |

## Notes

- The throttled signal is **readonly** to prevent direct manipulation
- The initial value from the source signal is set immediately upon creation
- All updates after initialization are throttled - the throttle period begins when the composable is created
- Updates are emitted at most once per throttle period, ensuring regular intervals during continuous activity
- The last value during a burst of updates will be emitted after the throttle period expires
- Uses lodash's `throttle` implementation for reliable behavior
- Consider using `useDebouncedSignal` for events like search input where you want to wait for user to stop typing

## Source

<<< @/../src/lib/composables/general/use-throttled-signal/use-throttled-signal.composable.ts
