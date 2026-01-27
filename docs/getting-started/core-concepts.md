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
import { syncLocalStorage, syncQueryParams } from 'ng-reactive-utils';

export class MyComponent {
  darkMode = signal(false);
  searchQuery = signal('');

  constructor() {
    // Effects don't return values - they perform actions
    syncLocalStorage({
      signal: this.darkMode,
      key: 'dark-mode'
    });
    
    syncQueryParams({
      q: this.searchQuery
    });
  }
}
```

**Common effects:**
- `syncLocalStorage()` - Persist signal to localStorage
- `syncQueryParams()` - Sync signals with URL query params

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

✅ Syncing with external systems
```typescript
// Automatic localStorage persistence
syncLocalStorage({ signal: this.settings, key: 'user-settings' });
```

### Use vanilla Angular when:

⭕ Simple signal creation
```typescript
// Don't need a utility for basic signals
count = signal(0);
doubled = computed(() => this.count() * 2);
```

⭕ Simple effects
```typescript
// Basic effects don't need utilities
effect(() => {
  console.log('Count changed:', this.count());
});
```

⭕ One-off observable conversions
```typescript
// If you only do it once, toSignal() is fine
data = toSignal(this.http.get('/api/data'));
```

## When NOT to Use This Library

### Use RxJS directly when:

❌ You need complex stream operations
```typescript
// RxJS operators like switchMap, mergeMap, etc.
search$ = this.searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.api.search(term)),
  catchError(err => of([]))
);
```

❌ You need precise async control
```typescript
// Fine-grained subscription management
subscription = observable$.subscribe(...);
// Later: subscription.unsubscribe();
```

### Stick with vanilla Angular when:

❌ Your team doesn't use signals yet
- This library is signal-first
- Wait until your team adopts signal patterns

❌ You're on Angular < 20
- Signals are best in Angular 20+
- Earlier versions have limited signal support

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
    syncLocalStorage({ signal: this.settings, key: 'settings' });
  }
}
```

No manual cleanup needed - Angular handles it through the injection context.

## Next Steps

- Explore [Browser Composables](/composables/browser/use-window-size)
- Check out [Form Composables](/composables/form/use-form-state)
- Try [Effects](/effects/sync-local-storage)
