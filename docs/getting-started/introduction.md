# Introduction

NG Reactive Utils is a collection of composables and effects for modern Angular applications. These utilities eliminate boilerplate and make working with signals more productive.

## What is it?

A utility library that provides:
- **Form & Route utilities** - Convert observables to signals without repetitive `toSignal()` calls
- **Reactive patterns** - Built-in debouncing, throttling, and more
- **Sync effects** - Automatically persist signals to localStorage, URL params, etc.

## Quick Example

Add debounced search with one line:

```typescript
import { Component, signal } from '@angular/core';
import { useDebouncedSignal } from 'ng-reactive-utils';

@Component({
  selector: 'search-box',
  template: `
    <input [value]="searchTerm()" (input)="searchTerm.set($any($event.target).value)" />
    <p>Debounced: {{ debouncedSearch() }}</p>
  `,
})
export class SearchBoxComponent {
  searchTerm = signal('');
  debouncedSearch = useDebouncedSignal(this.searchTerm, 300);
}
```

## Why Use It?

**Without NG Reactive Utils:**
```typescript
// Repetitive toSignal() calls everywhere
formValue = toSignal(form.valueChanges, { initialValue: form.value });
formValid = toSignal(form.statusChanges.pipe(map(() => form.valid)), { initialValue: form.valid });
userId = toSignal(route.params.pipe(map(p => p['id'])), { initialValue: route.snapshot.params['id'] });
```

**With NG Reactive Utils:**
```typescript
// Clean, readable utilities
formState = useFormState(this.form);  // value(), valid(), dirty(), etc.
userId = useRouteParam('id');
```

## Key Benefits

- **Less boilerplate** - Replace repetitive `toSignal()` calls with clean utilities
- **Type-safe** - Full TypeScript support with proper inference
- **Signal-first** - Built for Angular's modern reactivity system
- **Tree-shakable** - Import only what you need

## What's Available

- **[Browser Composables](/composables/browser/use-window-size)** - Window size, mouse position, document visibility
- **[General Composables](/composables/general/use-debounced-signal)** - Debouncing, throttling, previous values
- **[Form Composables](/composables/form/use-form-state)** - Form state as signals
- **[Route Composables](/composables/route/use-route-param)** - Route params, query params, data as signals
- **[Effects](/effects/sync-local-storage)** - Sync with localStorage, URL, etc.

## Next Steps

Ready to get started?

1. [Install the library](/getting-started/installation)
2. Understand [core concepts](/getting-started/core-concepts)
3. Migrate [existing code](/getting-started/migration-guide) (optional)
