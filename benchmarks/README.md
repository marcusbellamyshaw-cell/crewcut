# Benchmarks

This benchmark measures a different axis than ponytail's published
LOC/token/cost benchmarks (see ponytail's `benchmarks/` for those,
credited in [../NOTICE.md](../NOTICE.md)): **does the agent explicitly
flag an assumption, in the skill's specified `skipped:`/`assumed:` format,
when the request is genuinely ambiguous** — the specific gap between
ponytail (optimizes code volume)
and andrej-karpathy-skills (states the "surface assumptions" principle but
has no benchmark of its own, and no persistence mechanism to enforce it).
As a side effect, it also replicates ponytail's own LOC-reduction claim
against a clean baseline.

## Methodology

3 deliberately underspecified coding tasks (object shape and edge-case
behavior both left unstated), each run twice via an isolated Claude Code
subagent with no file/codebase access — respond with code only, no other
context:

- **baseline**: task prompt only, crewcut mode off.
- **crewcut**: identical task prompt, crewcut mode `full` — instructions
  injected by the actually-installed plugin's real `SubagentStart` hook
  (not pasted instruction text; see "Three runs" below for why that
  distinction turned out to matter).

Scored by hand on three axes: **code size** (lines), **assumption
surfaced** (explicitly flagged, in the `skipped:`/`assumed:` format the
skill specifies / only in informal prose / not stated at all), and
**alternate interpretation named** (did the response acknowledge a second
reasonable reading of the request, not just its own pick).

## Three runs, two disclosed confounds

**Run 1** happened in a session with
[ponytail](https://github.com/DietrichGebert/ponytail) active session-wide,
whose SubagentStart hook propagated its ruleset into the "baseline" arm
too, muting the size difference. Archived in
[results/run-1-ponytail-ambient.md](./results/run-1-ponytail-ambient.md).

**Run 2** used a clean baseline (ponytail uninstalled) but simulated the
crewcut arm by pasting the skill's instructions into the subagent prompt,
since the plugin wasn't installable yet at the time. Archived in
[results/run-2-pasted-instructions.md](./results/run-2-pasted-instructions.md) —
its "assumption before code" and "4x–30x" headline numbers didn't hold up
once tested against the real thing (see below).

**Run 3 (current, below) uses the actually-installed plugin** —
`/plugin install crewcut@crewcut`, real marketplace source, real
`SubagentStart` hook injection — the exact mechanism a real user gets, not
a proxy for it.

## Results (Run 3 — real installed plugin, clean baseline)

| Task | Arm | Code size | Assumption surfaced? | Alt. interpretation named? |
|---|---|---|---|---|
| `mergeUserPrefs(defaults, overrides)` | baseline | ~55 lines (JSDoc, deep-merge, `isPlainObject` helper) | No — only informal "design choices" prose after the code | No — deep-merge picked and justified, shallow-merge never named as a live option |
| `mergeUserPrefs(defaults, overrides)` | crewcut | ~24 lines + 20-line self-check | **Yes** — trailing `skipped:`/`assumed:` line, code-first per the skill's `## Output` spec | No — states the assumed shape, doesn't name a second concrete reading |
| `retryFetch(url)` | baseline | ~50 lines (AbortController timeout, backoff+jitter, JSDoc, `retryOn` predicate) | No — design notes after the code, nothing flagged as an assumption | No |
| `retryFetch(url)` | crewcut | 14 lines + 12-line self-check | **Yes** — trailing `skipped:`/`assumed:` line | **Yes** — named retry-on-network-error-only vs. retry-on-any-failure as the two readings |
| `formatName(user)` | baseline | ~40 lines (5-tier fallback chain, whitespace cleanup, JSDoc) | No — caveat about differing shapes appears only after the code | No |
| `formatName(user)` | crewcut | 18 lines + 7-line self-check | **Yes** — trailing `skipped:`/`assumed:` line | No — states the assumed shape, doesn't name a second concrete reading |

## Reading this honestly

- **The "assumption stated *before* code" claim from Run 2 was wrong.**
  Under the real plugin, crewcut was 3/3 **consistent** — but consistently
  *code first, then* a trailing `skipped:`/`assumed:` line, exactly
  matching the skill's own `## Output` section ("Code first. Then at most
  three short lines..."). There's no contradiction in the skill text; Run
  2's write-up mis-described what "surfacing an assumption" looks like in
  practice. The corrected, still-real finding: **3/3 crewcut runs
  explicitly flagged their assumption in the skill's specified format;
  0/3 baseline runs flagged anything as an assumption** (baseline explains
  its choices, but never marks them as guesses).
- **1/3 crewcut runs named a concrete alternate interpretation; 0/3
  baseline runs did** — weaker than Run 2's reported 2/3, and worth taking
  at face value: naming a second reading isn't guaranteed every time, even
  with the assumption gate active. n=3 per condition is small; don't read
  a single run's ratio as a fixed rate.
- **New, unplanned finding: 3/3 crewcut runs shipped a runnable self-check
  (assert-based `demo()` or `console.assert` calls); 0/3 baseline runs
  did.** This tracks directly to the skill's "Goal-driven execution" rule
  ("non-trivial logic... leaves ONE runnable check behind") and reproduced
  cleanly across all three tasks — a more consistent effect in this run
  than either of the other two scored axes.
- **Code size dropped 2x–5.5x**, not the 4x–30x Run 2 reported (~55→~24,
  ~50→14, ~40→18 lines). Real crewcut output spends some of its size
  budget on the self-check the pasted-instructions version didn't reliably
  produce, and did a more complete implementation (e.g. an actual
  deep-merge, not a 1-line shallow spread) — both genuine behavior, just
  not as dramatic a number as the earlier proxy run suggested.
- **This is still a 3-task, single-run-per-condition, hand-scored
  benchmark.** Enough to show the effect is real and to correct the
  specific claims Run 2 got wrong, not enough to claim a stable
  percentage. An automated harness modeled on ponytail's
  `benchmarks/agentic/` (credited) is the natural next step and isn't
  built here yet.

## Reproducing

Install the real plugin (`/plugin marketplace add
marcusbellamyshaw-cell/crewcut && /plugin install crewcut@crewcut`), then
run the same 3 tasks (or your own) through an isolated subagent twice: once
with crewcut mode off (`/crewcut off`), once with it on (`/crewcut full`).
Score for code size, whether the assumption is explicitly flagged (not just
explained), and alternate-interpretation naming as above. Run with no other
agent-shaping plugin active for a clean baseline. PRs adding an automated
harness are welcome.
