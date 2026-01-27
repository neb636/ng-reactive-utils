# useSessionStorage

Creates a reactive signal bound to sessionStorage. The signal stays in sync with sessionStorage during the browser session. Unlike localStorage, sessionStorage is cleared when the tab/window is closed.

## Usage

```typescript
import { useSessionStorage } from 'ng-reactive-utils';

@Component({
  template: `
    <div>Current Step: {{ wizard.value().currentStep }}</div>
    <button (click)="nextStep()">Next</button>
  `,
})
class CheckoutWizardComponent {
  wizard = useSessionStorage('checkout-wizard', {
    currentStep: 1,
    completedSteps: [] as number[],
  });

  nextStep() {
    this.wizard.value.update((state) => ({
      ...state,
      currentStep: state.currentStep + 1,
      completedSteps: [...state.completedSteps, state.currentStep],
    }));
  }
}
```

## Basic Examples

### Simple String

```typescript
const { value: sessionId } = useSessionStorage('session-id', '');

sessionId.set('abc-123-xyz');
```

### Form Draft (Persists During Session)

```typescript
const { value: formDraft } = useSessionStorage('checkout-form', {
  name: '',
  email: '',
  address: '',
});

// Auto-save as user types
formDraft.update((draft) => ({ ...draft, name: 'John Doe' }));
```

### Auth Token for Session

```typescript
const { value: token, remove } = useSessionStorage<string | null>('auth-token', null);

// On login
token.set('jwt-token-12345');

// On logout
remove(); // Clears token and resets to null
```

### Shopping Cart for Session

```typescript
const { value: cart } = useSessionStorage<string[]>('cart-items', []);

// Add item
cart.update((items) => [...items, 'product-123']);
```

## Parameters

| Parameter      | Type                    | Default    | Description                          |
| -------------- | ----------------------- | ---------- | ------------------------------------ |
| `key`          | `string`                | _required_ | The sessionStorage key               |
| `defaultValue` | `T`                     | _required_ | Default value when storage empty     |
| `options`      | `UseStorageOptions<T>`  | `{}`       | Configuration options (see below)    |

## Options

| Option                   | Type                                           | Default         | Description                                               |
| ------------------------ | ---------------------------------------------- | --------------- | --------------------------------------------------------- |
| `serializer`             | `StorageSerializer<T>`                         | auto-detected   | Custom read/write serializer                              |
| `writeDefaults`          | `boolean`                                      | `true`          | Write default value to storage if not present             |
| `listenToStorageChanges` | `boolean`                                      | `true`          | Sync within same origin (limited for sessionStorage)      |
| `mergeDefaults`          | `boolean \| ((stored: T, defaults: T) => T)`   | `false`         | Merge defaults with stored value                          |
| `onError`                | `(error: unknown) => void`                     | `console.error` | Error handler for storage operations                      |

## Returns

| Property | Type               | Description                                      |
| -------- | ------------------ | ------------------------------------------------ |
| `value`  | `WritableSignal<T>` | Reactive signal bound to sessionStorage          |
| `remove` | `() => void`       | Removes item from storage, resets to default     |

## Advanced Examples

### Multi-Step Form Wizard

```typescript
interface WizardState {
  currentStep: number;
  completedSteps: number[];
  formData: {
    shipping?: { address: string; city: string };
    payment?: { cardType: string };
    review?: { confirmed: boolean };
  };
}

const { value: wizard, remove: resetWizard } = useSessionStorage<WizardState>(
  'order-wizard',
  {
    currentStep: 1,
    completedSteps: [],
    formData: {},
  }
);

// Save shipping step
wizard.update((state) => ({
  ...state,
  currentStep: 2,
  completedSteps: [...state.completedSteps, 1],
  formData: {
    ...state.formData,
    shipping: { address: '123 Main St', city: 'NYC' },
  },
}));

// On order completion, clear the wizard
resetWizard();
```

### Temporary Filter State

```typescript
interface FilterState {
  category: string;
  priceRange: [number, number];
  sortBy: string;
}

const { value: filters } = useSessionStorage<FilterState>('product-filters', {
  category: 'all',
  priceRange: [0, 1000],
  sortBy: 'relevance',
});
```

### Search History (Session Only)

```typescript
const { value: recentSearches } = useSessionStorage<string[]>('recent-searches', []);

// Add search term
recentSearches.update((searches) => {
  const updated = [newTerm, ...searches.filter((s) => s !== newTerm)];
  return updated.slice(0, 10); // Keep only last 10
});
```

### Custom Serializer for Date

```typescript
import { useSessionStorage, StorageSerializers } from 'ng-reactive-utils';

const { value: sessionStart } = useSessionStorage('session-start', new Date(), {
  serializer: StorageSerializers.date,
});
```

### Merge Defaults

```typescript
// User's sessionStorage has: { step: 2 }
// But you've added new properties:

const { value: wizard } = useSessionStorage(
  'wizard-state',
  {
    step: 1,
    canGoBack: true, // New property
    errors: [], // New property
  },
  { mergeDefaults: true }
);

// Result: { step: 2, canGoBack: true, errors: [] }
```

## localStorage vs sessionStorage

| Feature            | useLocalStorage                    | useSessionStorage                    |
| ------------------ | ---------------------------------- | ------------------------------------ |
| **Persistence**    | Until explicitly cleared           | Until tab/window closed              |
| **Cross-tab sync** | Yes, all tabs                      | No, isolated per tab                 |
| **Use case**       | Long-term preferences, saved data  | Temporary state, session-only data   |
| **Storage limit**  | ~5-10MB                            | ~5-10MB                              |

### When to Use sessionStorage

- **Form drafts** that shouldn't persist across sessions
- **Checkout flows** that should reset if user leaves
- **Temporary UI state** like filter selections
- **Auth tokens** that should expire with session
- **Search history** for current browsing session
- **Wizard/multi-step process** state

### When to Use localStorage

- **User preferences** (theme, language)
- **Shopping cart** that should persist
- **"Remember me"** functionality
- **Cached API data** for offline use

## Notes

- Serializer is **auto-detected** based on the default value type
- Returns the **default value** during SSR (Server-Side Rendering)
- Data is **automatically cleared** when browser tab/window closes
- Each tab has its **own isolated** sessionStorage
- Setting value to `null` or `undefined` **removes** the item from storage

## Source

<<< @/../src/lib/composables/state/use-session-storage/use-session-storage.composable.ts
