# Platform portability

Ponytail supports 16+ agent platforms (Claude Code, Codex, Copilot CLI,
Cursor, Windsurf, Cline, OpenCode, Gemini, and more), each with its own
adapter format (hooks JSON, TOML commands, `.mdc` rule files, MCP server,
etc.).

Crew Cut v1 ships Claude Code support only. That's a scope decision, not a
technical limitation: this repo was built and verified against Claude
Code, and shipping adapters for platforms nobody has run the plugin
against would be an unverified claim rather than a tested feature.

## Why this instead of porting everything up front

Building 15 more adapters by pattern-matching ponytail's file structure
would be fast to write and slow to trust — each platform has its own hook
lifecycle, context-injection quirks, and failure modes that only show up
when something actually runs on it (ponytail's own commit history has
several fixes for exactly this: issue trackers full of "works on X, silently
no-ops on Y").

## Adding a port

Contributions are welcome. To add a platform:

1. Look at how `ponytail` implements it for that platform (MIT-licensed,
   linked in [NOTICE.md](../NOTICE.md)) as a reference for the platform's
   adapter format.
2. Adapt the format, not necessarily the file layout — some platforms
   don't have an equivalent to hooks (e.g. instruction-only adapters just
   need `AGENTS.md`-style content, no `hooks/` directory at all).
3. Point content at `skills/crewcut/SKILL.md` as the source of truth for
   ruleset text, the same way `hooks/crewcut-instructions.js` does for
   Claude Code, so the ruleset doesn't drift across N copies.
4. Include a note in your PR on how you verified it actually activates —
   a screenshot, a transcript, or a test file, not just "should work."
