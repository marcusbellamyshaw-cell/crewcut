# Changelog

## 0.3.0

- The output pattern gains a mandatory `check:` slot — naming what the
  shipped self-check asserts, or explicitly writing "none — trivial".
  Same evidence-driven change as 0.2.0's `other reading:` slot: the
  first automated benchmark run (n=15) showed the self-check rule held
  on complex tasks (4/5) but was mostly skipped on mid-complexity ones
  (1/5 on a retry loop), while every format-level slot went 15/15.
  Having to write the line is the nudge to notice a branch/loop/retry
  isn't trivial.

## 0.2.0

- The output pattern now has a mandatory `other reading:` slot — naming
  the second reasonable interpretation of an ambiguous request (or
  "none") is part of the format, not just a prose rule. Benchmarking
  showed format-level rules are followed far more reliably than
  prose-level ones (the self-check rule went 3/3 as a pattern; the
  alternate-reading rule went 1/3 as prose).
- The plugin now works immediately after `/plugin install` +
  `/reload-plugins`, with no session restart: an absent mode flag means
  "never activated" and falls back to the configured default instead of
  silently doing nothing. `/crewcut off` and "stop crewcut" persist an
  explicit off, so turning it off still sticks.
- The statusline setup nudge fires once per install path instead of on
  every session start, and a statusline pointing at a previous version's
  install path (broken by a plugin upgrade moving the cache directory) is
  now detected and re-nudged with the corrected snippet.
- New automated benchmark harness (`benchmarks/agentic/run.js`):
  headless multi-run scoring of the assumption-flagged / alternate-reading
  / self-check / code-size axes, with a `--selftest` that proves the
  graders before any API spend. Modeled on ponytail's agentic harness
  (credited in NOTICE.md).
- New runnable check for the hook state machine (`tests/hooks-check.js`).

## 0.1.0 — initial release

- `crewcut` skill: ponytail's YAGNI ladder + andrej-karpathy-skills'
  assumption-surfacing, surgical-changes, and goal-driven-execution
  principles, merged into one always-active ruleset with lite/full/ultra
  intensity levels.
- `/crewcut-review`: diff review for both over-engineering (bloat tags,
  from ponytail-review) and scope creep / unflagged assumptions (new
  `scope:`, `assume:`, `orphan:` tags).
- `/crewcut-plan`: new — turns an ambiguous or multi-step task into an
  explicit assumption list, numbered plan, and per-step verify check
  before any code is written.
- SessionStart/SubagentStart/UserPromptSubmit hooks and statusline badge,
  adapted from ponytail, scoped to Claude Code only for v1.
- Initial benchmark: assumption-surfacing rate on 3 underspecified tasks,
  see `benchmarks/`.
