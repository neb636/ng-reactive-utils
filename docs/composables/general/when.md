# when · whenTrue · whenFalse

Run a side effect callback when a signal satisfies a condition.

- Only the source signal drives re-execution — the callback is wrapped in `untracked` automatically
- Returns a cancel function that can be stored as a class field and called from a method

**The problem they replace:**

```typescript
// Easy to get wrong — untracked is easy to forget, effects grow noisy over time
effect(() => {
  if (this.isOpen()) {
    untracked(() => {
      this.dashboardCopy.set(cloneDeep(this.dashboard()));
    });
  }
});

// Clear trigger, untracked handled for you
whenTrue(this.isOpen, () => {
  this.dashboardCopy.set(cloneDeep(this.dashboard()));
});
```

## Usage

### Sidebar with Setup and Teardown

```typescript
import { whenTrue, whenFalse } from 'ng-reactive-utils';

@Component({
  template: `<component-lib-sidebar [isOpen]="isOpen()">...</component-lib-sidebar>`,
})
class EditSidebarComponent {
  isOpen = input(false);
  dashboard = input<Dashboard | null>(null);
  dashboardCopy = signal<Dashboard | null>(null);

  onOpen = whenTrue(this.isOpen, () => {
    this.dashboardCopy.set(cloneDeep(this.dashboard()));
    this.fetchMetadata();
  });

  onClose = whenFalse(this.isOpen, () => {
    this.dashboardCopy.set(null);
  });
}
```

### Custom Condition with `when`

Use `when` with a predicate for any condition beyond truthy/falsy.

```typescript
import { when } from 'ng-reactive-utils';

type UploadStatus = 'idle' | 'uploading' | 'complete' | 'error';

@Component({ template: `...` })
class FileUploadComponent {
  uploadStatus = signal<UploadStatus>('idle');

  onUploadComplete = when(
    this.uploadStatus,
    (status) => status === 'complete',
    () => {
      this.showSuccessToast();
      this.refreshFileList();
    },
  );

  onUploadError = when(
    this.uploadStatus,
    (status) => status === 'error',
    () => {
      this.showErrorDialog();
    },
  );
}
```

### Early Cancellation

```typescript
import { whenTrue } from 'ng-reactive-utils';

@Component({ template: `...` })
class OnboardingComponent {
  isGuideVisible = signal(false);
  stepCount = signal(0);

  onGuideVisible = whenTrue(this.isGuideVisible, () => {
    this.stepCount.update((n) => n + 1);
  });

  permanentlyDismiss() {
    this.isGuideVisible.set(false);
    this.onGuideVisible(); // cancel — no longer reacts to future changes
  }
}
```

## Parameters

### `when`

| Parameter   | Type                    | Description                                   |
| ----------- | ----------------------- | --------------------------------------------- |
| `source`    | `Signal<T>`             | The signal to watch                           |
| `predicate` | `(value: T) => boolean` | Condition that determines when callback fires |
| `callback`  | `() => void`            | Runs each time the predicate returns `true`   |

### `whenTrue` · `whenFalse`

| Parameter  | Type              | Description                                    |
| ---------- | ----------------- | ---------------------------------------------- |
| `source`   | `Signal<unknown>` | The signal to watch                            |
| `callback` | `() => void`      | Runs each time the signal becomes truthy/falsy |

## Returns

`() => void` — A cancel function that stops the effect immediately. Safe to call multiple times. Automatic cleanup on component destroy still applies.

## Notes

- **Automatic `untracked`**: Signals read inside the callback do not create reactive dependencies. If you need reactive behavior inside the callback, use a separate `effect()`.
- **Runs eagerly**: If the condition is already met at creation time, the callback fires on the first effect execution.
- **Runs every time**: Fires each time the condition becomes true, not just the first time. For run-once behavior, call the cancel function inside the callback.
- **Truthy semantics**: `whenTrue` uses `Boolean(value)` — `''`, `0`, `null`, and `undefined` are treated as falsy.
- **Injection context required**: Must be called as a class field initializer, in a constructor, or within `runInInjectionContext`.

## Source

<<< @/../src/lib/composables/general/when/when.composable.ts
