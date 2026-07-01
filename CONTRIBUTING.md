# Contributing

Crew Cut governs itself: read [skills/crewcut/SKILL.md](./skills/crewcut/SKILL.md)
before opening a PR. The ladder and the assumption gate apply to changes
made to this repo too.

## Bug reports

Open an [Issue](../../issues). Include: what you expected the skill/hook
to do, what it actually did, and your platform (OS + Claude Code version).

## Feature requests / design discussion

Use [Discussions](../../discussions), not Issues — a new tag, a new
intensity level, or a new skill is a design conversation before it's a PR.

## Platform ports

v1 is Claude Code only (see [docs/platform-portability.md](./docs/platform-portability.md)
for why). A port to another agent platform (Cursor, Windsurf, OpenCode,
etc.) is welcome as a PR, but:

- It must be testable — include how you verified it actually activates on
  that platform, not just that the file is present.
- Follow the existing file-naming convention (`crewcut-<thing>.<ext>`) and
  add attribution to NOTICE.md if you're adapting code from ponytail's
  equivalent platform adapter.

## Pull requests

- One change per PR. State the assumption you made about scope in the PR
  description if the ask was ambiguous — dogfooding.
- Run the existing checks (`node --check` on any `.js` hook you touch, at
  minimum) before opening.
- Update `NOTICE.md` if you're porting or adapting third-party code.

## Code of conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
