# AI Integration

NG Reactive Utils is designed as an AI-first library with multiple integration options for AI coding assistants.

## Agent Skills (Recommended)

Install ng-reactive-utils knowledge into your AI coding agent with a single command:

```bash
npx skills add neb636/ng-reactive-utils
```

This works with **33+ AI coding agents** including:

- Cursor
- Claude Code
- GitHub Copilot
- Windsurf
- Codex
- Cline
- OpenCode
- And many more

After installation, your AI agent will automatically:

- Suggest ng-reactive-utils composables instead of RxJS subscriptions
- Know the complete API and usage patterns
- Follow best practices for signal-based Angular development

### Supported Agents

| Agent | Project Path | Global Path |
|-------|--------------|-------------|
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| GitHub Copilot | `.github/skills/` | `~/.copilot/skills/` |
| Windsurf | `.windsurf/skills/` | `~/.codeium/windsurf/skills/` |

See the full list at [add-skill.org](https://add-skill.org/).

## llms.txt Standard

This documentation implements the [llms.txt standard](https://llmstxt.org/) for AI tool integration.

AI assistants can fetch the complete documentation from:

```
https://neb636.github.io/ng-reactive-utils/llms-full.txt
```

Use this with any LLM (ChatGPT, Claude, etc.) by pasting the URL or content into your conversation.

## Cursor IDE Rules (Manual)

For Cursor users who prefer manual setup, copy the rules file to your project:

```bash
mkdir -p .cursor/rules
cp node_modules/ng-reactive-utils/cursor-rules.mdc .cursor/rules/ng-reactive-utils.mdc
```

Or download from [GitHub](https://github.com/neb636/ng-reactive-utils/blob/main/cursor-rules.mdc).

## What AI Integration Provides

- Maps common Angular patterns to the appropriate composable
- Prevents unnecessary RxJS subscriptions
- Provides real-world usage examples
- Teaches anti-patterns to avoid

## Example Prompts

After installation, use natural language:

- "Add form validation status display"
- "Track the route parameter"
- "Add debounced search"
- "Persist this setting to localStorage"
- "Make this responsive to window size"

Your AI assistant will automatically suggest ng-reactive-utils solutions.
