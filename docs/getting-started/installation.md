# Installation

## Requirements

- **Angular 20+** (for full signal support)
- **Node.js 22.20.0+**
- **TypeScript** with strict mode recommended

## Install the Package

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

## Add AI Support (Optional)

If you use an AI coding assistant (Cursor, Claude Code, GitHub Copilot, etc.), install the agent skill:

```bash
npx skills add neb636/ng-reactive-utils
```

This teaches your AI assistant ng-reactive-utils patterns so it can suggest the right composables and effects. See [AI Integration](/getting-started/ai-integration) for more details.

## Quick Start Examples

### Using a Composable

Composables return signals you can use in your templates:

```typescript
import { Component, signal } from '@angular/core';
import { useDebouncedSignal } from 'ng-reactive-utils';

@Component({
  selector: 'search-box',
  template: `
    <input 
      [value]="searchTerm()" 
      (input)="searchTerm.set($any($event.target).value)" 
    />
    <p>Searching for: {{ debouncedSearch() }}</p>
  `,
})
export class SearchBoxComponent {
  searchTerm = signal('');
  debouncedSearch = useDebouncedSignal(this.searchTerm, 300);
}
```

### Using an Effect

Effects sync signals with external systems automatically:

```typescript
import { Component, signal } from '@angular/core';
import { syncLocalStorage } from 'ng-reactive-utils';

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
    // Loads from localStorage on init, saves on every change
    syncLocalStorage({
      signal: this.darkMode,
      key: 'dark-mode-preference',
    });
  }
}
```

### Working with Forms

Convert reactive forms to signals without boilerplate:

```typescript
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { useFormState } from 'ng-reactive-utils';

@Component({
  selector: 'user-form',
  template: `
    <form [formGroup]="form">
      <input formControlName="email" />
      
      @if (formState.invalid() && formState.touched()) {
        <div class="error">Please enter a valid email</div>
      }
      
      <button [disabled]="!formState.valid()">Submit</button>
    </form>
  `,
})
export class UserFormComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  formState = useFormState<{ email: string }>(this.form);
  // Access: formState.value(), formState.valid(), formState.dirty(), etc.
}
```

## Next Steps

Now that you have the library installed:

1. **[Core Concepts](/getting-started/core-concepts)** - Understand composables vs effects
2. **[Browse APIs](/composables/browser/use-window-size)** - Explore all available utilities
