# useLocalStorage

Creates a reactive signal bound to localStorage. The signal stays in sync with localStorage and updates across browser tabs.

## Usage

```typescript
import { useLocalStorage } from 'ng-reactive-utils';

@Component({
  template: `
    <select [value]="theme.value()" (change)="theme.value.set($any($event.target).value)">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  `,
})
class ThemeSwitcherComponent {
  theme = useLocalStorage('theme', 'light');
}
```

## Basic Examples

### Simple String

```typescript
const { value: username } = useLocalStorage('username', 'Guest');

// Read
console.log(username()); // 'Guest' or stored value

// Write
username.set('John');
```

### Object with Auto-serialization

```typescript
const { value: settings } = useLocalStorage('settings', {
  notifications: true,
  volume: 80,
  language: 'en',
});

// Update single property
settings.update((s) => ({ ...s, volume: 50 }));
```

### Typed Arrays

```typescript
interface CartItem {
  id: string;
  name: string;
  quantity: number;
}

const { value: cart } = useLocalStorage<CartItem[]>('shopping-cart', []);

// Add item
cart.update((items) => [...items, { id: '1', name: 'Product', quantity: 1 }]);
```

### With Remove Function

```typescript
const { value: token, remove } = useLocalStorage<string | null>('auth-token', null);

// On logout
remove(); // Clears from localStorage and resets signal to null
```

## Parameters

| Parameter      | Type                    | Default    | Description                       |
| -------------- | ----------------------- | ---------- | --------------------------------- |
| `key`          | `string`                | _required_ | The localStorage key              |
| `defaultValue` | `T`                     | _required_ | Default value when storage empty  |
| `options`      | `UseStorageOptions<T>`  | `{}`       | Configuration options (see below) |

## Options

| Option                   | Type                                           | Default         | Description                                               |
| ------------------------ | ---------------------------------------------- | --------------- | --------------------------------------------------------- |
| `serializer`             | `StorageSerializer<T>`                         | auto-detected   | Custom read/write serializer                              |
| `writeDefaults`          | `boolean`                                      | `true`          | Write default value to storage if not present             |
| `listenToStorageChanges` | `boolean`                                      | `true`          | Sync across browser tabs                                  |
| `mergeDefaults`          | `boolean \| ((stored: T, defaults: T) => T)`   | `false`         | Merge defaults with stored value                          |
| `onError`                | `(error: unknown) => void`                     | `console.error` | Error handler for storage operations                      |

## Returns

| Property | Type               | Description                                    |
| -------- | ------------------ | ---------------------------------------------- |
| `value`  | `WritableSignal<T>` | Reactive signal bound to localStorage          |
| `remove` | `() => void`       | Removes item from storage, resets to default   |

## Advanced Examples

### Merge Defaults (Schema Migration)

When you add new properties to your stored object, existing users won't have them. Use `mergeDefaults` to handle this:

```typescript
// User's localStorage has: { theme: 'dark' }
// But you've added new settings:

const { value: settings } = useLocalStorage(
  'app-settings',
  {
    theme: 'light',
    fontSize: 14, // New property
    showSidebar: true, // New property
  },
  { mergeDefaults: true }
);

// Result: { theme: 'dark', fontSize: 14, showSidebar: true }
```

### Custom Serializer for Date

```typescript
import { useLocalStorage, StorageSerializers } from 'ng-reactive-utils';

const { value: lastVisit } = useLocalStorage('last-visit', new Date(), {
  serializer: StorageSerializers.date,
});
```

### Custom Serializer for Map

```typescript
const { value: userScores } = useLocalStorage(
  'user-scores',
  new Map<string, number>(),
  { serializer: StorageSerializers.map }
);

userScores.update((scores) => {
  scores.set('player1', 100);
  return new Map(scores);
});
```

### Custom Serializer for Set

```typescript
const { value: favorites } = useLocalStorage('favorites', new Set<string>(), {
  serializer: StorageSerializers.set,
});
```

### Error Handling

```typescript
const { value: data } = useLocalStorage('user-data', { name: '' }, {
  onError: (error) => {
    console.error('Storage error:', error);
    // Report to error tracking service
  },
});
```

### Cross-Tab Sync

Values automatically sync across browser tabs:

```typescript
// Tab 1
const { value: theme } = useLocalStorage('theme', 'light');
theme.set('dark');

// Tab 2 (same code)
const { value: theme } = useLocalStorage('theme', 'light');
// Automatically updates to 'dark' when Tab 1 changes it
```

To disable cross-tab sync:

```typescript
const { value: theme } = useLocalStorage('theme', 'light', {
  listenToStorageChanges: false,
});
```

## Built-in Serializers

The `StorageSerializers` object provides serializers for common types:

| Serializer | Type        | Description                                      |
| ---------- | ----------- | ------------------------------------------------ |
| `string`   | `string`    | Plain string (no transformation)                 |
| `number`   | `number`    | Number (via `parseFloat`)                        |
| `boolean`  | `boolean`   | Boolean (`"true"` / `"false"`)                   |
| `object`   | `object`    | JSON object/array (via `JSON.parse/stringify`)   |
| `map`      | `Map`       | JavaScript Map                                   |
| `set`      | `Set`       | JavaScript Set                                   |
| `date`     | `Date`      | JavaScript Date (via `toISOString`)              |
| `any`      | `any`       | Raw string passthrough                           |

## Notes

- Serializer is **auto-detected** based on the default value type (string, number, boolean, or object)
- Returns the **default value** during SSR (Server-Side Rendering)
- Uses **passive event listeners** for optimal performance
- Automatically **cleans up** event listeners when component is destroyed
- Setting value to `null` or `undefined` **removes** the item from storage

## Use Cases

- **Theme preferences**: Persist dark/light mode
- **User settings**: Store app preferences
- **Form drafts**: Auto-save form progress
- **Shopping cart**: Persist cart across sessions
- **Recent items**: Store recently viewed items
- **Authentication**: Store tokens (consider security implications)

## Source

<<< @/../src/lib/composables/state/use-local-storage/use-local-storage.composable.ts
