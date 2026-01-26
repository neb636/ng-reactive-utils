# syncLocalStorageEffect

Effect that syncs a signal to localStorage (one-way: signal → storage). This is useful when you want to persist signal changes but don't need two-way sync.

## Usage

```typescript
import { syncLocalStorageEffect } from 'ng-reactive-utils';

@Component({})
class FormComponent {
  formData = signal({ name: '', email: '' });

  constructor() {
    syncLocalStorageEffect({
      signal: this.formData,
      key: 'form-draft',
    });
  }
}
```

## Parameters

| Parameter   | Type                         | Default          | Description                              |
| ----------- | ---------------------------- | ---------------- | ---------------------------------------- |
| `signal`    | `Signal<any>`                | _required_       | The signal to sync to localStorage       |
| `key`       | `string`                     | _required_       | localStorage key to use                  |
| `serialize` | `(value: any) => string`     | `JSON.stringify` | Optional custom serialization function   |

## Notes

- This is **one-way sync**: signal → localStorage
- Uses `JSON.stringify` by default for serialization
- Automatically handles errors if localStorage is unavailable or quota exceeded
- Effect runs automatically whenever the signal changes
- For two-way sync (reading from localStorage on init), use a composable pattern instead

## Source

<<< @/../projects/ng-reactive-utils/src/lib/effects/sync-local-storage/sync-local-storage.effect.ts
