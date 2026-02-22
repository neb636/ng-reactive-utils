# Bug & Edge Case Analysis

Perform a focused bug hunt across the ng-reactive-utils source in `src/lib/`. Look for issues that will affect library consumers in production.

## 1. Logic Bugs

- **Incorrect conditionals**: Flawed if/else logic, wrong operators (`&&`/`||`)
- **Off-by-one errors**: Array indexing and loop boundaries
- **Operator precedence mistakes**: Subtle logical errors from order of operations
- **Incorrect assumptions**: Code that assumes inputs or state that may not hold
- **Missing return paths**: Functions that should return a value but don't in all branches
- **Wrong default values**: Defaults that don't match the intended or documented behavior
- **Type coercion bugs**: Unintended truthy/falsy behavior, `==` vs `===`
- **Observable operator misuse**: `switchMap` where `mergeMap` is needed, or vice versa
- **Incorrect emission timing**: Observables that emit too early or too late in the lifecycle

## 2. Memory Leaks & Resource Management

- **Unmanaged event listeners**: DOM listeners added without removal via `DestroyRef`
- **Uncleared timers**: `setTimeout` or `setInterval` not cancelled on destroy
- **Subject cleanup**: Subjects not completed in destroy callbacks
- **Growing collections**: Arrays or maps that accumulate entries without bounds
- **Circular references**: Closures or object references that prevent garbage collection

## 3. Null & Undefined Handling

- Signal initial values that may be `null` or `undefined` in ways consumers don't expect
- Missing null checks before accessing properties on potentially empty values
- Unhandled undefined route params, query params, or form control values

## 4. Angular-Specific Edge Cases

- **SSR**: Browser-only APIs (`window`, `document`, `localStorage`, `navigator`) used without `isPlatformBrowser()` guard
- **inject() context**: `inject()` calls outside of constructor or field initializer context
- **ExpressionChangedAfterChecked**: State mutations triggered during change detection
- **Destroyed component access**: Async operations writing to signals after the component is destroyed
- **Zoneless compatibility**: Anything that depends on Zone.js and will break with `provideZonelessChangeDetection()`
- **Signal timing**: Signals read before their source emits an initial value

## 5. Performance & Scalability

- **High-frequency update handling**: Rapid event emissions (resize, mousemove, scroll) without debounce/throttle
- **Unnecessary recomputation**: Reactive chains that re-run more than needed
- **Missing memoization**: Expensive calculations repeated on every signal read
- **Memory growth over time**: Resources that accumulate across many component instances

## Output Format

For each issue found:

```
### [SEVERITY] Issue Title

**File**: path/to/file.ts:line-range
**Problem**: What is wrong
**Impact**: What breaks for consumers
**Fix**: How to resolve it

// Current (buggy)
<code snippet>

// Fixed
<code snippet>
```

**Severity levels**:

- 🔴 **Critical** — crashes, data loss, or broken behavior in common scenarios
- 🟠 **High** — breaks functionality in realistic edge cases
- 🟡 **Medium** — unexpected or inconsistent behavior
- 🟢 **Low** — minor issues with limited practical impact

Focus only on real bugs that will affect users in production. Do not flag style issues or theoretical concerns with no practical impact.
