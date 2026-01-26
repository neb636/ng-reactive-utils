# Bug & Edge Case Analysis

Please perform a focused bug hunt for this NG Reactive Utils library in `/projects/ng-reactive-utils/src`:

## 1. Logic Bugs

- **Incorrect conditionals**: Check for flawed if/else logic or wrong operators (&&/||)
- **Off-by-one errors**: Verify array indexing and loop boundaries
- **Wrong operator precedence**: Look for logical mistakes due to operator order
- **Incorrect assumptions**: Identify code that assumes inputs or state that may not be true
- **Missing return statements**: Check for functions that should return values but don't in all paths
- **Incorrect default values**: Verify defaults actually match intended behavior
- **Type coercion bugs**: Look for unexpected == vs === or truthy/falsy issues
- **Observable operator misuse**: Check for switchMap where mergeMap needed (or vice versa)
- **Incorrect emission timing**: Verify observables emit at the right time in the lifecycle

## 2. Memory Leaks & Resource Management

- **Unsubscribed observables**: Check for missing unsubscribe/takeUntil in components
- **Subject cleanup**: Verify Subjects are completed in ngOnDestroy
- **Event listener removal**: Ensure DOM event listeners are cleaned up
- **Timer cleanup**: Check setTimeout/setInterval are cleared
- **Circular references**: Identify closures or references preventing garbage collection

## 3. Null/Undefined Handling (Uncaught Exceptions)

## 4. Angular-Specific Edge Cases

- **OnPush change detection**: Verify mutations trigger detection correctly
- **SSR compatibility**: Check for browser-only APIs without platform checks (window, document, localStorage)
- **inject() outside context**: Look for inject() calls not in constructor or field initializers
- **ExpressionChangedAfterItHasBeenChecked**: Identify state changes during change detection
- **Destroyed component access**: Check for async operations updating destroyed components
- **Zone.js issues**: Look for operations that prevent zone stabilization or need runOutsideAngular

## 5. Performance & Scalability

- **N² algorithms**: Identify nested loops or inefficient operations
- **Missing memoization**: Check for repeated expensive calculations
- **Unnecessary subscriptions**: Look for subscribing when async pipe would work
- **Large array operations**: Test behavior with 1000+ items
- **High-frequency updates**: Check handling of rapid emissions (100+/sec)
- **Memory growth over time**: Identify arrays/objects that grow without bounds

## Output Format

For each issue found, provide:

```
### [SEVERITY] Issue Title

**File**: Path and line numbers
**Problem**: What's wrong
**Impact**: What breaks
**Fix**: How to resolve it

// Current (buggy)
[code snippet]

// Fixed
[code snippet]
```

**Severity**: 
- 🔴 **Critical**: Crashes, data loss, common scenarios
- 🟠 **High**: Breaks functionality in edge cases
- 🟡 **Medium**: Unexpected behavior
- 🟢 **Low**: Minor issues

Focus on real bugs that will affect users in production.