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

| Parameter   | Type                      | Default          | Description                            |
| ----------- | ------------------------- | ---------------- | -------------------------------------- |
| `signal`    | `Signal<T>`               | _required_       | The signal to sync to localStorage     |
| `key`       | `string`                  | _required_       | localStorage key to use                |
| `serialize` | `(value: T) => string`    | `JSON.stringify` | Optional custom serialization function |

## Returns

`EffectRef` — can be used to destroy the effect early if needed.

## Notes

- This is **one-way sync**: signal → localStorage
- Uses `JSON.stringify` by default for serialization
- Automatically handles errors if localStorage is unavailable or quota exceeded
- Effect runs automatically whenever the signal changes
- **SSR safe**: no-ops on the server without any warnings
- For two-way sync (reading from localStorage on init), use `useLocalStorage` instead

## Source

<<< @/../src/lib/effects/sync-local-storage/sync-local-storage.effect.ts
