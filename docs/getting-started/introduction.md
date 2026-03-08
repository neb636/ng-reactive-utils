# Introduction

NG Reactive Utils is a collection of composables for modern Angular applications. These utilities eliminate boilerplate and make working with signals more productive.

## What is it?

A utility library that provides:
- **Form & Route utilities** - Convert observables to signals without repetitive `toSignal()` calls
- **Browser APIs** - Window size, mouse position, storage, media queries, and more
- **Signal utilities** - Track previous values and share composable instances across components

## Quick Example

Read a route parameter and react to window size with one line each:

```typescript
import { Component, computed } from '@angular/core';
import { useRouteParam, useWindowSize } from 'ng-reactive-utils';

@Component({
  selector: 'user-profile',
  template: `
    <h1>User: {{ userId() }}</h1>
    @if (isMobile()) {
      <mobile-layout />
    } @else {
      <desktop-layout />
    }
  `,
})
export class UserProfileComponent {
  userId = useRouteParam('id');
  windowSize = useWindowSize();
  isMobile = computed(() => this.windowSize().width < 768);
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

- **[Browser Composables](/composables/browser/use-window-size)** - Window size, mouse position, document visibility, storage
- **[General Composables](/composables/general/use-previous-signal)** - Previous signal value tracking
- **[Form Composables](/composables/form/use-form-state)** - Form state as signals
- **[Route Composables](/composables/route/use-route-param)** - Route params, query params, data as signals

## Next Steps

Ready to get started?

1. [Install the library](/getting-started/installation)
2. Understand [core concepts](/getting-started/core-concepts)
3. Explore the available composables
