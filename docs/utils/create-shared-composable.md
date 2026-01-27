# createSharedComposable

Creates a shared instance of a wrapped composable function that uses reference counting. When the last consumer is destroyed, the shared instance and its resources are cleaned up automatically.

## Usage

### Basic Usage Without Parameters

```typescript
import { createSharedComposable } from 'ng-reactive-utils';
import { signal } from '@angular/core';

const useWebSocket = createSharedComposable(() => {
  const socket = new WebSocket('wss://api.example.com');
  const messages = signal<string[]>([]);

  socket.onmessage = (event) => {
    messages.update((m) => [...m, event.data]);
  };

  return {
    value: messages.asReadonly(),
    cleanup: () => socket.close(),
  };
});

@Component({
  template: `<div>{{ messages() | json }}</div>`,
})
class ChatComponent {
  messages = useWebSocket();
}
```

### With Parameters

```typescript
import { createSharedComposable } from 'ng-reactive-utils';
import { inject, signal, DestroyRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';

const useWindowSize = createSharedComposable((debounceMs = 100) => {
  const document = inject(DOCUMENT);
  const size = signal({ width: 0, height: 0 });

  const handleResize = () => {
    size.set({
      width: document.defaultView?.innerWidth ?? 0,
      height: document.defaultView?.innerHeight ?? 0,
    });
  };

  document.defaultView?.addEventListener('resize', handleResize);

  return {
    value: useDebouncedSignal(size, debounceMs),
    cleanup: () => {
      document.defaultView?.removeEventListener('resize', handleResize);
    },
  };
});

@Component({
  template: ` <h1>Window: {{ windowSize().width }}px × {{ windowSize().height }}px</h1> `,
})
class ResponsiveComponent {
  windowSize = useWindowSize(200);
}
```

## Parameters

| Parameter | Type                                     | Description                                                                                                                  |
| --------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `factory` | `(...args: Args) => ComposableResult<T>` | A factory function that creates the composable instance. Must return an object with `value` and optional `cleanup` function. |

## Returns

A function `(...args: Args) => T` that returns the shared instance value. The function can be called with the same arguments as the factory function.

## ComposableResult Interface

The factory function must return an object with:

- `value: T` - The value to be shared across all consumers
- `cleanup?: () => void` - Optional cleanup function called when the last consumer is destroyed

## Notes

- **Reference Counting**: Multiple components using the same composable with the same arguments share a single instance
- **Automatic Cleanup**: When the last consumer component is destroyed, the cleanup function is called automatically
- **Argument-Based Caching**: Different argument values create separate cached instances
- **DestroyRef Integration**: Automatically registers cleanup handlers using Angular's `DestroyRef`
- **Memory Efficient**: Prevents resource leaks by ensuring cleanup runs when no more consumers exist
- Use this utility when you want to share expensive resources (like WebSocket connections, event listeners, or API subscriptions) across multiple components

## Source

<<< @/../projects/ng-reactive-utils/src/lib/utils/create-shared-composable/create-shared-composable.ts
