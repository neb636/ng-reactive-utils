# NG Reactive Utils

A collection of small, reusable reactive building blocks for modern Angular (v20+) applications. Built with signals at their core, these primitives help you build reactive applications with minimal ceremony.

## Features

- 🌳 **Fully tree-shakeable** - Only import what you need
- 💪 **Strongly typed** - Full TypeScript support
- 🎯 **Signal-first** - Built on Angular's reactive primitives
- 🔧 **Composable** - Mix and match to build complex behaviors

## Installation

```bash
npm install ng-reactive-utils
```

## Requirements

- Angular 20.3.0 or higher
- Node.js 22.20.0 or higher

## Quick Start

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

## What's Included

### Signal Transformations

Transform and derive new signals from existing ones:

- **`useDebouncedSignal`** - Debounce signal changes
- **`useThrottledSignal`** - Throttle signal updates
- **`usePreviousSignal`** - Track previous signal values

```typescript
import { usePreviousSignal } from 'ng-reactive-utils';

const count = signal(0);
const previousCount = usePreviousSignal(count);

count.set(5);
console.log(count()); // 5
console.log(previousCount()); // 0
```

### Browser Composables

React to browser state changes:

- **`useDocumentVisibility`** - Track document visibility state
- **`useWindowSize`** - Monitor window dimensions
- **`useMousePosition`** - Track mouse coordinates
- **`useElementBounding`** - Observe element position and size

```typescript
import { useWindowSize } from 'ng-reactive-utils';

@Component({
  selector: 'responsive-component',
  template: `
    <div>Window: {{ width() }}px × {{ height() }}px</div>
  `,
})
export class ResponsiveComponent {
  { width, height } = useWindowSize();
}
```

### Router Composables

Access route state as signals:

- **`useRouteParams`** - All route parameters as a signal
- **`useRouteParam`** - Single route parameter
- **`useRouteQueryParams`** - All query parameters as a signal
- **`useRouteQueryParam`** - Single query parameter
- **`useRouteData`** - Route data as a signal
- **`useRouteFragment`** - URL fragment as a signal

```typescript
import { useRouteParam } from 'ng-reactive-utils';

@Component({
  selector: 'user-profile',
  template: `<h1>User: {{ userId() }}</h1>`,
})
export class UserProfileComponent {
  userId = useRouteParam('id');
}
```

### Effects

Synchronize state with external systems:

- **`syncQueryParams`** - Sync signals with URL query parameters
- **`syncLocalStorage`** - Sync signals with localStorage

```typescript
import { syncQueryParams } from 'ng-reactive-utils';

@Component({
  selector: 'filterable-list',
  template: `...`,
})
export class FilterableListComponent {
  searchTerm = signal('');

  constructor() {
    // Automatically sync with ?search=... in URL
    syncQueryParams({ search: this.searchTerm });
  }
}
```

### Utilities

- **`createSharedComposable`** - Convert composables to singleton instances

```typescript
import { createSharedComposable, useWindowSize } from 'ng-reactive-utils';

// Create a shared version that returns the same instance
export const useSharedWindowSize = createSharedComposable(useWindowSize);

// Now multiple components share the same window size instance
```

## API Design Philosophy

These primitives follow these design principles:

1. **Signals all the way down** - Inputs and outputs are signals
2. **Composable by default** - Easy to combine and extend
3. **Minimal configuration** - Sensible defaults, opt-in complexity
4. **Type-safe** - Leverage TypeScript for better DX
5. **Framework-aligned** - Follow Angular's conventions and patterns

## Documentation

For detailed documentation, examples, and API references, visit the [GitHub repository](https://github.com/neb636/ng-reactive-utils).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © neb636
