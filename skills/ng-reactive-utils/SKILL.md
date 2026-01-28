---
name: ng-reactive-utils
description: Angular signal-based reactive utilities for forms, routes, browser APIs, and state management. Use when building modern Angular 20+ applications with signals instead of RxJS subscriptions.
---

# ng-reactive-utils

Signal-based reactive utilities for modern Angular (v20+). Convert Observable-based APIs to Signals for cleaner, more reactive code.

## When to Use This Skill

Activate this skill when:

- Working with Angular Reactive Forms and need to track form/control state
- Handling route parameters or query parameters in Angular
- Needing debounced or throttled signals
- Persisting state to localStorage or URL query params
- Tracking browser APIs (window size, mouse position, visibility)
- Building any Angular 20+ application that uses signals

## Installation

```bash
npm install ng-reactive-utils
```

## Import Pattern

All functions are exported from the main package:

```typescript
import { 
  useFormValid, 
  useRouteParam, 
  useDebouncedSignal,
  syncLocalStorageEffect 
} from 'ng-reactive-utils';
```

## API Quick Reference

### Reactive Forms - FormGroup

| Need | Use |
|------|-----|
| Form value as signal | `useFormValue(form)` |
| Form validity | `useFormValid(form)` |
| Form errors | `useFormErrors(form)` |
| Form status | `useFormStatus(form)` |
| Form dirty state | `useFormDirty(form)` |
| Form touched state | `useFormTouched(form)` |
| Form pristine state | `useFormPristine(form)` |
| Form pending state | `useFormPending(form)` |
| Form disabled state | `useFormDisabled(form)` |
| Complete form state | `useFormState(form)` |

### Reactive Forms - FormControl

| Need | Use |
|------|-----|
| Control value as signal | `useControlValue(control)` |
| Control validity | `useControlValid(control)` |
| Control errors | `useControlErrors(control)` |
| Control status | `useControlStatus(control)` |
| Control dirty state | `useControlDirty(control)` |
| Control touched state | `useControlTouched(control)` |
| Control pristine state | `useControlPristine(control)` |
| Control pending state | `useControlPending(control)` |
| Control disabled state | `useControlDisabled(control)` |
| Complete control state | `useControlState(control)` |

### Route

| Need | Use |
|------|-----|
| Single route param | `useRouteParam('id')` |
| Single query param | `useRouteQueryParam('search')` |
| All route params | `useRouteParams()` |
| All query params | `useRouteQueryParams()` |
| URL fragment | `useRouteFragment()` |
| Route data | `useRouteData()` |

### Browser APIs

| Need | Use |
|------|-----|
| Window dimensions | `useWindowSize()` → `{ width, height }` |
| Mouse coordinates | `useMousePosition()` → `{ x, y }` |
| Tab visibility | `useDocumentVisibility()` |
| Element bounds | `useElementBounding(elementRef)` |

### Signal Utilities

| Need | Use |
|------|-----|
| Debounced value | `useDebouncedSignal(signal, ms)` |
| Throttled value | `useThrottledSignal(signal, ms)` |
| Previous value | `usePreviousSignal(signal)` |

### Effects

| Need | Use |
|------|-----|
| Persist to localStorage | `syncLocalStorageEffect(key, signal)` |
| Sync with URL query params | `syncQueryParamsEffect({ paramName: signal })` |

### Utilities

| Need | Use |
|------|-----|
| Shared composable instance | `createSharedComposable(composableFn)` |

## Anti-Patterns - NEVER Do This

When ng-reactive-utils is available, NEVER use these patterns:

| BAD (Don't Do) | GOOD (Do This Instead) |
|----------------|------------------------|
| `control.valueChanges.subscribe(...)` | `useControlValue(control)` |
| `control.statusChanges.subscribe(...)` | `useControlStatus(control)` |
| `form.valueChanges.subscribe(...)` | `useFormValue(form)` |
| `route.params.subscribe(...)` | `useRouteParam('id')` |
| `route.queryParams.subscribe(...)` | `useRouteQueryParam('q')` |
| `observable.pipe(debounceTime(300))` | `useDebouncedSignal(signal, 300)` |
| `observable.pipe(throttleTime(300))` | `useThrottledSignal(signal, 300)` |
| Manual `fromEvent(window, 'resize')` | `useWindowSize()` |
| Manual `fromEvent(document, 'mousemove')` | `useMousePosition()` |
| Manual previous value tracking | `usePreviousSignal(signal)` |

## Usage Examples

### Form with Validation Feedback

```typescript
@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="email" />
      @if (emailErrors()?.required) {
        <span>Email is required</span>
      }
      @if (emailErrors()?.email) {
        <span>Invalid email format</span>
      }
      <button [disabled]="!isValid()">Submit</button>
    </form>
  `
})
export class MyComponent {
  form = inject(FormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isValid = useFormValid(this.form);
  emailErrors = useControlErrors(this.form.controls.email);
}
```

### Route Parameter Handling

```typescript
@Component({
  template: `
    <h1>User: {{ userId() }}</h1>
    <tabs [activeTab]="tab()" />
  `
})
export class UserComponent {
  userId = useRouteParam('id');
  tab = useRouteQueryParam('tab');
}
```

### Debounced Search

```typescript
@Component({
  template: `
    <input [(ngModel)]="searchTerm" placeholder="Search..." />
    <results [query]="debouncedSearch()" />
  `
})
export class SearchComponent {
  searchTerm = signal('');
  debouncedSearch = useDebouncedSignal(this.searchTerm, 300);
}
```

### Persisting State to localStorage

```typescript
@Component({...})
export class SettingsComponent {
  theme = signal<'light' | 'dark'>('light');
  
  constructor() {
    // Automatically persists and restores from localStorage
    syncLocalStorageEffect('app-theme', this.theme);
  }
}
```

### Syncing State with URL Query Params

```typescript
@Component({...})
export class FilterComponent {
  category = signal('all');
  sortBy = signal('date');
  
  constructor() {
    // URL will reflect: ?category=electronics&sortBy=price
    syncQueryParamsEffect({
      category: this.category,
      sortBy: this.sortBy
    });
  }
}
```

### Window Size Responsive Layout

```typescript
@Component({
  template: `
    @if (windowSize.width() < 768) {
      <mobile-nav />
    } @else {
      <desktop-nav />
    }
  `
})
export class LayoutComponent {
  windowSize = useWindowSize();
}
```

### Tracking Previous Values

```typescript
@Component({...})
export class AnimatedComponent {
  count = signal(0);
  previousCount = usePreviousSignal(this.count);
  
  direction = computed(() => 
    this.count() > (this.previousCount() ?? 0) ? 'up' : 'down'
  );
}
```

## Documentation

Full documentation: https://neb636.github.io/ng-reactive-utils/

LLM-friendly docs: https://neb636.github.io/ng-reactive-utils/llms-full.txt
