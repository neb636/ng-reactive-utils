# AI Integration

Angular Reactive Primitives provides several ways to help AI coding assistants understand and use the library effectively.

## llms.txt

This documentation site implements the [llms.txt standard](https://llmstxt.org/) - an open specification that helps LLMs access documentation in a structured way.

### Available Endpoints

When this documentation is deployed, the following files are automatically generated:

- `/llms.txt` - A manifest with links to all documentation pages
- `/llms-full.txt` - A single file containing all documentation content

AI tools that support llms.txt can use these endpoints to pull the complete library documentation into their context.

### Using with AI Tools

If your AI tool supports fetching external documentation, you can point it to:

```
https://your-docs-domain.com/llms-full.txt
```

This provides the AI with complete, up-to-date documentation about all composables, effects, and utilities.

## Cursor IDE Rules

For [Cursor IDE](https://cursor.com) users, we provide a rules file that teaches Cursor's AI about angular-reactive-primitives patterns and best practices.

### Installation

1. Copy the `cursor-rules.mdc` file from the package root to your project's `.cursor/rules/` directory:

```bash
# From your project root
mkdir -p .cursor/rules
cp node_modules/angular-reactive-primitives/cursor-rules.mdc .cursor/rules/angular-reactive-primitives.mdc
```

2. Or manually create `.cursor/rules/angular-reactive-primitives.mdc` with the content from [our repository](https://github.com/neb636/angular-reactive-primitives/blob/main/cursor-rules.mdc).

### What the Rules Include

The Cursor rules file teaches the AI:

- **When to use each composable** - Maps Angular patterns to the appropriate utility
- **Anti-patterns to avoid** - Prevents the AI from using RxJS when a signal-based solution exists
- **Import patterns** - Correct import syntax
- **Usage examples** - Real-world code patterns

### Example Prompts After Installation

Once the rules are installed, you can use prompts like:

- "Add form validation status display to this component"
- "Track the current route parameter"
- "Add debounced search to this input"
- "Persist this setting to localStorage"

The AI will automatically suggest angular-reactive-primitives solutions.

## Context7

[Context7](https://context7.com) is an MCP server that provides AI tools with real-time access to library documentation.

### Using Context7

If you have Context7 configured in your AI tool, you can use:

```
use context7
```

in your prompts to pull angular-reactive-primitives documentation directly into the conversation.

## Manual Integration

For other AI tools or custom setups, you can add the following context to your system prompts or rules:

```markdown
# angular-reactive-primitives

A collection of signal-based reactive utilities for modern Angular (v20+).

## Key Patterns

### Reactive Forms → Use Form/Control Signals
Instead of subscribing to valueChanges or statusChanges:
- useFormValue(form) - Form value as a signal
- useFormValid(form) - Form validity as a signal  
- useControlValue(control) - Control value as a signal
- useControlErrors(control) - Control errors as a signal

### ActivatedRoute → Use Route Signals
Instead of subscribing to route observables:
- useRouteParam('id') - Route parameter as a signal
- useRouteQueryParam('search') - Query parameter as a signal
- useRouteParams() - All route params as a signal

### Browser APIs → Use Browser Signals
- useWindowSize() - Window dimensions as signals
- useMousePosition() - Mouse coordinates as signals
- useDocumentVisibility() - Tab visibility as a signal

### Signal Utilities
- useDebouncedSignal(signal, ms) - Debounced value
- useThrottledSignal(signal, ms) - Throttled value
- usePreviousSignal(signal) - Previous value

### Effects
- syncLocalStorageEffect(key, signal) - Persist to localStorage
- syncQueryParamsEffect({ param: signal }) - Sync with URL

## Import
import { useFormValid, useRouteParam } from 'angular-reactive-primitives';
```

## API Reference for AI

Here's a quick reference of all available functions:

### Browser Composables
| Function | Description |
|----------|-------------|
| `useDocumentVisibility()` | Returns a signal tracking document visibility state |
| `useElementBounding(elementRef)` | Returns signals for element position and size |
| `useMousePosition()` | Returns `x` and `y` signals for mouse position |
| `useWindowSize()` | Returns `width` and `height` signals for window size |

### Route Composables
| Function | Description |
|----------|-------------|
| `useRouteData()` | Returns a signal with route data |
| `useRouteFragment()` | Returns a signal with URL fragment |
| `useRouteParam(name)` | Returns a signal with a single route parameter |
| `useRouteParams()` | Returns a signal with all route parameters |
| `useRouteQueryParam(name)` | Returns a signal with a single query parameter |
| `useRouteQueryParams()` | Returns a signal with all query parameters |

### Form Composables
| Function | Description |
|----------|-------------|
| `useFormValue(form)` | Form value as a signal |
| `useFormValid(form)` | Form validity as a signal |
| `useFormErrors(form)` | Form errors as a signal |
| `useFormStatus(form)` | Form status as a signal |
| `useFormDirty(form)` | Form dirty state as a signal |
| `useFormPristine(form)` | Form pristine state as a signal |
| `useFormTouched(form)` | Form touched state as a signal |
| `useFormUntouched(form)` | Form untouched state as a signal |
| `useFormPending(form)` | Form pending state as a signal |
| `useFormDisabled(form)` | Form disabled state as a signal |
| `useFormState(form)` | Complete form state object as a signal |

### Control Composables
| Function | Description |
|----------|-------------|
| `useControlValue(control)` | Control value as a signal |
| `useControlValid(control)` | Control validity as a signal |
| `useControlErrors(control)` | Control errors as a signal |
| `useControlStatus(control)` | Control status as a signal |
| `useControlDirty(control)` | Control dirty state as a signal |
| `useControlPristine(control)` | Control pristine state as a signal |
| `useControlTouched(control)` | Control touched state as a signal |
| `useControlUntouched(control)` | Control untouched state as a signal |
| `useControlPending(control)` | Control pending state as a signal |
| `useControlDisabled(control)` | Control disabled state as a signal |
| `useControlState(control)` | Complete control state object as a signal |

### General Composables
| Function | Description |
|----------|-------------|
| `useDebouncedSignal(signal, ms)` | Returns a debounced version of the signal |
| `useThrottledSignal(signal, ms)` | Returns a throttled version of the signal |
| `usePreviousSignal(signal)` | Returns a signal with the previous value |

### Effects
| Function | Description |
|----------|-------------|
| `syncLocalStorageEffect(key, signal)` | Syncs a signal with localStorage |
| `syncQueryParamsEffect(config)` | Syncs signals with URL query parameters |

### Utilities
| Function | Description |
|----------|-------------|
| `createSharedComposable(fn)` | Creates a shared instance of a composable |
