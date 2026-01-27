# Installation

## Requirements

- Angular 20 or higher
- Node.js 22.20.0 or higher

## Install

::: code-group

```bash [npm]
npm install ng-reactive-utils
```

```bash [pnpm]
pnpm add ng-reactive-utils
```

```bash [yarn]
yarn add ng-reactive-utils
```

:::

## Quick Start

Import any primitive directly from the package:

```typescript
import { useDebouncedSignal, useWindowSize } from 'ng-reactive-utils';
```

### Basic Example

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

### Using Effects

```typescript
import { Component, signal } from '@angular/core';
import { syncLocalStorageEffect } from 'ng-reactive-utils';

@Component({
  selector: 'preferences',
  template: `
    <label>
      <input
        type="checkbox"
        [checked]="darkMode()"
        (change)="darkMode.set($any($event.target).checked)"
      />
      Dark Mode
    </label>
  `,
})
export class PreferencesComponent {
  darkMode = signal(false);

  constructor() {
    // Automatically persists darkMode changes to localStorage
    syncLocalStorageEffect({
      signal: this.darkMode,
      key: 'dark-mode-preference',
    });
  }
}
```

## TypeScript Configuration

The library ships with full TypeScript support. No additional configuration is needed.

For optimal type inference, ensure you have strict mode enabled in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## Next Steps

Explore the available primitives:

- [Browser Composables](/composables/browser/use-document-visibility) - Interact with browser APIs
- [General Composables](/composables/general/use-debounced-signal) - Common reactive patterns
- [Route Composables](/composables/route/use-route-data) - Angular Router integration
- [Effects](/effects/sync-local-storage) - Side effect utilities
