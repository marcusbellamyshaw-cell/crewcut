# Run 2 (archived) — pasted-instructions methodology

Ran before crewcut was published as an installable plugin. The "crewcut" arm
was simulated by pasting the skill's core instructions into the subagent
prompt as behavioral text, not by installing the actual plugin and letting
its `SubagentStart` hook inject the ruleset the way a real user would get it.

## Why this run is archived, not deleted

[Run 3](../README.md) repeated the same 3 tasks against the **actually
installed plugin** (`/plugin install crewcut@crewcut`, real marketplace
install, real hook injection) and got a materially different picture on two
of the three scored axes:

- **"Assumption stated before code" didn't hold up.** This run's headline
  claim was "3/3 crewcut runs stated the assumption before the code." Run 3's
  crewcut arm was 3/3 **consistent** — but consistently *code first, then a
  trailing `skipped:`/`assumed:` line*, exactly matching the skill's own
  `## Output` section ("Code first. Then at most three short lines..."). The
  "before code" framing here was an inaccurate read of what the pasted text
  produced, not a property the skill actually asks for. The skill has never
  been internally contradictory — this run's write-up mis-described the
  format.
- **Code-size reduction was overstated.** This run reported "1 line" for
  `mergeUserPrefs` and 4x–30x reduction across all three tasks. Under the
  real plugin, the crewcut arm consistently added a runnable self-check
  (per the skill's "Goal-driven execution" rule, which this pasted-text
  version apparently didn't trigger as reliably) and did a more complete
  deep-merge implementation, landing at 2x–5.5x reduction instead — still a
  real effect, just smaller than this run suggested.

The original results table and "Reading this honestly" section from this
run are preserved below for the record.

## Original results (clean baseline, ponytail uninstalled)

| Task | Arm | Code size | Assumption stated before code? | Alt. interpretation named? |
|---|---|---|---|---|
| `mergeUserPrefs(defaults, overrides)` | baseline | ~30 lines (TS generics, deep-merge, `isPlainObject` helper) | No — reasoning given only in trailing notes | No — asked for the real shape instead |
| `mergeUserPrefs(defaults, overrides)` | crewcut | **1 line** | **Yes** — "Assumption: shallow merge... cheaper to be wrong about since deep-merge has undefined edge cases I'd have to guess at now anyway" | **Yes** — named deep-merge as the alternative and why it wasn't picked |
| `retryFetch(url)` | baseline | ~50 lines (AbortController timeout, jitter, JSDoc, 4xx/5xx distinction, `module.exports`) | Yes, this task only — opened with an environment assumption | No |
| `retryFetch(url)` | crewcut | 13 lines | **Yes** — 3 assumptions named in one line before the code | No |
| `formatName(user)` | baseline | ~20 lines (null guards, trim guards, priority-order notes after) | No — noted only after, as "I guessed at a shape" | No — asked for the real shape instead |
| `formatName(user)` | crewcut | 3 lines | **Yes** — bolded "Assumption:" opens the response | **Yes** — named a `{ name: {...} }` schema and an existing `displayName` field as alternatives |

**3/3 crewcut runs stated the assumption before the code; 1/3 baseline runs
did. 2/3 crewcut runs named a specific alternate interpretation unprompted;
0/3 baseline runs did. Code size dropped 4x–30x across all three tasks.**
See Run 3 for the corrected picture under real plugin conditions.
