# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1-beta.0] - 2026-03-09

### Added

- `useEventListener()` — attach event listeners to any target (element, window, document, or signal-wrapped element) with automatic cleanup
- `useLocalStorage()` — read/write a localStorage key as a reactive signal, synchronized across tabs via storage events
- `useSessionStorage()` — read/write a sessionStorage key as a reactive signal
- `useMediaQuery()` — track a CSS media query as a boolean signal, with query-level sharing to avoid duplicate listeners
- `when()` — run a callback reactively whenever a signal condition is truthy (declarative side effects)
- `whenTrue()` — convenience wrapper around `when()` that fires when a boolean signal becomes `true`
- `whenFalse()` — convenience wrapper around `when()` that fires when a boolean signal becomes `false`

### Changed

- `useEventListener()` now returns a manual cleanup function, allowing listeners to be removed before component destruction
- `useRouteParameter()` renamed to `useRouteParam()` for consistency with the file name and its plural sibling `useRouteParams()`
- `useDocumentVisibility()` now correctly attaches `visibilitychange` to `document` instead of `window`, per the Page Visibility API spec
- `useControlTouched()`, `useControlUntouched()`, `useFormTouched()`, and `useFormUntouched()` now listen to `control.events` filtered to `TouchedChangeEvent` instead of `statusChanges`, so they update correctly when a user blurs a field or `markAsTouched()` / `markAsUntouched()` is called programmatically
- `useMediaQuery()` now hoists the shared composable factory to module scope so the query-level cache is truly shared across all call sites

### Removed

- `syncLocalStorageEffect()` and `syncQueryParamsEffect()` — removed; composables now handle reactive side effects internally
- `useDebouncedSignal()` and `useThrottledSignal()` — removed in preparation for the v1.0 API surface review
- Internal types `DocMetadata`, `DocEntry`, and `DocRegistry` removed from the public API (they were reference-app implementation details)

### Fixed

- `useControlTouched` / `useFormTouched` signals now correctly update when controls are touched or untouched
- `useDocumentVisibility` now fires reliably across all browsers by targeting the correct event source

## [0.1.0-beta.1] - 2026-01-27

### Added

- AI integration support through Cursor Skills in `skills/ng-reactive-utils/`
- Comprehensive API reference for AI assistants

### Changed

- Enhanced documentation with improved examples and usage patterns
- Improved AI discoverability of library features and APIs

## [0.1.0-beta.0] - 2026-01-27

### Added

#### Browser Composables

- `useDocumentVisibility()` - Track document visibility state
- `useElementBounding()` - Observe element position and size
- `useMousePosition()` - Track mouse coordinates
- `useWindowSize()` - Monitor window dimensions

#### General Composables

- `useDebouncedSignal()` - Debounce signal changes
- `usePreviousSignal()` - Track previous signal values
- `useThrottledSignal()` - Throttle signal updates

#### Router Composables

- `useRouteData()` - Route data as a signal
- `useRouteFragment()` - URL fragment as a signal
- `useRouteParameter()` - Single route parameter
- `useRouteParams()` - All route parameters as a signal
- `useRouteQueryParam()` - Single query parameter
- `useRouteQueryParams()` - All query parameters as a signal

#### Form Composables

- `useFormState()` - Complete form state object
- `useFormValue()` - Form value signal
- `useFormValid()` - Form validity signal
- `useFormPending()` - Form pending state signal
- `useFormDisabled()` - Form disabled state signal
- `useFormDirty()` - Form dirty state signal
- `useFormPristine()` - Form pristine state signal
- `useFormTouched()` - Form touched state signal
- `useFormUntouched()` - Form untouched state signal
- `useFormErrors()` - Form validation errors signal
- `useFormStatus()` - Form status signal

#### Control Composables

- `useControlState()` - Complete control state object
- `useControlValue()` - Control value signal
- `useControlValid()` - Control validity signal
- `useControlPending()` - Control pending state signal
- `useControlErrors()` - Control validation errors signal
- `useControlTouched()` - Control touched state signal
- `useControlUntouched()` - Control untouched state signal
- `useControlDirty()` - Control dirty state signal
- `useControlPristine()` - Control pristine state signal
- `useControlDisabled()` - Control disabled state signal
- `useControlStatus()` - Control status signal

#### Effects

- `syncLocalStorageEffect()` - Sync signals with localStorage
- `syncQueryParamsEffect()` - Sync signals with URL query parameters

#### Utilities

- `createSharedComposable()` - Convert composables to shared instances with reference counting

### Notes

This is the initial beta release of ng-reactive-utils. The library provides a collection of small,
reusable reactive building blocks for modern Angular (v20+) applications.

All APIs are considered stable for the beta period, but may undergo minor changes based on community
feedback before the 1.0.0 release.
