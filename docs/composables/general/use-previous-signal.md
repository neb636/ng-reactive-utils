# usePreviousSignal

Creates a signal that tracks the previous value of a source signal. Useful for comparing current vs previous state or implementing undo functionality.

## Usage

```typescript
import { usePreviousSignal } from 'ng-reactive-utils';

@Component({
  template: `
    <p>Current: {{ count() }}</p>
    <p>Previous: {{ previousCount() }}</p>
    <button (click)="increment()">Increment</button>
  `,
})
class ExampleComponent {
  count = signal(0);
  previousCount = usePreviousSignal(this.count);

  increment() {
    this.count.update(v => v + 1);
  }
}
```

## Parameters

| Parameter      | Type        | Default    | Description                              |
| -------------- | ----------- | ---------- | ---------------------------------------- |
| `sourceSignal` | `Signal<T>` | _required_ | The source signal to track previous value |

## Returns

`Signal<T | undefined>` - A readonly signal containing the previous value (undefined initially)

## Notes

- The previous signal starts with `undefined` on first read
- Updates to track the previous value whenever the source changes
- Returned signal is **readonly** to prevent direct manipulation

## Source

<<< @/../projects/ng-reactive-utils/src/lib/composables/general/use-previous-signal/use-previous-signal.composable.ts
