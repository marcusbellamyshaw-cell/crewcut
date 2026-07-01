# Benchmarks

This benchmark measures a different axis than ponytail's published
LOC/token/cost benchmarks (see ponytail's `benchmarks/` for those,
credited in [../NOTICE.md](../NOTICE.md)): **does the agent state an
assumption up front, before writing code, when the request is genuinely
ambiguous** — the specific gap between ponytail (optimizes code volume)
and andrej-karpathy-skills (states the "surface assumptions" principle but
has no benchmark of its own, and no persistence mechanism to enforce it).

## Methodology

3 deliberately underspecified coding tasks (object shape and edge-case
behavior both left unstated), each run twice via an isolated Claude Code
subagent with no file/codebase access — respond with code only, no other
context:

- **baseline**: task prompt only.
- **crewcut**: task prompt + the `crewcut` skill's core instructions
  (assumption gate + ladder + output format) pasted as behavioral
  instructions.

Scored by hand on two axes: **assumption placement** (stated before the
code / stated only after, in a trailing note / not stated at all) and
**alternate interpretation named** (did the response acknowledge a second
reasonable reading of the request, not just its own pick).

## A confound, disclosed up front

This test ran inside a Claude Code session with
[ponytail](https://github.com/DietrichGebert/ponytail) already active
session-wide (SubagentStart hook, per ponytail's own design, propagates
its ruleset to every Task-spawned subagent — including the "baseline"
ones in this test). A from-scratch, zero-plugin baseline wasn't reachable
in this environment. Practically, this means the "baseline" arm below is
closer to *ponytail alone* than to *no plugin at all* — which is arguably
the more useful comparison anyway (most people reading this already have
some agent-shaping instructions active), but it is not a clean-room
result, and it explains why the baseline arm already exhibits
skip-listing behavior (a ponytail habit) rather than staying silent.

## Results

| Task | Arm | Assumption stated before code? | Alt. interpretation named? | Code size |
|---|---|---|---|---|
| `mergeUserPrefs(defaults, overrides)` | baseline | No — noted after, as a "skipped" item | No | 1 line |
| `mergeUserPrefs(defaults, overrides)` | crewcut | No — noted after, but as an explicit "Assumed" | No | 1 line |
| `retryFetch(url)` | baseline | No — environment assumption (global `fetch`, Node 18+) never stated | No | ~30 lines (incl. self-check) |
| `retryFetch(url)` | crewcut | **Yes** — "Assuming browser/Node `fetch`... if this is for a different HTTP client, say so" opens the response | No | 13 lines (no self-check — see note below) |
| `formatName(user)` | baseline | No — schema assumption noted only after the code | No | 4 lines |
| `formatName(user)` | crewcut | **Yes** — field shape stated before the code | **Yes** — named the "single `name` field" alternative unprompted | 2 lines |

Raw transcripts: run inline in this repo's PR history / issue tracker on
request; not checked in as files to keep the repo lean (see
[CONTRIBUTING.md](../CONTRIBUTING.md) if you want to reproduce and attach
your own).

## Reading this honestly

- **3/3 crewcut runs stated the assumption before the code; 0/3 baseline
  runs did** (baseline consistently used a post-hoc "skipped:" framing
  instead) — this is the effect crewcut's assumption gate is meant to
  produce, and it showed up consistently, even against an already-lazy
  baseline.
- **2/3 crewcut runs named an alternate interpretation unprompted; 0/3
  baseline runs did.**
- **Task 1 was a wash** — the ambiguity (shallow vs. deep merge) is common
  enough that ambient ponytail's own "skipped:" habit already flagged it;
  crewcut's contribution there was tone (explicit "Assumed") more than
  substance.
- **Task 2 is a genuine mixed result, not cherry-picked**: crewcut's
  response dropped the self-check/demo function that the baseline
  included unprompted. Ponytail's own rule ("non-trivial logic leaves ONE
  runnable check behind") should have applied here and didn't fire
  reliably in the crewcut condition — worth investigating further before
  claiming crewcut strictly dominates on output quality, not just on
  assumption-surfacing. Filed as a known gap, not smoothed over.
- **This is a 3-task, single-run, hand-scored benchmark** — enough to
  demonstrate the effect exists and is directionally real, not enough to
  claim a percentage. Ponytail's own benchmark suite (12 tasks, judge
  model, multiple runs) is the standard to match for a rigorous version of
  this; a `benchmarks/agentic/`-style automated harness modeled on theirs
  is the natural next step and is not yet built here.

## Reproducing

Run the same 3 tasks (or your own) through an isolated subagent twice: once
with just the task prompt, once with `skills/crewcut/SKILL.md`'s content
prepended as instructions. Score for assumption placement and alternate-
interpretation naming as above. PRs adding an automated harness (see
ponytail's `benchmarks/agentic/` for a reference design) are welcome.
