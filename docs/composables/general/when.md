# whenTrue / whenFalse / when

Declarative helpers that run a side effect callback when a signal satisfies a condition. The callback is automatically protected from creating unintended reactive dependencies — only the source signal drives re-execution.

## When to Use

Use these when you need to **react to a signal reaching a specific state** — for example, running setup logic when a panel opens, or teardown logic when it closes.

The problem they solve is the common `effect()` pattern where developers must manually remember to wrap callback logic in `untracked()`. Without `untracked`, any signal read inside the effect body creates an unintended subscription that can cause the effect to fire more often than expected:

```typescript
// Easy to get wrong — untracked is easy to forget
effect(() => {
  if (this.isOpen()) {
    untracked(() => {
      this.dashboardCopy.set(cloneDeep(this.dashboard()));
    });
  }
});

// The intent is immediately clear, untracked is handled for you
whenTrue(this.isOpen, () => {
  this.dashboardCopy.set(cloneDeep(this.dashboard()));
});
```

## Usage

### Sidebar with Setup and Teardown

A common pattern: initialize state when a panel opens, clean it up when it closes.

```typescript
import { whenTrue, whenFalse } from 'ng-reactive-utils';
import cloneDeep from 'lodash-es/cloneDeep';

@Component({
  selector: 'app-edit-sidebar',
  template: `<component-lib-sidebar [isOpen]="isOpen()">...</component-lib-sidebar>`,
})
class EditSidebarComponent {
  isOpen = input(false);
  dashboard = input<Dashboard | null>(null);
  dashboardCopy = signal<Dashboard | null>(null);

  // Runs each time isOpen becomes true
  onOpen = whenTrue(this.isOpen, () => {
    this.dashboardCopy.set(cloneDeep(this.dashboard()));
    this.fetchMetadata();
  });

  // Runs each time isOpen becomes false
  onClose = whenFalse(this.isOpen, () => {
    this.dashboardCopy.set(null);
  });
}
```

### Authentication Gate

Load user profile data once authentication is confirmed.

```typescript
import { whenTrue } from 'ng-reactive-utils';

@Component({ template: `...` })
class AppShellComponent {
  isAuthenticated = inject(AuthService).isAuthenticated;

  // Fires each time authentication state changes to true
  onAuthenticated = whenTrue(this.isAuthenticated, () => {
    inject(UserProfileService).loadProfile();
    inject(NotificationService).connect();
  });
}
```

### Feature Flag Activation

Respond when a remotely-configured feature flag turns on.

```typescript
import { whenTrue, whenFalse } from 'ng-reactive-utils';

@Component({ template: `...` })
class AnalyticsDashboardComponent {
  advancedChartsEnabled = inject(FeatureFlagService).flag('advanced-charts');

  onFeatureEnabled = whenTrue(this.advancedChartsEnabled, () => {
    this.loadChartLibrary();
  });

  onFeatureDisabled = whenFalse(this.advancedChartsEnabled, () => {
    this.unloadChartLibrary();
  });
}
```

### Upload Completion Handling

Use `when` with a predicate for any condition beyond true/false.

```typescript
import { when } from 'ng-reactive-utils';

type UploadStatus = 'idle' | 'uploading' | 'complete' | 'error';

@Component({ template: `...` })
class FileUploadComponent {
  uploadStatus = signal<UploadStatus>('idle');

  onUploadComplete = when(this.uploadStatus, (status) => status === 'complete', () => {
    this.showSuccessToast();
    this.refreshFileList();
  });

  onUploadError = when(this.uploadStatus, (status) => status === 'error', () => {
    this.showErrorDialog();
  });
}
```

### Count Threshold

React when a value crosses a meaningful threshold.

```typescript
import { when } from 'ng-reactive-utils';

@Component({ template: `...` })
class ItemListComponent {
  items = signal<Item[]>([]);
  itemCount = computed(() => this.items().length);

  onLargeList = when(this.itemCount, (count) => count > 500, () => {
    this.enableVirtualScrolling();
  });
}
```

### Early Cancellation

The returned cancel function lets you stop the effect before the component is destroyed — useful when the behavior is only needed for part of a component's lifetime.

```typescript
import { whenTrue } from 'ng-reactive-utils';

@Component({ template: `...` })
class OnboardingComponent {
  isGuideVisible = signal(false);
  stepCount = signal(0);

  // Stop reacting after the user dismisses the guide permanently
  cancel = whenTrue(this.isGuideVisible, () => {
    this.stepCount.update((n) => n + 1);
  });

  permanentlyDismiss() {
    this.isGuideVisible.set(false);
    this.cancel(); // No longer react to future changes
  }
}
```

## Parameters

### `whenTrue`

| Parameter  | Type               | Description                                            |
| ---------- | ------------------ | ------------------------------------------------------ |
| `source`   | `Signal<unknown>`  | The signal to watch                                    |
| `callback` | `() => void`       | Runs each time the signal becomes truthy               |

### `whenFalse`

| Parameter  | Type               | Description                                            |
| ---------- | ------------------ | ------------------------------------------------------ |
| `source`   | `Signal<unknown>`  | The signal to watch                                    |
| `callback` | `() => void`       | Runs each time the signal becomes falsy                |

### `when`

| Parameter   | Type                        | Description                                            |
| ----------- | --------------------------- | ------------------------------------------------------ |
| `source`    | `Signal<T>`                 | The signal to watch                                    |
| `predicate` | `(value: T) => boolean`     | Condition that determines when the callback fires      |
| `callback`  | `() => void`                | Runs each time the predicate returns `true`            |

## Returns

`() => void` — A cancel function that stops the effect immediately. Safe to call multiple times. Automatic cleanup on component destroy still runs even if called early.

The return value is designed to be stored as a class field so it can be called from a method without putting anything in the constructor:

```typescript
cancelEffect = whenTrue(this.someSignal, () => { ... });

stopReacting() {
  this.cancelEffect();
}
```

## Notes

- **Automatic `untracked`**: The callback is always executed inside `untracked()`. Any signals read inside the callback do not create reactive dependencies — only the source signal drives re-execution. This is intentional. If you need reactive behavior inside the callback, use a separate `effect()`.
- **Runs eagerly**: If the condition is already satisfied when the composable is created (e.g. `isOpen` starts as `true`), the callback runs on the first effect execution.
- **Runs every time**: The callback fires each time the condition transitions to `true` (or the predicate returns `true`), not just the first time. For run-once behavior, call `cancel()` inside the callback.
- **Truthy semantics**: `whenTrue` uses JavaScript truthiness (`Boolean(value)`). Values like `''`, `0`, `null`, and `undefined` are treated as falsy.
- **Injection context required**: Must be called as a class field initializer, inside a constructor, or within `runInInjectionContext`. Cannot be called in a method body.
- **`whenTrue` and `whenFalse` are built on `when`**: They are convenience wrappers equivalent to `when(source, Boolean, callback)` and `when(source, (v) => !v, callback)` respectively.

## Source

<<< @/../src/lib/composables/general/when/when.composable.ts
