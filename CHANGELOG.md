# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
