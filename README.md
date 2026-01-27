# NG Reactive Utils

[![npm version](https://img.shields.io/npm/v/ng-reactive-utils.svg)](https://www.npmjs.com/package/ng-reactive-utils)
[![npm downloads](https://img.shields.io/npm/dm/ng-reactive-utils.svg)](https://www.npmjs.com/package/ng-reactive-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A collection of small, reusable reactive building blocks for modern Angular (v20+) applications. The focus is on simple, well-typed composables and effects built around signals that you can drop into real projects with minimal ceremony.

📚 **[View Documentation](https://neb636.github.io/ng-reactive-utils/)** | 📦 **[npm Package](https://www.npmjs.com/package/ng-reactive-utils)**

## Features

- 🌳 **Fully tree-shakeable** - Only import what you need
- 💪 **Strongly typed** - Full TypeScript support
- 🎯 **Signal-first** - Built on Angular's reactive primitives
- 🔧 **Composable** - Mix and match to build complex behaviors

## Installation

```bash
npm install ng-reactive-utils
```

## Quick Start

```typescript
import { computed } from '@angular/core';
import { useControlValue, useDebouncedSignal, useWindowSize } from 'ng-reactive-utils';

// Convert FormControl to reactive signal
searchControl = new FormControl('');
searchValue = useControlValue(this.searchControl);

// Debounce for API calls, track window size
debouncedSearch = useDebouncedSignal(this.searchValue, 300);
windowSize = useWindowSize();

// Compose into derived state
isMobile = computed(() => this.windowSize().width < 768);
```

## Available Primitives

### Browser Composables

- [`useDocumentVisibility()`](./docs/composables/browser/use-document-visibility.md) - Track document visibility state
- [`useElementBounding()`](./docs/composables/browser/use-element-bounding.md) - Observe element position and size
- [`useMousePosition()`](./docs/composables/browser/use-mouse-position.md) - Track mouse coordinates
- [`useWindowSize()`](./docs/composables/browser/use-window-size.md) - Monitor window dimensions

### General Composables

- [`useDebouncedSignal()`](./docs/composables/general/use-debounced-signal.md) - Debounce signal changes
- [`usePreviousSignal()`](./docs/composables/general/use-previous-signal.md) - Track previous signal values
- [`useThrottledSignal()`](./docs/composables/general/use-throttled-signal.md) - Throttle signal updates

### Router Composables

- [`useRouteData()`](./docs/composables/route/use-route-data.md) - Route data as a signal
- [`useRouteFragment()`](./docs/composables/route/use-route-fragment.md) - URL fragment as a signal
- [`useRouteParam()`](./docs/composables/route/use-route-param.md) - Single route parameter
- [`useRouteParams()`](./docs/composables/route/use-route-params.md) - All route parameters as a signal
- [`useRouteQueryParam()`](./docs/composables/route/use-route-query-param.md) - Single query parameter
- [`useRouteQueryParams()`](./docs/composables/route/use-route-query-params.md) - All query parameters as a signal

### Effects

- [`syncLocalStorage()`](./docs/effects/sync-local-storage.md) - Sync signals with localStorage
- [`syncQueryParams()`](./docs/effects/sync-query-params.md) - Sync signals with URL query parameters

### Utilities

- [`createSharedComposable()`](./docs/utils/create-shared-composable.md) - Convert composables to shared instances

## Status

This library is published on npm as [`ng-reactive-utils`](https://www.npmjs.com/package/ng-reactive-utils) and is ready for use in production Angular applications.

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

Build artifacts are output to `dist/ng-reactive-utils`.

### Publishing to npm

After building, you can publish the library:

```bash
cd dist/ng-reactive-utils
npm publish
```

**Pre-publish checklist:**

- Ensure all tests pass (`npm run test`)
- Update version in `package.json`
- Update `CHANGELOG.md` with release notes
- Build succeeds without errors
- Review the contents of `dist/ng-reactive-utils`

### Testing Locally

Before publishing, test the package locally:

```bash
# Build the library
npm run build

# Create a tarball
cd dist/ng-reactive-utils
npm pack

# Install in another project
cd /path/to/test-project
npm install /path/to/ng-reactive-utils-0.0.1.tgz
```

## Project Structure

```
├── src/                          # Library source code
│   └── lib/
│       ├── composables/          # Composable implementations
│       ├── effects/              # Effect implementations
│       └── utils/                # Utility implementations
│
├── docs/                         # VitePress documentation site
│   ├── .vitepress/
│   │   └── config.mts            # VitePress configuration
│   ├── getting-started/          # Getting started guides
│   ├── composables/              # Composable documentation
│   ├── effects/                  # Effect documentation
│   └── utils/                    # Utility documentation
│
├── package.json                  # Package configuration
├── ng-package.json               # ng-packagr configuration
└── tsconfig.*.json               # TypeScript configurations
```

## Compatibility

- Angular 20+

## License

- MIT
