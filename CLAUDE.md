# ng-reactive-utils — Claude Code Instructions

## Project Overview

**ng-reactive-utils** is an open-source collection of signal-based reactive utilities for modern Angular (v20+). It follows the design philosophy of VueUse, usehooks-ts, and Solid Primitives — small, composable, tree-shakeable functions that convert Observable-based Angular APIs into reactive signals.

**Core principle**: Convert Observable-based APIs to Signals for cleaner, more reactive code. All composables return signals that automatically update when underlying data changes.

This is a published npm library used by other developers. Code quality, API design, documentation accuracy, and human readability are the highest priorities.

---

## Tech Stack

- **Angular 20+** (peer dependency) — zoneless change detection
- **RxJS 7.8+** (peer dependency)
- **TypeScript 5.9** — strict mode
- **Vitest 3** + Jasmine — unit tests
- **VitePress** — documentation site
- **ng-packagr** — library build
- **lodash-es** — utility functions (debounce, throttle, etc.)
- **ESLint + Prettier** — linting/formatting (printWidth: 100, singleQuote: true)

---

## Coding Standards

### Human Readability is the Top Priority

- Write code that reads like prose. A future developer should understand what a function does without needing comments.
- **Avoid terse, abbreviated, or cryptic naming.** Well-named variables and functions are more informative than comments.
- Prefer clarity over brevity in every naming decision.

### Naming Conventions

| Type | Pattern | Examples |
|------|---------|---------|
| Composables | `use<Feature>` | `useControlValue`, `useWindowSize`, `useRouteParam` |
| Effects | `sync<Feature>Effect` | `syncLocalStorageEffect`, `syncQueryParamsEffect` |
| Utils/factories | `create<Feature>` | `createSharedComposable` |
| Internal helpers | descriptive camelCase | `resolveTarget`, `getInitialValue` |
| Filenames | kebab-case with type suffix | `use-control-value.composable.ts`, `sync-local-storage.effect.ts` |
| Spec files | co-located, same name | `use-control-value.composable.spec.ts` |

### Function Parameters

- **3 or more parameters → use a configuration object**, not individual positional params.
  - `doSomething({ key, signal, options })` not `doSomething(key, signal, options)`
- Configuration object properties use camelCase.
- Extend standard browser/Angular option interfaces where applicable.

### TypeScript

- Strict mode is enabled — no `any`, no implicit types.
- Use `unknown` instead of `any` when a type is uncertain.
- Prefer type inference when the type is obvious from context.
- Use generics for type-safe composable returns: `Signal<T>`.
- Return `readonly` signals (`.asReadonly()`) to prevent accidental mutations at call sites.

---

## Angular Patterns

### Signal-First

All public APIs return signals, never observables. Use `toSignal()` from `@angular/core/rxjs-interop` to bridge Observable→Signal.

### Automatic Cleanup

Always clean up subscriptions, event listeners, and timers via `DestroyRef.onDestroy()`. Never rely on manual cleanup from the consumer.

```typescript
const destroyRef = inject(DestroyRef);
destroyRef.onDestroy(() => cleanup());
```

### SSR Safety

Check `isPlatformBrowser(platformId)` before accessing browser-only APIs (`window`, `document`, `localStorage`, `navigator`).

### Effect-Based Reactivity

Use Angular's `effect()` for reactive side effects. Do not use RxJS operators when a signal-based approach is available in this library.

### inject() Context

Always call `inject()` inside a constructor, field initializer, or within an injection context. Never call it in a method body.

---

## Library Structure

```
src/lib/
├── composables/
│   ├── browser/       # useEventListener, useWindowSize, useMousePosition, etc.
│   ├── forms/         # useFormValue, useControlValue, etc.
│   ├── route/         # useRouteParam, useRouteQueryParam, etc.
│   └── general/       # useDebouncedSignal, useThrottledSignal, usePreviousSignal
├── effects/           # syncLocalStorageEffect, syncQueryParamsEffect
├── utils/             # createSharedComposable
└── types/             # Shared TypeScript types
```

All public exports go through `src/public-api.ts`.

---

## Anti-Patterns — Never Do These

- **Never** use RxJS `debounceTime` — use `useDebouncedSignal` instead.
- **Never** use RxJS `throttleTime` — use `useThrottledSignal` instead.
- **Never** subscribe to `ActivatedRoute.params` — use `useRouteParam` / `useRouteParams`.
- **Never** subscribe to `ActivatedRoute.queryParams` — use `useRouteQueryParam` / `useRouteQueryParams`.
- **Never** subscribe to `FormControl.valueChanges` — use `useControlValue`.
- **Never** subscribe to `FormControl.statusChanges` — use `useControlStatus`.
- **Never** subscribe to `FormGroup.valueChanges` — use `useFormValue`.
- **Never** manually track previous values — use `usePreviousSignal`.
- **Never** manually subscribe to window resize events — use `useWindowSize`.
- **Never** manually subscribe to mouse events — use `useMousePosition`.
- **Never** use `any` — use `unknown` or a proper generic type.
- **Never** expose mutable signals — return `.asReadonly()`.
- **Never** skip writing documentation for a new function (see below).

---

## Documentation Requirements — Mandatory

Every new composable, effect, or utility **must** have a corresponding documentation file. A function without docs is an incomplete task.

### File Location

| Type | Path |
|------|------|
| Composable | `docs/composables/<category>/<function-name>.md` |
| Effect | `docs/effects/<function-name>.md` |
| Util | `docs/utils/<function-name>.md` |

### Documentation Structure

1. **Title** — function name as H1
2. **Brief description** — one or two sentences: what it does and why it exists
3. **When to Use** — context and motivation, including what problem it solves
4. **Usage Examples** — multiple real-world code blocks
5. **Parameters** — table with name, type, default, and description
6. **Returns** — clear description of the return type and shape
7. **Notes** — edge cases, SSR behavior, performance considerations, lifecycle
8. **Source** — `<<< @/../src/lib/...` VitePress snippet reference

Use MDN links when documenting wrappers around browser APIs.

---

## Testing

- Co-locate spec files next to source: `use-foo.composable.spec.ts`
- Use Angular `TestBed` with `provideZonelessChangeDetection()`
- Test: initial values, reactive updates, edge cases (null, empty, arrays), and cleanup
- Use Vitest with Jasmine assertions

---

## Workflow Notes

- Before adding a new utility, search the codebase to confirm it doesn't already exist.
- Before reaching for an external library or RxJS operator, check if this library already provides an equivalent.
- `lodash-es` is available for utility functions (debounce, throttle, etc.) — it is tree-shakeable.
- When reviewing or editing docs, always verify the docs match the actual implementation signatures exactly.
