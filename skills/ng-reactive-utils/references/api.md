# ng-reactive-utils API Reference

Complete API reference for all composables, effects, and utilities.

## Form Composables (Legacy Reactive Forms Only)

> **Important:** These composables are for **existing/legacy Reactive Forms** that use `FormGroup`, `FormControl`, and `FormBuilder`. Do NOT use these as a reason to create new forms with Reactive Forms. Angular's signal-based forms are the path forward for new form development.
>
> Use these when maintaining existing forms or in codebases that haven't adopted signal-based forms yet.

### useFormValue

Returns the form's current value as a signal.

```typescript
useFormValue<T>(form: FormGroup<T>): Signal<Partial<T>>
```

**Example:**
```typescript
const form = new FormGroup({
  name: new FormControl(''),
  email: new FormControl('')
});
const value = useFormValue(form);
// value() => { name: '', email: '' }
```

### useFormValid

Returns whether the form is valid as a signal.

```typescript
useFormValid(form: AbstractControl): Signal<boolean>
```

### useFormErrors

Returns the form's validation errors as a signal.

```typescript
useFormErrors(form: AbstractControl): Signal<ValidationErrors | null>
```

### useFormStatus

Returns the form's status as a signal.

```typescript
useFormStatus(form: AbstractControl): Signal<FormControlStatus>
// FormControlStatus = 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'
```

### useFormDirty

Returns whether the form is dirty as a signal.

```typescript
useFormDirty(form: AbstractControl): Signal<boolean>
```

### useFormTouched

Returns whether the form is touched as a signal.

```typescript
useFormTouched(form: AbstractControl): Signal<boolean>
```

### useFormPristine

Returns whether the form is pristine as a signal.

```typescript
useFormPristine(form: AbstractControl): Signal<boolean>
```

### useFormPending

Returns whether the form has pending async validators as a signal.

```typescript
useFormPending(form: AbstractControl): Signal<boolean>
```

### useFormDisabled

Returns whether the form is disabled as a signal.

```typescript
useFormDisabled(form: AbstractControl): Signal<boolean>
```

### useFormUntouched

Returns whether the form is untouched as a signal.

```typescript
useFormUntouched(form: AbstractControl): Signal<boolean>
```

### useFormState

Returns all form state properties as a single signal.

```typescript
useFormState<T>(form: FormGroup<T>): Signal<{
  value: Partial<T>;
  valid: boolean;
  invalid: boolean;
  pending: boolean;
  disabled: boolean;
  enabled: boolean;
  dirty: boolean;
  pristine: boolean;
  touched: boolean;
  untouched: boolean;
  errors: ValidationErrors | null;
  status: FormControlStatus;
}>
```

## Control Composables

All control composables work with `FormControl`, `FormGroup`, or `FormArray`.

### useControlValue

Returns the control's current value as a signal.

```typescript
useControlValue<T>(control: AbstractControl<T>): Signal<T>
```

### useControlValid

Returns whether the control is valid as a signal.

```typescript
useControlValid(control: AbstractControl): Signal<boolean>
```

### useControlErrors

Returns the control's validation errors as a signal.

```typescript
useControlErrors(control: AbstractControl): Signal<ValidationErrors | null>
```

### useControlStatus

Returns the control's status as a signal.

```typescript
useControlStatus(control: AbstractControl): Signal<FormControlStatus>
```

### useControlDirty

Returns whether the control is dirty as a signal.

```typescript
useControlDirty(control: AbstractControl): Signal<boolean>
```

### useControlTouched

Returns whether the control is touched as a signal.

```typescript
useControlTouched(control: AbstractControl): Signal<boolean>
```

### useControlPristine

Returns whether the control is pristine as a signal.

```typescript
useControlPristine(control: AbstractControl): Signal<boolean>
```

### useControlPending

Returns whether the control has pending async validators as a signal.

```typescript
useControlPending(control: AbstractControl): Signal<boolean>
```

### useControlDisabled

Returns whether the control is disabled as a signal.

```typescript
useControlDisabled(control: AbstractControl): Signal<boolean>
```

### useControlUntouched

Returns whether the control is untouched as a signal.

```typescript
useControlUntouched(control: AbstractControl): Signal<boolean>
```

### useControlState

Returns all control state properties as a single signal.

```typescript
useControlState<T>(control: AbstractControl<T>): Signal<{
  value: T;
  valid: boolean;
  invalid: boolean;
  pending: boolean;
  disabled: boolean;
  enabled: boolean;
  dirty: boolean;
  pristine: boolean;
  touched: boolean;
  untouched: boolean;
  errors: ValidationErrors | null;
  status: FormControlStatus;
}>
```

## Route Composables

### useRouteParam

Returns a single route parameter as a signal.

```typescript
useRouteParam(paramName: string): Signal<string | null>
```

**Example:**
```typescript
// URL: /users/123
const userId = useRouteParam('id');
// userId() => '123'
```

### useRouteQueryParam

Returns a single query parameter as a signal.

```typescript
useRouteQueryParam(paramName: string): Signal<string | null>
```

**Example:**
```typescript
// URL: /search?q=angular
const query = useRouteQueryParam('q');
// query() => 'angular'
```

### useRouteParams

Returns all route parameters as a signal.

```typescript
useRouteParams(): Signal<Params>
```

### useRouteQueryParams

Returns all query parameters as a signal.

```typescript
useRouteQueryParams(): Signal<Params>
```

### useRouteFragment

Returns the URL fragment as a signal.

```typescript
useRouteFragment(): Signal<string | null>
```

**Example:**
```typescript
// URL: /page#section-2
const fragment = useRouteFragment();
// fragment() => 'section-2'
```

### useRouteData

Returns route data as a signal.

```typescript
useRouteData<T = Data>(): Signal<T>
```

## Browser Composables

### useWindowSize

Returns window dimensions as signals.

```typescript
useWindowSize(): { width: Signal<number>; height: Signal<number> }
```

**Example:**
```typescript
const { width, height } = useWindowSize();
// width() => 1920
// height() => 1080
```

### useMousePosition

Returns mouse coordinates as signals.

```typescript
useMousePosition(): { x: Signal<number>; y: Signal<number> }
```

### useDocumentVisibility

Returns the document visibility state as a signal.

```typescript
useDocumentVisibility(): Signal<DocumentVisibilityState>
// DocumentVisibilityState = 'visible' | 'hidden'
```

### useElementBounding

Returns element bounding rect properties as signals.

```typescript
useElementBounding(elementRef: ElementRef): {
  x: Signal<number>;
  y: Signal<number>;
  width: Signal<number>;
  height: Signal<number>;
  top: Signal<number>;
  right: Signal<number>;
  bottom: Signal<number>;
  left: Signal<number>;
}
```

## Signal Utilities

### useDebouncedSignal

Returns a debounced version of the input signal.

```typescript
useDebouncedSignal<T>(source: Signal<T>, delayMs: number): Signal<T>
```

**Example:**
```typescript
const searchTerm = signal('');
const debouncedSearch = useDebouncedSignal(searchTerm, 300);
// debouncedSearch() updates 300ms after searchTerm stops changing
```

### useThrottledSignal

Returns a throttled version of the input signal.

```typescript
useThrottledSignal<T>(source: Signal<T>, intervalMs: number): Signal<T>
```

**Example:**
```typescript
const scrollPosition = signal(0);
const throttledScroll = useThrottledSignal(scrollPosition, 100);
// throttledScroll() updates at most every 100ms
```

### usePreviousSignal

Returns the previous value of the input signal.

```typescript
usePreviousSignal<T>(source: Signal<T>): Signal<T | undefined>
```

**Example:**
```typescript
const count = signal(0);
const previousCount = usePreviousSignal(count);

count.set(1);
// count() => 1
// previousCount() => 0
```

## Effects

### syncLocalStorageEffect

Syncs a signal's value with localStorage. Automatically restores the value on initialization.

```typescript
syncLocalStorageEffect<T>(key: string, signal: WritableSignal<T>): void
```

**Example:**
```typescript
const theme = signal<'light' | 'dark'>('light');
syncLocalStorageEffect('app-theme', theme);
// Changes to theme are persisted to localStorage
// On init, theme is restored from localStorage if present
```

### syncQueryParamsEffect

Syncs signals with URL query parameters. Automatically updates the URL when signals change.

```typescript
syncQueryParamsEffect(params: Record<string, WritableSignal<string>>): void
```

**Example:**
```typescript
const category = signal('all');
const sort = signal('date');

syncQueryParamsEffect({
  category: category,
  sort: sort
});
// URL updates to: ?category=all&sort=date
// Changing signals updates the URL
// URL changes update the signals
```

## Utilities

### createSharedComposable

Creates a shared instance of a composable with reference counting. The composable is only initialized once and cleaned up when the last consumer is destroyed.

```typescript
createSharedComposable<T>(composableFn: () => T): () => T
```

**Example:**
```typescript
// Create a shared window size composable
const useSharedWindowSize = createSharedComposable(() => useWindowSize());

// In any component - all get the same instance
const { width, height } = useSharedWindowSize();
```
