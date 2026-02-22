# Add New Composable

Guide for adding a new composable to ng-reactive-utils. The user will describe what the composable should do. Follow every step — a composable without tests and docs is incomplete.

## Step 1: Search First

Before writing any code, search the codebase to confirm no equivalent utility already exists:
- Search `src/lib/` for similar function names or patterns
- Check `src/public-api.ts` for existing exports
- Consider whether an existing composable can be extended or composed instead

## Step 2: Determine Category

Place the composable in the appropriate subdirectory:

| Category | Path | When to use |
|----------|------|-------------|
| `browser` | `src/lib/composables/browser/` | Wraps a browser API (DOM, window, navigator, etc.) |
| `forms` | `src/lib/composables/forms/` | Wraps Angular Reactive Forms APIs |
| `route` | `src/lib/composables/route/` | Wraps Angular Router / ActivatedRoute |
| `general` | `src/lib/composables/general/` | Signal transformation utilities |

## Step 3: Implement the Composable

Follow these patterns:

**File naming**: `use-<feature-name>.composable.ts` (kebab-case)

**Function naming**: `use<FeatureName>` (camelCase, `use` prefix)

**Signal return**: Always return a `Signal<T>` or an object of `Signal<T>` values. Always use `.asReadonly()`.

**Cleanup**: Always register cleanup via `DestroyRef.onDestroy()`. Never leave event listeners or timers without cleanup.

**SSR safety**: Guard all browser-only APIs (`window`, `document`, `localStorage`, `navigator`) with `isPlatformBrowser(platformId)`.

**Parameters**: If the composable takes 3 or more parameters, use a configuration object.

**Types**: No `any`. Use generics for type-safe return values. Prefer type inference over explicit annotations.

**Minimal example structure**:

```typescript
import { DestroyRef, inject, signal } from '@angular/core';

export function use<FeatureName><T>(...): Signal<T> {
  const destroyRef = inject(DestroyRef);
  const result = signal<T>(initialValue);

  // reactive logic here

  destroyRef.onDestroy(() => {
    // cleanup
  });

  return result.asReadonly();
}
```

## Step 4: Export from Public API

Add the export to `src/public-api.ts`:

```typescript
export { use<FeatureName> } from './lib/composables/<category>/use-<feature-name>.composable';
```

## Step 5: Write Tests

Create `use-<feature-name>.composable.spec.ts` in the same directory.

Test cases must cover:
- Initial signal value
- Reactive updates when the underlying source changes
- Edge cases: null, undefined, empty values, rapid updates
- Cleanup — verify no memory leaks or lingering listeners after destroy
- SSR behavior if browser APIs are involved

Use `TestBed` with `provideZonelessChangeDetection()`.

## Step 6: Write Documentation

Create `docs/composables/<category>/use-<feature-name>.md`.

The documentation file must include:

1. `# use<FeatureName>` — title
2. One-sentence description
3. **When to Use** section — what problem this solves and when to reach for it
4. **Usage Examples** — at least two real-world code examples with `@Component` context
5. **Parameters** table — name, type, default, description
6. **Returns** — description of the signal type and shape
7. **Notes** — SSR behavior, lifecycle, performance, edge cases
8. **Source** reference:
   ```
   <<< @/../src/lib/composables/<category>/use-<feature-name>.composable.ts
   ```

## Step 7: Verify

- [ ] Composable follows naming conventions
- [ ] Returns a readonly signal
- [ ] Cleanup registered via `DestroyRef`
- [ ] SSR safe (if using browser APIs)
- [ ] Exported from `public-api.ts`
- [ ] Tests written and passing
- [ ] Documentation written and accurate
