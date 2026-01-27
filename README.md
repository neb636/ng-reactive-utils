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

## Highlights

A few examples of what's included:

- **useDebouncedSignal** - Debounce signal changes with automatic cleanup
- **useMousePosition** - Track mouse coordinates reactively across your app
- **useRouteParam** - Convert route parameters to signals for seamless reactivity
- **syncLocalStorage** - Two-way sync between signals and localStorage
- **useElementBounding** - Observe element position and size with ResizeObserver

**[→ Browse all composables, effects, and utilities](https://neb636.github.io/ng-reactive-utils/)**

## API Design Philosophy

These primitives follow these design principles:

1. **Signals all the way down** - Inputs and outputs are signals
2. **Composable by default** - Easy to combine and extend
3. **Minimal configuration** - Sensible defaults, opt-in complexity
4. **Type-safe** - Leverage TypeScript for better DX
5. **Framework-aligned** - Follow Angular's conventions and patterns

## Contributing

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

### Documentation Site

The documentation site is built with VitePress.

```bash
# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

### Building and Publishing

#### Build the Library

Build the library for distribution:

```bash
npm run build
```

Build artifacts are output to `dist/ng-reactive-utils`.

#### Publishing to npm

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

#### Testing Locally

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
