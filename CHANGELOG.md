# Changelog

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
