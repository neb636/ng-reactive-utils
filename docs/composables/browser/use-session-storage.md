# useSessionStorage

Creates a writable signal that automatically syncs with sessionStorage. The signal persists its value during the page session (until the tab/window is closed) but does not sync across tabs like localStorage.

## Usage

### Basic Usage

```typescript
import { useSessionStorage } from 'ng-reactive-utils';

@Component({
  template: `
    <div>
      <p>Page views: {{ pageViews() }}</p>
      <button (click)="pageViews.set(pageViews() + 1)">Increment</button>
    </div>
  `,
})
class PageViewsComponent {
  // Value persists during the session (until tab is closed)
  pageViews = useSessionStorage('page-views', 0);
}
```

### Wizard/Multi-Step Form State

```typescript
interface WizardState {
  currentStep: number;
  completedSteps: number[];
  formData: {
    personalInfo: { name: string; email: string };
    preferences: { newsletter: boolean; theme: string };
  };
}

@Component({
  template: `
    <div class="wizard">
      <h2>Step {{ wizardState().currentStep }} of 3</h2>
      @if (wizardState().currentStep === 1) {
        <!-- Personal info form -->
      }
      @if (wizardState().currentStep === 2) {
        <!-- Preferences form -->
      }
      <button (click)="nextStep()">Next</button>
    </div>
  `,
})
class WizardComponent {
  wizardState = useSessionStorage<WizardState>('wizard-state', {
    currentStep: 1,
    completedSteps: [],
    formData: {
      personalInfo: { name: '', email: '' },
      preferences: { newsletter: false, theme: 'light' },
    },
  });

  nextStep() {
    this.wizardState.update((state) => ({
      ...state,
      currentStep: state.currentStep + 1,
      completedSteps: [...state.completedSteps, state.currentStep],
    }));
  }
}
```

### Temporary Filters

```typescript
interface FilterState {
  category: string;
  priceRange: { min: number; max: number };
  sortBy: string;
}

@Component({
  template: `
    <div>
      <select (change)="updateCategory($any($event.target).value)">
        <option value="all">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="books">Books</option>
      </select>
      <button (click)="resetFilters()">Reset</button>
    </div>
  `,
})
class ProductFiltersComponent {
  // Filters persist during browsing session but reset when tab closes
  filters = useSessionStorage<FilterState>('product-filters', {
    category: 'all',
    priceRange: { min: 0, max: 1000 },
    sortBy: 'name',
  });

  updateCategory(category: string) {
    this.filters.update((f) => ({ ...f, category }));
  }

  resetFilters() {
    this.filters.set({
      category: 'all',
      priceRange: { min: 0, max: 1000 },
      sortBy: 'name',
    });
  }
}
```

### Navigation History

```typescript
@Component({
  template: `
    <div>
      <p>Pages visited: {{ visitedPages().length }}</p>
      <button (click)="goBack()" [disabled]="!canGoBack()">Back</button>
    </div>
  `,
})
class NavigationComponent {
  visitedPages = useSessionStorage<string[]>('visited-pages', []);

  canGoBack = computed(() => this.visitedPages().length > 1);

  constructor() {
    const router = inject(Router);

    // Track page visits
    effect(() => {
      const currentUrl = router.url;
      this.visitedPages.update((pages) => [...pages, currentUrl]);
    });
  }

  goBack() {
    const pages = this.visitedPages();
    if (pages.length > 1) {
      // Navigate to previous page
      const previousPage = pages[pages.length - 2];
      // ... router.navigateByUrl(previousPage);
    }
  }
}
```

### Temporary Authentication

```typescript
@Component({
  template: `
    <div>
      @if (sessionToken()) {
        <p>Logged in</p>
        <button (click)="logout()">Logout</button>
      } @else {
        <button (click)="login()">Login</button>
      }
    </div>
  `,
})
class SessionAuthComponent {
  // Token only persists for this tab session
  sessionToken = useSessionStorage<string | null>('session-token', null);

  login() {
    this.sessionToken.set('temp-session-abc123');
  }

  logout() {
    this.sessionToken.set(null);
  }
}
```

### Scroll Position Restoration

```typescript
@Component({
  template: `<div class="content" (scroll)="saveScrollPosition($event)">...</div>`,
})
class ScrollRestoreComponent {
  scrollPosition = useSessionStorage('scroll-position', { x: 0, y: 0 });

  ngAfterViewInit() {
    // Restore scroll position
    const { x, y } = this.scrollPosition();
    window.scrollTo(x, y);
  }

  saveScrollPosition(event: Event) {
    const element = event.target as HTMLElement;
    this.scrollPosition.set({
      x: element.scrollLeft,
      y: element.scrollTop,
    });
  }
}
```

### Tab-Specific Settings

```typescript
@Component({
  template: `
    <div>
      <label>
        <input
          type="checkbox"
          [checked]="devMode()"
          (change)="devMode.set(!devMode())"
        />
        Developer Mode (this tab only)
      </label>
    </div>
  `,
})
class TabSettingsComponent {
  // Setting only applies to this tab
  devMode = useSessionStorage('dev-mode', false);
}
```

### Custom Serialization with Date

```typescript
interface Session {
  startTime: Date;
  userId: string;
  actions: string[];
}

@Component({
  template: `
    <div>
      <p>Session started: {{ session().startTime.toLocaleString() }}</p>
      <p>Actions: {{ session().actions.length }}</p>
    </div>
  `,
})
class SessionTrackerComponent {
  session = useSessionStorage<Session>(
    'user-session',
    {
      startTime: new Date(),
      userId: '',
      actions: [],
    },
    {
      serializer: {
        read: (value: string) => {
          const parsed = JSON.parse(value);
          return {
            ...parsed,
            startTime: new Date(parsed.startTime),
          };
        },
        write: (value: Session) =>
          JSON.stringify({
            ...value,
            startTime: value.startTime.toISOString(),
          }),
      },
    }
  );
}
```

### Without Storage Events

```typescript
@Component({
  template: `<p>Form draft saved</p>`,
})
class FormDraftComponent {
  // Don't listen to storage events (sessionStorage rarely needs cross-tab sync anyway)
  draft = useSessionStorage('form-draft', '', {
    listenToStorageChanges: false,
  });
}
```

## Parameters

| Parameter       | Type                            | Description                                           |
| --------------- | ------------------------------- | ----------------------------------------------------- |
| `key`           | `string`                        | sessionStorage key to store the value under           |
| `defaultValue`  | `T`                             | Default value if no stored value exists               |
| `options`       | `UseStorageOptions<T>` (optional) | Configuration options                                 |

### Options Object

| Property                    | Type                                                  | Default        | Description                                                    |
| --------------------------- | ----------------------------------------------------- | -------------- | -------------------------------------------------------------- |
| `serializer`                | `{ read: (value: string) => T; write: (value: T) => string }` | JSON serializer | Custom serialization logic                                     |
| `listenToStorageChanges`    | `boolean`                                             | `true`         | Listen to storage events (rarely needed for sessionStorage)   |
| `writeDefaults`             | `boolean`                                             | `true`         | Write default value to storage on initialization if not present |

## Returns

`WritableSignal<T>` - A writable signal that syncs with sessionStorage

## Notes

- **Writable signal**: Returned signal can be updated using `.set()` and `.update()`
- **Automatic persistence**: Changes to the signal automatically save to sessionStorage
- **Session-scoped**: Data is cleared when the tab/window is closed
- **Tab-isolated**: Each tab has its own sessionStorage (unlike localStorage)
- **SSR safe**: Returns default value on server, hydrates from sessionStorage on client
- **Type safe**: Full TypeScript support with generic type parameter
- **JSON by default**: Uses `JSON.stringify`/`JSON.parse` for serialization by default
- **Custom serialization**: Provide custom serializer for complex types (Date, Map, Set, etc.)
- **Null removes**: Setting the value to `null` removes the key from sessionStorage
- **Error handling**: Gracefully handles quota exceeded errors and parse errors
- **Storage events**: Can listen to `storage` events but rarely needed for sessionStorage
- **Automatic cleanup**: Storage event listeners are removed when component is destroyed

## sessionStorage vs localStorage

| Feature                | sessionStorage                        | localStorage                    |
| ---------------------- | ------------------------------------- | ------------------------------- |
| **Lifetime**           | Until tab/window closes               | Persists forever                |
| **Scope**              | Per tab/window                        | Shared across all tabs          |
| **Storage events**     | Rarely needed (tab-isolated)          | Essential for cross-tab sync    |
| **Use cases**          | Temporary data, wizard state, filters | Preferences, auth, long-term data |
| **Size limit**         | ~5-10MB (same as localStorage)        | ~5-10MB                         |

## Common Use Cases

- **Multi-step forms/wizards**: Preserve form data during the session
- **Temporary filters**: Store filter/sort state during browsing
- **Tab-specific settings**: Settings that only apply to current tab
- **Session tracking**: Track user actions during the current session
- **Navigation history**: Remember where the user has been in this tab
- **Scroll position**: Restore scroll position on back navigation
- **Draft data**: Auto-save drafts that should be discarded when tab closes
- **Temporary authentication**: Short-lived session tokens

## When to Use sessionStorage vs localStorage

Use **sessionStorage** when:
- ✅ Data should be cleared when the tab closes
- ✅ Data is specific to a single tab/window
- ✅ You want to prevent data from persisting too long
- ✅ Working with temporary wizard/form state

Use **localStorage** when:
- ✅ Data should persist across sessions
- ✅ You need to sync data across tabs
- ✅ Storing user preferences or settings
- ✅ Data needs to survive browser restarts

## Source

<<< @/../src/lib/composables/browser/use-session-storage/use-session-storage.composable.ts
