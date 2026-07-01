# Run 1 — ponytail active session-wide (confounded)

Superseded by the clean run in [../README.md](../README.md). Kept for
comparison: it shows how much a pre-existing minimalism plugin already
suppresses baseline verbosity, which is itself part of why the clean run's
gap looks so much larger.

Same methodology and same 3 tasks as the main README, run in a Claude Code
session with [ponytail](https://github.com/DietrichGebert/ponytail) active
(SubagentStart hook propagates its ruleset to spawned subagents, including
the "baseline" arm here — see NOTICE.md for attribution).

| Task | Arm | Assumption stated before code? | Alt. interpretation named? | Code size |
|---|---|---|---|---|
| `mergeUserPrefs(defaults, overrides)` | baseline | No — noted after, as a "skipped" item | No | 1 line |
| `mergeUserPrefs(defaults, overrides)` | crewcut | No — noted after, but as an explicit "Assumed" | No | 1 line |
| `retryFetch(url)` | baseline | No — environment assumption (global `fetch`, Node 18+) never stated | No | ~30 lines (incl. self-check) |
| `retryFetch(url)` | crewcut | **Yes** — "Assuming browser/Node `fetch`... if this is for a different HTTP client, say so" opens the response | No | 13 lines (no self-check) |
| `formatName(user)` | baseline | No — schema assumption noted only after the code | No | 4 lines |
| `formatName(user)` | crewcut | **Yes** — field shape stated before the code | **Yes** — named the "single `name` field" alternative unprompted | 2 lines |

## Why this run undersold the effect

Task 1 was a wash — the ladder plus ambient ponytail already produced a
1-line answer on both arms, so there was no code-size delta left for
crewcut to add on top of, and the assumption-placement signal was muted
too (baseline's own "skipped:" habit, inherited from ponytail, looks
similar to a flagged assumption at a glance even though it's framed as a
limitation rather than a decision made *for* you). The clean rerun in
`../README.md` shows baseline code size 4x–30x larger once that ambient
suppression is removed, and the assumption-placement gap widens from 2/3
to 3/3 favoring crewcut on "stated before code."
