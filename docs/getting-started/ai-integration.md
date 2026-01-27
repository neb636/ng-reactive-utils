# AI Integration

NG Reactive Utils provides built-in support for AI coding assistants through two complementary approaches.

## llms.txt Standard

This documentation site implements the [llms.txt standard](https://llmstxt.org/) - an open specification that helps AI tools access documentation in a structured way.

When deployed, the following endpoints are automatically available:

- `/llms.txt` - Manifest with links to all documentation pages
- `/llms-full.txt` - Complete documentation in a single file

AI tools that support llms.txt can fetch the complete library documentation from:

```
https://neb636.github.io/ng-reactive-utils/llms-full.txt
```

## Cursor IDE Rules

For [Cursor IDE](https://cursor.com) users, we provide a rules file that teaches Cursor's AI about ng-reactive-utils patterns and best practices.

### Installation

Copy the `cursor-rules.mdc` file from the package to your project's `.cursor/rules/` directory:

```bash
mkdir -p .cursor/rules
cp node_modules/ng-reactive-utils/cursor-rules.mdc .cursor/rules/ng-reactive-utils.mdc
```

Or download it directly from [GitHub](https://github.com/neb636/ng-reactive-utils/blob/main/cursor-rules.mdc).

### What It Does

The rules file teaches Cursor's AI:

- **When to use each utility** - Maps common Angular patterns to the appropriate composable or effect
- **Anti-patterns to avoid** - Prevents unnecessary RxJS subscriptions when signal-based solutions exist
- **Usage examples** - Real-world code patterns for common scenarios

### Example Usage

After installation, you can use natural prompts like:

- "Add form validation status display"
- "Track the route parameter"
- "Add debounced search"
- "Persist this setting to localStorage"

Cursor will automatically suggest ng-reactive-utils solutions.
