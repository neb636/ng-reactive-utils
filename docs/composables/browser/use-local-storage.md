# useLocalStorage

Creates a writable signal that automatically syncs with localStorage. The signal persists its value across page reloads and updates when the storage value changes in other tabs/windows.

**MDN Reference:** [Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## Usage

### Basic Usage

```typescript
import { useLocalStorage } from 'ng-reactive-utils';

@Component({
  template: `
    <div>
      <p>Counter: {{ counter() }}</p>
      <button (click)="counter.set(counter() + 1)">Increment</button>
      <button (click)="counter.set(0)">Reset</button>
    </div>
  `,
})
class CounterComponent {
  // Value persists across page reloads
  counter = useLocalStorage('counter', 0);
}
```

### With Object Values

```typescript
interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  notifications: boolean;
}

@Component({
  template: `
    <div [class]="prefs().theme">
      <button (click)="toggleTheme()">Toggle Theme</button>
      <p>Font size: {{ prefs().fontSize }}px</p>
      <label>
        <input
          type="checkbox"
          [checked]="prefs().notifications"
          (change)="toggleNotifications()"
        />
        Notifications
      </label>
    </div>
  `,
})
class PreferencesComponent {
  prefs = useLocalStorage<UserPreferences>('user-prefs', {
    theme: 'light',
    fontSize: 16,
    notifications: true,
  });

  toggleTheme() {
    this.prefs.update((p) => ({
      ...p,
      theme: p.theme === 'light' ? 'dark' : 'light',
    }));
  }

  toggleNotifications() {
    this.prefs.update((p) => ({ ...p, notifications: !p.notifications }));
  }
}
```

### With Custom Serialization

```typescript
@Component({
  template: `<p>Last visit: {{ lastVisit() }}</p>`,
})
class LastVisitComponent {
  lastVisit = useLocalStorage('last-visit', new Date(), {
    serializer: {
      read: (value: string) => new Date(value),
      write: (value: Date) => value.toISOString(),
    },
  });

  constructor() {
    // Update to current time
    this.lastVisit.set(new Date());
  }
}
```

### Array Storage

```typescript
interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

@Component({
  template: `
    <ul>
      @for (todo of todos(); track todo.id) {
        <li>
          <input
            type="checkbox"
            [checked]="todo.done"
            (change)="toggleTodo(todo.id)"
          />
          {{ todo.text }}
        </li>
      }
    </ul>
    <button (click)="addTodo()">Add Todo</button>
  `,
})
class TodoListComponent {
  todos = useLocalStorage<TodoItem[]>('todos', []);

  addTodo() {
    const newTodo: TodoItem = {
      id: Date.now(),
      text: 'New task',
      done: false,
    };
    this.todos.update((todos) => [...todos, newTodo]);
  }

  toggleTodo(id: number) {
    this.todos.update((todos) =>
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  }
}
```

### Sync Across Tabs

```typescript
@Component({
  template: `
    <div>
      <p>Shared counter: {{ sharedCounter() }}</p>
      <button (click)="sharedCounter.set(sharedCounter() + 1)">Increment</button>
      <p class="hint">Open this page in another tab to see sync in action!</p>
    </div>
  `,
})
class CrossTabSyncComponent {
  // Automatically syncs when changed in another tab
  sharedCounter = useLocalStorage('shared-counter', 0);
}
```

### Computed from Storage

```typescript
@Component({
  template: `
    <div>
      <input
        type="text"
        [value]="searchQuery()"
        (input)="searchQuery.set($any($event.target).value)"
      />
      <p>Search history: {{ searchHistory().length }} items</p>
    </div>
  `,
})
class SearchComponent {
  searchQuery = useLocalStorage('current-search', '');
  searchHistory = useLocalStorage<string[]>('search-history', []);

  // Computed signal based on storage
  hasSearched = computed(() => this.searchHistory().length > 0);

  constructor() {
    // Add to history when query changes
    effect(() => {
      const query = this.searchQuery();
      if (query.trim()) {
        this.searchHistory.update((history) => [query, ...history.slice(0, 9)]);
      }
    });
  }
}
```

### Form State Persistence

```typescript
interface FormData {
  name: string;
  email: string;
  message: string;
}

@Component({
  template: `
    <form>
      <input
        [(ngModel)]="draftForm().name"
        (ngModelChange)="updateDraft('name', $event)"
      />
      <input
        [(ngModel)]="draftForm().email"
        (ngModelChange)="updateDraft('email', $event)"
      />
      <textarea
        [(ngModel)]="draftForm().message"
        (ngModelChange)="updateDraft('message', $event)"
      ></textarea>
      <button (click)="clearDraft()">Clear Draft</button>
    </form>
  `,
})
class DraftFormComponent {
  draftForm = useLocalStorage<FormData>('form-draft', {
    name: '',
    email: '',
    message: '',
  });

  updateDraft(field: keyof FormData, value: string) {
    this.draftForm.update((draft) => ({ ...draft, [field]: value }));
  }

  clearDraft() {
    this.draftForm.set({ name: '', email: '', message: '' });
  }
}
```

### Removing Values

```typescript
@Component({
  template: `
    <div>
      <p>Token: {{ token() || 'Not set' }}</p>
      <button (click)="login()">Login</button>
      <button (click)="logout()">Logout</button>
    </div>
  `,
})
class LoginComponent {
  token = useLocalStorage<string | null>('auth-token', null);

  login() {
    this.token.set('abc123');
  }

  logout() {
    // Set to null to remove from localStorage
    this.token.set(null);
  }
}
```

## Parameters

| Parameter       | Type                            | Description                                           |
| --------------- | ------------------------------- | ----------------------------------------------------- |
| `key`           | `string`                        | localStorage key to store the value under             |
| `defaultValue`  | `T`                             | Default value if no stored value exists               |
| `options`       | `UseStorageOptions<T>` (optional) | Configuration options                                 |

### Options Object

| Property                    | Type                                                  | Default        | Description                                                    |
| --------------------------- | ----------------------------------------------------- | -------------- | -------------------------------------------------------------- |
| `serializer`                | `{ read: (value: string) => T; write: (value: T) => string }` | JSON serializer | Custom serialization logic                                     |
| `writeDefaults`             | `boolean`                                             | `true`         | Write default value to storage on initialization if not present |

## Returns

`WritableSignal<T>` - A writable signal that syncs with localStorage

## Notes

- **Writable signal**: Returned signal can be updated using `.set()` and `.update()`
- **Automatic persistence**: Changes to the signal automatically save to localStorage
- **Cross-tab sync**: Changes in other tabs/windows automatically update the signal
- **SSR safe**: Returns default value on server, hydrates from localStorage on client
- **Type safe**: Full TypeScript support with generic type parameter
- **JSON by default**: Uses `JSON.stringify`/`JSON.parse` for serialization by default
- **Custom serialization**: Provide custom serializer for complex types (Date, Map, Set, etc.)
- **Null removes**: Setting the value to `null` removes the key from localStorage
- **Error handling**: Gracefully handles quota exceeded errors and parse errors
- **Storage events**: Automatically listens to `storage` events to sync across tabs
- **Automatic cleanup**: Storage event listeners are removed when component is destroyed

## Common Serializers

### Date Serializer
```typescript
{
  read: (value: string) => new Date(value),
  write: (value: Date) => value.toISOString(),
}
```

### Map Serializer
```typescript
{
  read: (value: string) => new Map(JSON.parse(value)),
  write: (value: Map<any, any>) => JSON.stringify([...value]),
}
```

### Set Serializer
```typescript
{
  read: (value: string) => new Set(JSON.parse(value)),
  write: (value: Set<any>) => JSON.stringify([...value]),
}
```

## Common Use Cases

- **User preferences**: Theme, language, font size, layout preferences
- **Form drafts**: Auto-save form data to prevent data loss
- **Authentication**: Store tokens or session data (consider security implications)
- **Shopping cart**: Persist cart items across sessions
- **UI state**: Remember expanded/collapsed sections, selected tabs, etc.
- **Recent searches**: Store and display recent search queries
- **Feature flags**: Store user-specific feature flags
- **Analytics**: Track user behavior across sessions

## Security Considerations

- **Never store sensitive data**: localStorage is not encrypted and accessible via JavaScript
- **Be cautious with tokens**: Consider using httpOnly cookies for sensitive auth tokens
- **Validate stored data**: Always validate data read from localStorage as it can be modified by users
- **XSS vulnerabilities**: Stored data can be accessed by malicious scripts

## Storage Limits

- Most browsers allow **5-10MB** of localStorage per origin
- Exceeding quota throws a `QuotaExceededError` (handled gracefully by this composable)
- Use compression for large data or consider alternative storage (IndexedDB)

## Source

<<< @/../src/lib/composables/browser/use-local-storage/use-local-storage.composable.ts
