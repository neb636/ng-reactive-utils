# API Review — ng-reactive-utils
**Date:** 2026-02-22
**Reviewer:** Claude (automated review via `api-review` skill)
**Scope:** All 50 public exports in `src/public-api.ts` versus their implementations and documentation

---

## Executive Summary

The library has strong fundamentals: consistent naming patterns, good use of Angular DI, clean `toSignal` bridging, and solid documentation coverage. However, there are **3 critical bugs** that will cause incorrect behavior in production, **5 high-priority issues** that will confuse consumers or break SSR, and several medium/low concerns around naming, type safety, and API bloat that should be resolved before a v1.0 release.

---

## 1. Critical Issues

### C1. `useMediaQuery` — Sharing Is Completely Broken

**Severity: Critical**
**File:** `src/lib/composables/browser/use-media-query/use-media-query.composable.ts`
**Doc claim:** _"components with the same query string share a single instance"_

The problem: `createSharedComposable` creates a closure with its own `Map` cache. `useWindowSize` and `useMousePosition` assign the result to a **module-level constant**, so all callers share one cache. But `useMediaQuery` calls `createSharedComposable(...)` **inside the function body on every invocation**, creating a brand-new factory (and a brand-new empty cache) each time.

```ts
// CURRENT — broken: a fresh cache is created on every call
export const useMediaQuery = (query: string) => {
  const normalizedQuery = ...;
  return createSharedComposable((normalizedQuery: string) => { // ← new factory every call
    ...
  })(normalizedQuery);
};

// FIX — move factory to module scope, same pattern as useWindowSize
const useMediaQueryShared = createSharedComposable((query: string) => {
  // ... impl
  return { value: matchesSignal.asReadonly(), cleanup: ... };
});

export const useMediaQuery = (query: string) => {
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, ' ').trim();
  return useMediaQueryShared(normalizedQuery);
};
```

**Impact:** Every component calling `useMediaQuery('(max-width: 768px)')` creates its own `MediaQueryList` and event listener. Sharing never happens, and listeners accumulate until each component destroys.

---

### C2. `useDocumentVisibility` — `visibilitychange` Fires on `document`, Not `window`

**Severity: Critical**
**File:** `src/lib/composables/browser/use-document-visibility/use-document-visibility.composable.ts`

The `visibilitychange` event is dispatched on `document` per the [Page Visibility API spec](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event). The implementation registers it on `window`:

```ts
// CURRENT — wrong target
document.defaultView.addEventListener('visibilitychange', handleVisibilityChange);

// FIX — correct target
document.addEventListener('visibilitychange', handleVisibilityChange);
```

While some browsers bubble the event to `window`, this is not guaranteed and is incorrect per spec. The cleanup must also reference `document`:

```ts
cleanup: () => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
}
```

**Impact:** `useDocumentVisibility()` silently stops updating in any browser or environment where `visibilitychange` doesn't bubble to `window`. The signal becomes permanently stale.

---

### C3. `useControlTouched` / `useControlUntouched` — Observe the Wrong Observable

**Severity: Critical**
**Files:** `use-control-touched/use-control-touched.composable.ts`, `use-control-untouched/use-control-untouched.composable.ts`
**Same issue applies to:** `useFormTouched`, `useFormUntouched`

`touched`/`untouched` state is changed by calling `control.markAsTouched()` / `control.markAsUntouched()`. **These calls do not emit `statusChanges`.** The signal will therefore not update when a user blurs an input field — which is the primary use case.

```ts
// CURRENT — statusChanges does NOT fire when touched state changes
export const useControlTouched = (control: AbstractControl): Signal<boolean> => {
  return toSignal(control.statusChanges.pipe(map(() => control.touched)), {
    initialValue: control.touched,
  }) as Signal<boolean>;
};
```

In Angular 14+, `AbstractControl.events` (stabilised in Angular 17+) emits `TouchedChangeEvent`. This is the correct observable. A fallback for older support would be a `Subject` or merging `statusChanges` with `valueChanges`.

```ts
// FIX using Angular 17+ events API
import { TouchedChangeEvent } from '@angular/forms';
import { filter, map } from 'rxjs';

export const useControlTouched = (control: AbstractControl): Signal<boolean> => {
  const touched$ = control.events.pipe(
    filter((e): e is TouchedChangeEvent => e instanceof TouchedChangeEvent),
    map((e) => e.touched),
  );
  return toSignal(touched$, { initialValue: control.touched }) as Signal<boolean>;
};
```

**Impact:** `useControlTouched()` and `useFormTouched()` will always return the initial value (`false`) and never update reactively when the user interacts with the form, breaking all "show error after touch" patterns — likely the most common use case for these composables.

---

## 2. High Issues

### H1. `useSessionStorage` Docs — Wrong Source Snippet Reference

**Severity: High**
**File:** `docs/composables/browser/use-session-storage.md`, line 347

The VitePress `<<<` source snippet at the bottom references the wrong file:

```
// CURRENT — points to localStorage file, not sessionStorage
<<< @/../src/lib/composables/browser/use-local-storage/use-local-storage.composable.ts#useSessionStorage

// FIX
<<< @/../src/lib/composables/browser/use-session-storage/use-session-storage.composable.ts
```

**Impact:** The source tab in the docs will either show nothing (no `#useSessionStorage` named region), throw a VitePress build error, or show the wrong source code.

---

### H2. `useRouteParameter` Name Inconsistency

**Severity: High**
**File:** `src/lib/composables/route/use-route-param/use-route-param.composable.ts`

The exported function is named `useRouteParameter` (full word) while:
- Its file is `use-route-param.composable.ts`
- Its sibling is `useRouteParams` (abbreviated)

This creates two inconsistencies in one name:
1. File kebab-case `use-route-param` ≠ export camelCase `useRouteParameter` (would be `useRouteParam`)
2. Singular diverges from plural: `useRouteParams` → `useRouteParam` is idiomatic, not `useRouteParameter`

```ts
// CURRENT
export const useRouteParameter = <T extends string | null | undefined>(paramName: string) => { ... }

// FIX — align with file name and plural sibling
export const useRouteParam = <T extends string | null | undefined>(paramName: string) => { ... }
```

This is a **breaking rename**, so it must happen before v1.0.

---

### H3. `doc-metadata.type.ts` Should Not Be in the Public API

**Severity: High**
**File:** `src/public-api.ts`, line 63

```ts
// CURRENT
export * from './lib/types/doc-metadata.type.ts';  // "for reference app"
```

`DocMetadata`, `DocEntry`, `DocRegistry`, etc. are internal scaffolding for a reference/demo app. Shipping them in the npm bundle:
- Pollutes the library's public API surface with types consumers will never use
- Creates a semver commitment to maintain them forever
- Suggests a confused boundary between library and demo app

**Fix:** Remove this export. If the reference app needs these types, keep them in the reference app, not in the library package.

---

### H4. `syncLocalStorageEffect` — `any` in Public Types, Inconsistent Return Type, Misleading SSR Warning

**Severity: High**
**File:** `src/lib/effects/sync-local-storage/sync-local-storage.effect.ts`

Three issues in one function:

**4a. `any` in public config type:**
```ts
// CURRENT
export type SyncLocalStorageEffectConfig = {
  signal: Signal<any>;          // ← any
  serialize?: (value: any) => string;  // ← any
};

// FIX — make generic
export type SyncLocalStorageEffectConfig<T> = {
  signal: Signal<T>;
  serialize?: (value: T) => string;
};
export const syncLocalStorageEffect = <T>(config: SyncLocalStorageEffectConfig<T>) => { ... };
```

**4b. Inconsistent return type:** The function returns `void` when storage is unavailable, or `EffectRef` when it runs successfully. Callers cannot type the return value, and cannot manually destroy the effect.

```ts
// FIX — always return EffectRef (or a no-op wrapper)
export const syncLocalStorageEffect = <T>(config: SyncLocalStorageEffectConfig<T>): EffectRef => {
  const storage = document.defaultView?.localStorage;
  if (!storage) {
    return { destroy: () => {} }; // no-op EffectRef
  }
  return effect(() => { ... });
};
```

**4c. Noisy SSR warning:** `console.warn('localStorage is not available')` fires on every SSR render. This is expected behaviour in SSR — it should be silenced by checking `isPlatformBrowser` first.

---

### H5. `useRouteData` Uses `any` in Generic Constraint

**Severity: High**
**File:** `src/lib/composables/route/use-route-data/use-route-data.composable.ts`

```ts
// CURRENT
export const useRouteData = <T extends { [key: string]: any }>() => { ... };

// FIX
export const useRouteData = <T extends { [key: string]: unknown }>() => { ... };
```

The library's own CLAUDE.md states: _"Never use `any` — use `unknown` or a proper generic type."_ This is a public generic constraint that consumers will see in their IDE.

---

## 3. Medium Issues

### M1. `useControlDirty` / `useControlPristine` Miss Programmatic State Changes

**Severity: Medium**
**Files:** `use-control-dirty.composable.ts`, `use-control-pristine.composable.ts` (and form equivalents)

Both observe `valueChanges` and read `control.dirty` / `control.pristine` at emission time. This works for user input but misses calls to `control.markAsDirty()` / `control.markAsPristine()` which do not trigger `valueChanges`. The fix is the same as C3: use `control.events` filtered to `PristineChangeEvent`.

---

### M2. `useElementBounding` Uses Bare `window` Global

**Severity: Medium**
**File:** `src/lib/composables/browser/use-element-bounding/use-element-bounding.composable.ts`, lines 155, 158, 172, 175

```ts
// CURRENT — uses global window
window.addEventListener('resize', throttledUpdate);
window.addEventListener('scroll', throttledUpdate, true);

// FIX — consistent with rest of codebase
const doc = inject(DOCUMENT);
// ...
doc.defaultView?.addEventListener('resize', throttledUpdate);
doc.defaultView?.addEventListener('scroll', throttledUpdate, true);
```

All other browser composables use `inject(DOCUMENT).defaultView` to support custom test environments. `useElementBounding` is the only outlier using the global `window`.

---

### M3. `useStorage` Internal Uses `any`

**Severity: Medium**
**File:** `src/lib/composables/browser/use-storage-base/use-storage-base.composable.ts`

```ts
const defaultSerializer: StorageSerializer<any> = {  // ← any
  read: (value: string) => JSON.parse(value),
  write: (value: any) => JSON.stringify(value),   // ← any
};
```

Even as an internal file this sets a bad precedent. A `StorageSerializer<unknown>` with appropriate casts inside is correct here.

---

### M4. Redundant API Surface — Negation Composables

**Severity: Medium**

The following composables exist solely as the boolean negation of their paired counterpart:

| Redundant | Equivalent to |
|-----------|---------------|
| `useControlPristine` | `computed(() => !useControlDirty(control)())` |
| `useControlUntouched` | `computed(() => !useControlTouched(control)())` |
| `useFormPristine` | `computed(() => !useFormDirty(form)())` |
| `useFormUntouched` | `computed(() => !useFormTouched(form)())` |

These 4 + their 4 docs pages are dead weight when `useControlState` / `useFormState` already return all properties including the negations. More API surface means more to maintain, more to document, and a steeper learning curve.

**Recommendation:** Remove `useControlPristine`, `useControlUntouched`, `useFormPristine`, and `useFormUntouched` as standalone exports before v1.0. Keep them in the `State` aggregate objects. If consumers need the inverse standalone, a single-line `computed()` is the idiomatic Angular solution.

---

### M5. `useElementBounding` — Mixing Imperative `update()` Into Signal Value

**Severity: Medium**
**File:** `src/lib/composables/browser/use-element-bounding/use-element-bounding.composable.ts`

```ts
export type ElementBounding = {
  x: number; y: number; top: number; right: number;
  bottom: number; left: number; width: number; height: number;
  update: () => void;  // ← imperative fn embedded in the data object
};
```

Embedding a function inside the signal's data violates the "value = data" contract and creates a mutation surface inside what should be a pure data snapshot. It's also invisible — consumers won't discover `bounding().update()` from the type alone.

**Alternative:** Return a plain object from the composable:
```ts
// FIX — separate concerns
export function useElementBounding(elementSignal, config?): {
  bounding: Signal<ElementBoundingRect>; // pure data, no update fn
  update: () => void;
}
```

This does change the call site (`bounding().width` → `bounding.bounding().width` or destructured), which is worth resolving before v1.0.

---

### M6. Missing Required "When to Use" Doc Sections

**Severity: Medium**
**Files affected:** `use-window-size.md`, `use-mouse-position.md`, `use-document-visibility.md`, `use-debounced-signal.md`

CLAUDE.md mandates a "When to Use" section in every doc page. These pages are missing it. The section is important for consumers evaluating whether to use a composable vs an Angular alternative.

---

### M7. `useDocumentVisibility` Doc Has Typo and Thin Coverage

**Severity: Medium**
**File:** `docs/composables/browser/use-document-visibility.md`

> _"only there is only shared instance at a time"_

Should read: _"only one shared instance at a time"_

The doc is also the thinnest in the library (9 lines of content after the example). It lacks: a parameters table (to show there are none), when to use guidance, and what SSR initial value is returned (`true`).

---

## 4. Low Issues

### L1. `syncQueryParamsEffect` — Navigation Fires Immediately on Init

**Severity: Low**
**File:** `src/lib/effects/sync-query-params/sync-query-params.effect.ts`

Angular's `effect()` runs synchronously on first execution. This means `syncQueryParamsEffect` immediately calls `router.navigate()` when the component is created, even if query params haven't changed. This adds a spurious navigation to browser history on every component mount (unless `replaceUrl: true` is set).

The docs do not mention this behavior. At minimum, it should be called out in the Notes section. Ideally, the initial run should be skipped if the current URL already matches.

---

### L2. `useRouteParams` / `useRouteQueryParams` Return Mutable Signals

**Severity: Low**
**Files:** `use-route-params.composable.ts`, `use-route-query-params.composable.ts`

`toSignal()` returns `Signal<T>` (already readonly). But the composables cast it with `as Signal<T>` — which is correct. However, neither calls `.asReadonly()` explicitly. This is consistent with the underlying `toSignal` contract, but is worth noting as the explicit `.asReadonly()` pattern used elsewhere in the library is absent here.

---

### L3. `useEventListener` Docs Oversimplify Handler Type

**Severity: Low**
**File:** `docs/composables/browser/use-event-listener.md`

The parameter table lists `handler` type as `(event: Event) => void`, but the implementation provides typed overloads for `WindowEventMap[K]`, `DocumentEventMap[K]`, and `HTMLElementEventMap[K]`. The docs should reflect that the handler receives a typed event object when the event name is a known key.

---

### L4. `StorageSerializer` and `UseStorageOptions` Exported Types Have No Doc Page

**Severity: Low**

`StorageSerializer<T>` and `UseStorageOptions<T>` are public exports (via `use-storage-base/types`). They appear in the `useLocalStorage` and `useSessionStorage` parameter tables inline, but have no standalone reference page. As a library grows, standalone type reference pages become valuable for IDE-hover-linking.

---

## 5. Documentation Accuracy Summary

| Export | Doc Exists | Issues |
|--------|-----------|--------|
| `useRouteParameter` | ✅ | Named `useRouteParameter` — should be `useRouteParam` (H2) |
| `useRouteParams` | ✅ | No parameters table (takes no args — should say so explicitly) |
| `useRouteQueryParam` | ✅ | OK |
| `useRouteQueryParams` | ✅ | No parameters table |
| `useRouteData` | ✅ | `any` in generic constraint (H5) |
| `useRouteFragment` | ✅ | OK |
| `useFormState` | ✅ | OK |
| `useFormValue` | ✅ | OK |
| `useFormValid` | ✅ | OK |
| `useFormPending` | ✅ | OK |
| `useFormDisabled` | ✅ | OK |
| `useFormDirty` | ✅ | Misses `markAsDirty()` (M1) |
| `useFormPristine` | ✅ | Redundant export (M4); misses `markAsPristine()` (M1) |
| `useFormTouched` | ✅ | Wrong observable — statusChanges (C3) |
| `useFormUntouched` | ✅ | Wrong observable — statusChanges (C3); redundant (M4) |
| `useFormErrors` | ✅ | OK |
| `useFormStatus` | ✅ | OK |
| `useControlState` | ✅ | OK |
| `useControlValue` | ✅ | OK |
| `useControlValid` | ✅ | OK |
| `useControlPending` | ✅ | OK |
| `useControlErrors` | ✅ | OK |
| `useControlTouched` | ✅ | Wrong observable — statusChanges (**C3**) |
| `useControlUntouched` | ✅ | Wrong observable — statusChanges (**C3**); redundant (M4) |
| `useControlDirty` | ✅ | Misses `markAsDirty()` (M1) |
| `useControlPristine` | ✅ | Redundant (M4); misses `markAsPristine()` (M1) |
| `useControlDisabled` | ✅ | OK |
| `useControlStatus` | ✅ | OK |
| `useDocumentVisibility` | ✅ | Wrong event target (**C2**); thin docs; typo (M7) |
| `useElementBounding` | ✅ | Bare `window` (M2); `update()` in value type (M5) |
| `useWindowSize` | ✅ | Missing "When to Use" (M6) |
| `useMousePosition` | ✅ | Missing "When to Use" (M6) |
| `useMediaQuery` | ✅ | Sharing broken (**C1**); doc claim is false |
| `useEventListener` | ✅ | Handler type oversimplified (L3) |
| `StorageSerializer` | ✅ (inline) | No standalone type doc page (L4) |
| `UseStorageOptions` | ✅ (inline) | No standalone type doc page (L4) |
| `useLocalStorage` | ✅ | OK |
| `useSessionStorage` | ✅ | Wrong source snippet reference (**H1**) |
| `useDebouncedSignal` | ✅ | Missing "When to Use" (M6) |
| `usePreviousSignal` | ✅ | OK |
| `useThrottledSignal` | ✅ | OK |
| `syncQueryParamsEffect` | ✅ | Init navigation not documented (L1) |
| `syncLocalStorageEffect` | ✅ | `any` types, return type, SSR warning (**H4**) |
| `createSharedComposable` | ✅ | OK |
| `DocMetadata` / `DocEntry` / `DocRegistry` | ✅ (N/A) | Should not be in public API (**H3**) |

**APIs with no doc page:** None — full coverage achieved.
**Doc pages with no matching export:** None.

---

## 6. API Design & Consistency Observations

### Naming — Mostly Good, One Exception
All composables follow `use<Feature>`, all effects follow `sync<Feature>Effect`, the util follows `create<Feature>`. The sole outlier is `useRouteParameter` → should be `useRouteParam` (H2).

### Readonly Signals
`toSignal()` already returns readonly signals. Storage composables correctly return `WritableSignal<T>` (intentional — consumers need to write). `useElementBounding` returns `.asReadonly()` ✓. All browser composables via `createSharedComposable` return `.asReadonly()` ✓. No violations found.

### SSR Safety
All browser composables guard with `isPlatformBrowser()` ✓. Exception: `useElementBounding` uses bare `window` (M2). `syncLocalStorageEffect` guards but emits a warning on server (H4c).

### Cleanup
All event listeners are cleaned up via `DestroyRef.onDestroy()` or `createSharedComposable`'s ref counting. Lodash debounce/throttle timers are cancelled on destroy ✓. The `useElementBounding` `ResizeObserver` is disconnected ✓.

### Composability
The route, form, and control composables compose well — `useControlState` internally delegates to the individual composables. `createSharedComposable` is a solid primitive. The `useElementBounding` + `useWindowSize` combination is natural. The `syncQueryParamsEffect` + `useRouteQueryParams` read/write pairing is a clear and idiomatic pattern.

### Angular Patterns
`inject()` is called correctly in constructors/field initializers throughout ✓. `effect()` is used for reactive side effects ✓. `toSignal()` bridges Observables ✓. `DestroyRef` is used for cleanup ✓.

---

## 7. Prioritized Action Plan

| Priority | Issue | Effort |
|----------|-------|--------|
| 🔴 1 | C3: Fix `useControlTouched`/`useFormTouched` — use `control.events` | Medium |
| 🔴 2 | C2: Fix `useDocumentVisibility` — attach to `document`, not `window` | Small |
| 🔴 3 | C1: Fix `useMediaQuery` sharing — hoist factory to module scope | Small |
| 🟠 4 | H1: Fix `useSessionStorage` source snippet reference | Trivial |
| 🟠 5 | H2: Rename `useRouteParameter` → `useRouteParam` | Small |
| 🟠 6 | H3: Remove `doc-metadata.type.ts` from `public-api.ts` | Trivial |
| 🟠 7 | H4: Make `syncLocalStorageEffect` generic, fix return type, silence SSR warning | Small |
| 🟠 8 | H5: Replace `any` in `useRouteData` generic constraint | Trivial |
| 🟡 9 | M1: Fix `useControlDirty`/`useFormDirty` — use `control.events` | Medium |
| 🟡 10 | M2: Replace bare `window` in `useElementBounding` | Small |
| 🟡 11 | M4: Remove `useControlPristine`, `useControlUntouched`, `useFormPristine`, `useFormUntouched` as standalone exports | Small |
| 🟡 12 | M5: Refactor `ElementBounding.update()` out of signal value | Medium |
| 🟡 13 | M6: Add "When to Use" sections to 4 docs pages | Small |
| 🟡 14 | M7: Fix `useDocumentVisibility` doc typo + expand doc | Trivial |
| 🟢 15 | L1: Document init-navigation behavior in `syncQueryParamsEffect` | Trivial |
| 🟢 16 | L3: Improve handler type docs in `useEventListener` | Trivial |
| 🟢 17 | L4: Add standalone type reference pages for `StorageSerializer`, `UseStorageOptions` | Small |
