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
- Common reactive patterns (debounce, throttle)
- Syncing signals with external systems (localStorage, URL)

## Composables vs Effects

### Composables

Composables **return** reactive values (signals) that you can use in your templates and logic:

```typescript
import { useWindowSize, useDebouncedSignal } from 'ng-reactive-utils';

export class MyComponent {
  // Returns a signal you can read
  windowSize = useWindowSize();
  debouncedValue = useDebouncedSignal(this.searchTerm, 300);
  
  // Use in template: {{ windowSize().width }}
}
```

**Common composables:**
- `useWindowSize()` - Track window dimensions
- `useRouteParam()` - Read route parameters
- `useFormState()` - Get form state as signals
- `useDebouncedSignal()` - Create debounced signal

### Effects

Effects **perform side effects** and sync signals with external systems:

```typescript
import { syncLocalStorageEffect, syncQueryParamsEffect } from 'ng-reactive-utils';

export class MyComponent {
  darkMode = signal(false);
  searchQuery = signal('');

  constructor() {
    // Effects don't return values - they perform actions
    syncLocalStorageEffect({
      signal: this.darkMode,
      key: 'dark-mode'
    });
    
    syncQueryParamsEffect({
      query: this.searchQuery
    });
  }
}
```

**Common effects:**
- `syncLocalStorageEffect()` - Persist signal to localStorage
- `syncQueryParamsEffect()` - Sync signals with URL query params

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

✅ Common reactive patterns
```typescript
// Built-in debouncing, throttling, previous value tracking
debouncedSearch = useDebouncedSignal(this.searchTerm, 300);
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

Signals and effects created by NG Reactive Utils are automatically cleaned up when the component is destroyed:

```typescript
export class MyComponent {
  // Automatically cleaned up on component destroy
  windowSize = useWindowSize();
  
  constructor() {
    // Effect automatically cleaned up on component destroy
    syncLocalStorageEffect({ signal: this.settings, key: 'settings' });
  }
}
```

No manual cleanup needed - Angular handles it through the injection context.

## Next Steps

- Explore [Browser Composables](/composables/browser/use-window-size)
- Check out [Form Composables](/composables/form/use-form-state)
- Try [Effects](/effects/sync-local-storage)
