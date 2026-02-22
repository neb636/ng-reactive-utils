# Library API Review

Perform a thorough review of the ng-reactive-utils library. Check every public API in `src/lib/` against its documentation in `docs/`.

## 1. Documentation Accuracy

For each public export in `src/public-api.ts`:

- Compare function signatures, parameter names, parameter types, defaults, and return types between the source implementation and the corresponding docs page.
- Flag any mismatches in:
  - Parameter names or types
  - Default values
  - Return type or shape
  - Behavior description or usage examples
- List any public APIs that are missing documentation entirely.
- List any docs pages that document APIs no longer in the public export.

## 2. API Design & Consistency

- **Naming**: Are composables consistently `use<Feature>`? Effects `sync<Feature>Effect`? Utils `create<Feature>`?
- **Type safety**: Are generics used correctly? Is `any` present anywhere it shouldn't be?
- **Readonly signals**: Do all composables return `.asReadonly()` signals?
- **Cleanup**: Are all event listeners, timers, and subscriptions cleaned up via `DestroyRef.onDestroy()`?
- **SSR safety**: Are browser-only APIs guarded with `isPlatformBrowser()`?
- **Parameter style**: Do functions with 3+ params use a config object rather than individual positional args?
- **Composability**: Do APIs compose well together? Are there obvious gaps?
- **Consistency with Angular patterns**: Do implementations follow modern Angular (inject, effect, toSignal, DestroyRef)?

## 3. Output

Save the report to `reports/api-review-<YYYY-MM-DD>.md`.

For each section, include:

1. **Summary** — brief overview of findings
2. **Issues Found** — each issue with severity: Critical / High / Medium / Low
3. **Recommendations** — actionable steps to resolve each issue
4. **Examples** — code snippets showing the problem and the suggested fix

Prioritize issues by their impact on library consumers.
