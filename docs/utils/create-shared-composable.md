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
import { inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

const useMediaQuery = createSharedComposable((query: string) => {
  const document = inject(DOCUMENT);
  const mediaQuery = document.defaultView?.matchMedia(query);
  const matches = signal(mediaQuery?.matches ?? false);

  const handleChange = (event: MediaQueryListEvent) => matches.set(event.matches);
  mediaQuery?.addEventListener('change', handleChange);

  return {
    value: matches.asReadonly(),
    cleanup: () => mediaQuery?.removeEventListener('change', handleChange),
  };
});

@Component({
  template: `<nav>{{ isMobile() ? 'Mobile' : 'Desktop' }} layout</nav>`,
})
class NavComponent {
  isMobile = useMediaQuery('(max-width: 768px)');
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

<<< @/../src/lib/utils/create-shared-composable/create-shared-composable.ts
