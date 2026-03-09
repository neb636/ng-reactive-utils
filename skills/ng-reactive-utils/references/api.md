# ng-reactive-utils API Reference

Complete API reference for all composables and utilities.

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

### useFormUntouched

Returns whether the form is untouched as a signal.

```typescript
useFormUntouched(form: AbstractControl): Signal<boolean>
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

### useControlUntouched

Returns whether the control is untouched as a signal.

```typescript
useControlUntouched(control: AbstractControl): Signal<boolean>
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

Returns the window's width and height as a single signal. Debounced (default 100ms). SSR-safe (defaults to `{ width: 0, height: 0 }`).

```typescript
useWindowSize(debounceMs?: number): Signal<{ width: number; height: number }>
```

**Example:**
```typescript
const windowSize = useWindowSize();
// windowSize() => { width: 1920, height: 1080 }
const { width, height } = windowSize();
```

### useMousePosition

Returns the mouse cursor's x and y position as a single signal. Throttled (default 100ms). SSR-safe (defaults to `{ x: 0, y: 0 }`).

```typescript
useMousePosition(throttleMs?: number): Signal<{ x: number; y: number }>
```

**Example:**
```typescript
const mousePosition = useMousePosition();
// mousePosition() => { x: 450, y: 300 }
const { x, y } = mousePosition();
```

### useDocumentVisibility

Returns whether the document/tab is currently visible as a signal. SSR-safe (defaults to `true`).

```typescript
useDocumentVisibility(): Signal<boolean>
```

**Example:**
```typescript
const isVisible = useDocumentVisibility();
// isVisible() => true when tab is active, false when hidden
```

### useMediaQuery

Tracks whether a CSS media query string matches. SSR-safe (defaults to `false`).

```typescript
useMediaQuery(query: string): Signal<boolean>
```

**Example:**
```typescript
const isMobile = useMediaQuery('(max-width: 768px)');
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
// isMobile() => true/false
```

### useElementBounding

Returns an element's bounding rect as a single signal. Updates on resize (via `ResizeObserver`) and optionally on window scroll/resize events. The returned signal includes an `update()` method for manual refresh.

```typescript
useElementBounding(
  elementSignal: Signal<Element | ElementRef | null | undefined>,
  config?: {
    throttleMs?: number;      // default: 100
    windowResize?: boolean;   // default: true
    windowScroll?: boolean;   // default: true
  }
): Signal<{
  x: number;
  y: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
  update: () => void;
}>
```

**Example:**
```typescript
class MyComponent {
  divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
  bounding = useElementBounding(this.divRef);

  logPosition() {
    const { x, y, width, height } = this.bounding();
    console.log(`Position: (${x}, ${y}), Size: ${width}x${height}`);
  }
}
```

### useEventListener

Attaches an event listener to a target with automatic cleanup on destroy.

```typescript
useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: UseEventListenerOptions
): void

interface UseEventListenerOptions {
  target?: Window | Document | Element | ElementRef | Signal<Element | ElementRef | null>;
  capture?: boolean;
  passive?: boolean;
  once?: boolean;
}
```

**Example:**
```typescript
// Listen to window keydown events
useEventListener('keydown', (event) => {
  console.log('Key pressed:', event.key);
});

// Listen to element click with signal target
useEventListener('click', handleClick, { target: elementRef });
```

### useLocalStorage

Creates a `WritableSignal<T>` synced with `localStorage`. Persists across page reloads. Syncs across tabs via the `storage` event. Setting to `null` removes the key. SSR-safe.

```typescript
useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: UseStorageOptions<T>
): WritableSignal<T>
```

**Example:**
```typescript
const theme = useLocalStorage('theme', 'light');
theme.set('dark'); // Persists to localStorage
```

### useSessionStorage

Creates a `WritableSignal<T>` synced with `sessionStorage`. Persists for the duration of the browser tab session. SSR-safe.

```typescript
useSessionStorage<T>(
  key: string,
  defaultValue: T,
  options?: UseStorageOptions<T>
): WritableSignal<T>
```

**Example:**
```typescript
const wizardStep = useSessionStorage('wizard-step', 1);
wizardStep.update(step => step + 1); // Persists to sessionStorage
```

## Signal Utilities

### usePreviousSignal

Returns the previous value of the input signal. Starts as `undefined`, then lags one emission behind.

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

### when

Runs a callback whenever a signal satisfies a predicate. The callback is wrapped in `untracked` to prevent extra reactive dependencies. Auto-cancels on destroy.

```typescript
when<T>(
  source: Signal<T>,
  predicate: (value: T) => boolean,
  callback: () => void
): () => void  // returns a cancel function
```

**Example:**
```typescript
const cancel = when(this.uploadStatus, (status) => status === 'complete', () => {
  this.showSuccessToast();
});
```

### whenTrue

Runs a callback each time a signal becomes truthy. Convenience wrapper around `when`.

```typescript
whenTrue(source: Signal<unknown>, callback: () => void): () => void
```

**Example:**
```typescript
whenTrue(this.isOpen, () => {
  this.dashboardCopy.set(cloneDeep(this.dashboard()));
});
```

### whenFalse

Runs a callback each time a signal becomes falsy. Convenience wrapper around `when`.

```typescript
whenFalse(source: Signal<unknown>, callback: () => void): () => void
```

**Example:**
```typescript
whenFalse(this.isOpen, () => {
  this.dashboardCopy.set(null);
});
```

## Utilities

### createSharedComposable

Creates a shared instance of a composable with reference counting. The composable is only initialized once and cleaned up when the last consumer is destroyed.

```typescript
createSharedComposable<T>(composableFn: () => { value: T; cleanup?: () => void }): () => T
```

**Example:**
```typescript
// Create a shared window size composable
const useSharedWindowSize = createSharedComposable(() => useWindowSize());

// In any component — all get the same instance
const windowSize = useSharedWindowSize();
```
