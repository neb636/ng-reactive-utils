# Introduction

NG Reactive Utils is a collection of composables and effects for modern Angular applications using reactive patterns. These utilities help you build more maintainable and testable applications with less boilerplate.

## What are Reactive Primitives?

Reactive Primitives are small, focused utilities that provide common reactive patterns for Angular applications. They are designed to work seamlessly with Angular's signal-based reactivity system and provide a consistent API for common use cases.

Each primitive is a standalone function that can be imported and used in your components, making them easy to test and reuse across your application.

## Quick Example

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

## Key Features

- **Signal-based**: Built on Angular's signal system for optimal performance
- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Tree-shakable**: Import only what you need
- **Framework agnostic**: Work with any Angular version that supports signals (v20+)
- **Well-tested**: Comprehensive test coverage for reliability

## API Design Philosophy

These primitives follow these design principles:

1. **Signals all the way down** - Inputs and outputs are signals
2. **Composable by default** - Easy to combine and extend
3. **Minimal configuration** - Sensible defaults, opt-in complexity
4. **Type-safe** - Leverage TypeScript for better DX
5. **Framework-aligned** - Follow Angular's conventions and patterns

## Available Primitives

### Browser Composables

- [`useDocumentVisibility()`](/composables/browser/use-document-visibility) - Track document visibility state
- [`useElementBounding()`](/composables/browser/use-element-bounding) - Observe element position and size
- [`useMousePosition()`](/composables/browser/use-mouse-position) - Track mouse coordinates
- [`useWindowSize()`](/composables/browser/use-window-size) - Monitor window dimensions

### General Composables

- [`useDebouncedSignal()`](/composables/general/use-debounced-signal) - Debounce signal changes
- [`usePreviousSignal()`](/composables/general/use-previous-signal) - Track previous signal values
- [`useThrottledSignal()`](/composables/general/use-throttled-signal) - Throttle signal updates

### Router Composables

- [`useRouteData()`](/composables/route/use-route-data) - Route data as a signal
- [`useRouteFragment()`](/composables/route/use-route-fragment) - URL fragment as a signal
- [`useRouteParam()`](/composables/route/use-route-param) - Single route parameter
- [`useRouteParams()`](/composables/route/use-route-params) - All route parameters as a signal
- [`useRouteQueryParam()`](/composables/route/use-route-query-param) - Single query parameter
- [`useRouteQueryParams()`](/composables/route/use-route-query-params) - All query parameters as a signal

### Effects

- [`syncLocalStorage()`](/effects/sync-local-storage) - Sync signals with localStorage
- [`syncQueryParams()`](/effects/sync-query-params) - Sync signals with URL query parameters

### Utilities

- [`createSharedComposable()`](/utils/create-shared-composable) - Convert composables to shared instances

## Getting Started

Ready to dive in? Head over to the [Installation](/getting-started/installation) guide to get started.
