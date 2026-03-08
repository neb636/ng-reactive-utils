# Core Concepts

Understanding a few key concepts will help you get the most out of NG Reactive Utils.

## Signals vs Observables

Angular's modern reactivity is built on **signals**, which provide synchronous, glitch-free updates. Observables (RxJS) are asynchronous and stream-based.

**When to use signals:**
- Component state that needs to trigger UI updates
- Derived/computed values
- Simple reactive state management

**When to use observables:**
- Async operations (HTTP requests, timers)
- Complex event streams with operators
- When you need precise control over timing and cancellation

**When to use NG Reactive Utils:**
- Converting observables to signals (forms, routes)
- Reading browser state reactively (window size, mouse position, storage)

## Composables

Composables **return** reactive values (signals) that you can use in your templates and logic:

```typescript
import { useWindowSize, useRouteParam } from 'ng-reactive-utils';

export class MyComponent {
  windowSize = useWindowSize();
  userId = useRouteParam('id');

  // Use in template: {{ windowSize().width }}, {{ userId() }}
}
```

**Common composables:**
- `useWindowSize()` - Track window dimensions
- `useRouteParam()` - Read route parameters
- `useFormState()` - Get form state as signals
- `usePreviousSignal()` - Track the previous value of a signal
- `useLocalStorage()` - Two-way signal sync with localStorage

## When to Use NG Reactive Utils vs Vanilla Angular

### Use NG Reactive Utils when:

✅ Converting form observables to signals
```typescript
// Instead of: toSignal(form.valueChanges, { initialValue: form.value })
formState = useFormState(this.form);
```

✅ Converting route observables to signals
```typescript
// Instead of: toSignal(route.params.pipe(map(...)), { initialValue: ... })
userId = useRouteParam('id');
```

✅ Reacting to browser state
```typescript
// Instead of: manual fromEvent(window, 'resize') with toSignal()
windowSize = useWindowSize();
isMobile = computed(() => this.windowSize().width < 768);
```

## Type Safety

All utilities are fully typed with TypeScript:

```typescript
interface UserForm {
  email: string;
  age: number;
}

// Type inference works automatically
formState = useFormState<UserForm>(this.form);
formState.value(); // { email: string; age: number }

// Route params with types
params = useRouteParams<{ id: string; postId: string }>();
params(); // { id: string; postId: string }
```

## Memory Management

Signals created by NG Reactive Utils are automatically cleaned up when the component is destroyed:

```typescript
export class MyComponent {
  // Automatically cleaned up on component destroy
  windowSize = useWindowSize();
  theme = useLocalStorage('theme', 'light');
}
```

No manual cleanup needed — Angular handles it through the injection context.

## Next Steps

- Explore [Browser Composables](/composables/browser/use-window-size)
- Check out [Form Composables](/composables/form/use-form-state)
