# useDebouncedSignal

Creates a debounced signal from a source signal. Useful for things like search inputs where you want to debounce the input value before making an API call.

## Usage

```html
<textarea [(ngModel)]="textareaContent"></textarea>
<p>Characters: {{ textareaContent()?.length || 0 }}</p>

<h3>AI Summary</h3>
<p>{{ aiSummary.data() }}</p>
```

```typescript
import { useDebouncedSignal } from 'ng-reactive-utils';

const textareaContent = signal('');
const debouncedTextareaContent = useDebouncedSignal(textareaContent, 1000);

aiSummary = resource({
  params: () => ({ text: debouncedTextareaContent() }),
  loader: ({ params }) => fetchAISummary(params),
});
```

## Parameters

| Parameter      | Type        | Default    | Description                        |
| -------------- | ----------- | ---------- | ---------------------------------- |
| `sourceSignal` | `Signal<T>` | _required_ | The source signal to debounce      |
| `delayMs`      | `number`    | `300`      | The debounce delay in milliseconds |

## Returns

`Signal<T>` - A readonly signal that updates after the debounce delay

## Why Use Both Normal and Debounced Signals?

Having both the original signal and a debounced version allows you to:

- **Normal signal**: Provide instant UI feedback (character counts, validation messages, visual updates)
- **Debounced signal**: Trigger expensive operations only after user stops typing (API calls, heavy computations)

## Debounce vs Throttle

| **Debounce**                 | **Throttle**                         |
| ---------------------------- | ------------------------------------ |
| Waits for "quiet period"     | Executes at regular intervals        |
| Good for: search, validation | Good for: scroll, resize, mouse move |
| Last value after inactivity  | Periodic values during activity      |

## Notes

- The debounced signal is **readonly** to prevent direct manipulation
- Initial value of the debounced signal matches the source signal's initial value
- Uses lodash's `debounce` implementation for reliable behavior
- The debounce timer resets with each new value from the source signal
- Consider using `useThrottledSignal` for continuous events like scrolling or mouse movement

## Source

<<< @/../projects/ng-reactive-utils/src/lib/composables/general/use-debounced-signal/use-debounced-signal.composable.ts
