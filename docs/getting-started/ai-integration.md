# AI Integration

NG Reactive Utils provides built-in support for AI coding assistants.

## llms.txt Standard

This documentation implements the [llms.txt standard](https://llmstxt.org/) for AI tool integration.

AI assistants can fetch the complete documentation from:

```
https://neb636.github.io/ng-reactive-utils/llms-full.txt
```

## Cursor IDE Rules

For [Cursor IDE](https://cursor.com) users, we provide a rules file that teaches Cursor about ng-reactive-utils patterns.

### Setup

Copy the rules file to your project:

```bash
mkdir -p .cursor/rules
cp node_modules/ng-reactive-utils/cursor-rules.mdc .cursor/rules/ng-reactive-utils.mdc
```

Or download from [GitHub](https://github.com/neb636/ng-reactive-utils/blob/main/cursor-rules.mdc).

### What It Provides

- Maps common Angular patterns to the appropriate composable
- Prevents unnecessary RxJS subscriptions
- Provides real-world usage examples

### Example Prompts

After installation, use natural language:

- "Add form validation status display"
- "Track the route parameter"
- "Add debounced search"
- "Persist this setting to localStorage"

Cursor will automatically suggest ng-reactive-utils solutions.
