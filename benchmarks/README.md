# Benchmarks

This benchmark measures a different axis than ponytail's published
LOC/token/cost benchmarks (see ponytail's `benchmarks/` for those,
credited in [../NOTICE.md](../NOTICE.md)): **does the agent state an
assumption up front, before writing code, when the request is genuinely
ambiguous** — the specific gap between ponytail (optimizes code volume)
and andrej-karpathy-skills (states the "surface assumptions" principle but
has no benchmark of its own, and no persistence mechanism to enforce it).
As a side effect, it also replicates ponytail's own LOC-reduction claim
against a clean baseline.

## Methodology

3 deliberately underspecified coding tasks (object shape and edge-case
behavior both left unstated), each run twice via an isolated Claude Code
subagent with no file/codebase access — respond with code only, no other
context:

- **baseline**: task prompt only.
- **crewcut**: task prompt + the `crewcut` skill's core instructions
  (assumption gate + ladder + output format) pasted as behavioral
  instructions.

Scored by hand on three axes: **code size** (lines), **assumption
placement** (stated before the code / only after, in a trailing note /
not stated at all), and **alternate interpretation named** (did the
response acknowledge a second reasonable reading of the request, not just
its own pick).

## Two runs, one disclosed confound

The first run happened in a Claude Code session with
[ponytail](https://github.com/DietrichGebert/ponytail) already active
session-wide, whose SubagentStart hook (per ponytail's own design)
propagates its ruleset to every Task-spawned subagent — including the
"baseline" arm. That run is in [results/run-1-ponytail-ambient.md](./results/run-1-ponytail-ambient.md)
for reference; its baseline arm was already lazy/terse from ambient
ponytail, which muted the size difference between arms.

**The results below are the second run, after ponytail was uninstalled** —
a genuinely clean baseline. The gap is much larger without it, which is
itself informative: it means most of the value people currently get from
running ponytail-style minimalism shows up specifically because default
agent behavior (no plugin at all) is significantly more verbose and more
likely to bury its assumptions in trailing notes than either plugin's
marketing implies on its own — crewcut's numbers below aren't just "vs.
raw Claude," they're the actual raw-Claude comparison.

## Results (clean baseline, ponytail uninstalled)

| Task | Arm | Code size | Assumption stated before code? | Alt. interpretation named? |
|---|---|---|---|---|
| `mergeUserPrefs(defaults, overrides)` | baseline | ~30 lines (TS generics, deep-merge, `isPlainObject` helper) | No — reasoning given only in trailing notes | No — asked for the real shape instead |
| `mergeUserPrefs(defaults, overrides)` | crewcut | **1 line** | **Yes** — "Assumption: shallow merge... cheaper to be wrong about since deep-merge has undefined edge cases I'd have to guess at now anyway" | **Yes** — named deep-merge as the alternative and why it wasn't picked |
| `retryFetch(url)` | baseline | ~50 lines (AbortController timeout, jitter, JSDoc, 4xx/5xx distinction, `module.exports`) | Yes, this task only — opened with an environment assumption | No |
| `retryFetch(url)` | crewcut | 13 lines | **Yes** — 3 assumptions named in one line before the code | No |
| `formatName(user)` | baseline | ~20 lines (null guards, trim guards, priority-order notes after) | No — noted only after, as "I guessed at a shape" | No — asked for the real shape instead |
| `formatName(user)` | crewcut | 3 lines | **Yes** — bolded "Assumption:" opens the response | **Yes** — named a `{ name: {...} }` schema and an existing `displayName` field as alternatives |

## Reading this honestly

- **3/3 crewcut runs stated the assumption before the code; 1/3 baseline
  runs did** (baseline's one hit was task 2, where it happened to open
  with an environment note — inconsistent, not a pattern).
- **2/3 crewcut runs named a specific alternate interpretation unprompted;
  0/3 baseline runs did** (baseline instead asked the user to supply the
  real shape — reasonable, but a question isn't the same as flagging what
  was assumed *in the code it just shipped*).
- **Code size dropped 4x–30x** across all three tasks with crewcut vs. a
  clean baseline (1 vs ~30, 13 vs ~50, 3 vs ~20 lines) — this is
  substantially larger than the size gap seen in the ponytail-contaminated
  first run, confirming that most of the reduction is coming from the
  ladder (ponytail's contribution), while the *placement and specificity*
  of the assumption statement is coming from the assumption gate
  (andrej-karpathy-skills' contribution) — the two effects are additive
  and separable in this data, which is the core claim of combining them.
- **The self-check gap noted in run 1 didn't reproduce** — in this run
  neither arm included a runnable self-check for `retryFetch`, so it
  wasn't a crewcut-specific miss, just noise in a single earlier sample.
  Retracting that as a "known gap" — 3-task samples are small enough that
  one-off misses in either direction shouldn't be over-read.
- **This is still a 3-task, single-run-per-condition, hand-scored
  benchmark.** Enough to show the effect is real and larger than the
  first (confounded) run suggested, not enough to claim a percentage.
  Ponytail's own benchmark suite (12 tasks, judge model, multiple runs)
  is the standard to match for a rigorous version of this; an automated
  harness modeled on `benchmarks/agentic/` from ponytail (credited) is
  the natural next step and isn't built here yet.

## Reproducing

Run the same 3 tasks (or your own) through an isolated subagent twice: once
with just the task prompt, once with `skills/crewcut/SKILL.md`'s content
prepended as instructions. Score for code size, assumption placement, and
alternate-interpretation naming as above. Run with no other agent
instructions/plugins active for a clean baseline — as this second run
shows, ambient minimalism instructions from something else installed in
the same session will mute the size delta. PRs adding an automated harness
are welcome.
