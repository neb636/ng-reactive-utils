# Angular Reactive Primitives

A collection of small, reusable reactive building blocks for modern Angular (v20+) applications. The focus is on simple, well-typed composables and effects built around signals that you can drop into real projects with minimal ceremony.

## Features

- 🌳 **Fully tree-shakeable** - Only import what you need
- 💪 **Strongly typed** - Full TypeScript support
- 🎯 **Signal-first** - Built on Angular's reactive primitives
- 🔧 **Composable** - Mix and match to build complex behaviors

## Quick Start

```typescript
import { Component, signal } from '@angular/core';
import { useDebouncedSignal } from 'angular-reactive-primitives';

@Component({
  selector: 'search-box',
  template: `
    <input
      [value]="searchTerm()"
      (input)="searchTerm.set($any($event.target).value)"
    />
    <p>Debounced: {{ debouncedSearch() }}</p>
  `,
})
export class SearchBoxComponent {
  searchTerm = signal('');
  debouncedSearch = useDebouncedSignal(this.searchTerm, 300);
}
```

## Available Primitives

### Browser Composables

- [`useDocumentVisibility()`](./projects/angular-reactive-primitives/src/lib/composables/browser/use-document-visibility/use-document-visibility.doc.md) - Track document visibility state
- [`useElementBounding()`](./projects/angular-reactive-primitives/src/lib/composables/browser/use-element-bounding/use-element-bounding.doc.md) - Observe element position and size
- [`useMousePosition()`](./projects/angular-reactive-primitives/src/lib/composables/browser/use-mouse-position/use-mouse-position.doc.md) - Track mouse coordinates
- [`useWindowSize()`](./projects/angular-reactive-primitives/src/lib/composables/browser/use-window-size/use-window-size.doc.md) - Monitor window dimensions

### General Composables

- [`useDebouncedSignal()`](./projects/angular-reactive-primitives/src/lib/composables/general/use-debounced-signal/use-debounced-signal.doc.md) - Debounce signal changes
- [`usePreviousSignal()`](./projects/angular-reactive-primitives/src/lib/composables/general/use-previous-signal/use-previous-signal.doc.md) - Track previous signal values
- [`useThrottledSignal()`](./projects/angular-reactive-primitives/src/lib/composables/general/use-throttled-signal/use-throttled-signal.doc.md) - Throttle signal updates

### Router Composables

- [`useRouteData()`](./projects/angular-reactive-primitives/src/lib/composables/route/use-route-data/use-route-data.doc.md) - Route data as a signal
- [`useRouteFragment()`](./projects/angular-reactive-primitives/src/lib/composables/route/use-route-fragment/use-route-fragment.doc.md) - URL fragment as a signal
- [`useRouteParam()`](./projects/angular-reactive-primitives/src/lib/composables/route/use-route-param/use-route-params.doc.md) - Single route parameter
- [`useRouteParams()`](./projects/angular-reactive-primitives/src/lib/composables/route/use-route-params/use-route-params.doc.md) - All route parameters as a signal
- [`useRouteQueryParam()`](./projects/angular-reactive-primitives/src/lib/composables/route/use-route-query-param/use-route-query-param.doc.md) - Single query parameter
- [`useRouteQueryParams()`](./projects/angular-reactive-primitives/src/lib/composables/route/use-route-query-params/use-route-query-params.doc.md) - All query parameters as a signal

### Effects

- [`syncLocalStorage()`](./projects/angular-reactive-primitives/src/lib/effects/sync-local-storage/sync-local-storage.doc.md) - Sync signals with localStorage
- [`syncQueryParams()`](./projects/angular-reactive-primitives/src/lib/effects/sync-query-params/sync-query-params.doc.md) - Sync signals with URL query parameters

### Utilities

- [`createSharedComposable()`](./projects/angular-reactive-primitives/src/lib/utils/create-shared-composable/create-shared-composable.doc.md) - Convert composables to shared instances

## Status

This library is ready for publishing to npm. See the [Building and Publishing](#building-and-publishing) section below for instructions.

## API Design Philosophy

These primitives follow these design principles:

1. **Signals all the way down** - Inputs and outputs are signals
2. **Composable by default** - Easy to combine and extend
3. **Minimal configuration** - Sensible defaults, opt-in complexity
4. **Type-safe** - Leverage TypeScript for better DX
5. **Framework-aligned** - Follow Angular's conventions and patterns

## Getting Started

Install dependencies:

```bash
npm install
```

Build the library:

```bash
npm run build
```

Run tests:

```bash
npm run test
```

## Documentation

The documentation site is built with VitePress.

```bash
# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

## Building and Publishing

### Build the Library

Build the library for distribution:

```bash
npm run build
```

Build artifacts are output to `dist/angular-reactive-primitives`.

### Publishing to npm

After building, you can publish the library:

```bash
cd dist/angular-reactive-primitives
npm publish
```

**Pre-publish checklist:**

- Ensure all tests pass (`npm run test`)
- Update version in `projects/angular-reactive-primitives/package.json`
- Update `CHANGELOG.md` with release notes
- Build succeeds without errors
- Review the contents of `dist/angular-reactive-primitives`

### Testing Locally

Before publishing, test the package locally:

```bash
# Build the library
npm run build

# Create a tarball
cd dist/angular-reactive-primitives
npm pack

# Install in another project
cd /path/to/test-project
npm install /path/to/angular-reactive-primitives-0.0.1.tgz
```

## Project Structure

```
├── docs/                         # VitePress documentation site
│   ├── .vitepress/
│   │   └── config.mts            # VitePress configuration
│   ├── getting-started/          # Getting started guides
│   ├── composables/              # Composable documentation
│   ├── effects/                  # Effect documentation
│   └── utils/                    # Utility documentation
│
└── projects/
    └── angular-reactive-primitives/
        └── src/lib/
            ├── composables/      # Composable implementations
            ├── effects/          # Effect implementations
            └── utils/            # Utility implementations
```

## Compatibility

- Angular 20+

## License

- MIT
