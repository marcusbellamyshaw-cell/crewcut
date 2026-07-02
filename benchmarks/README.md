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
behavior both left unstated), each run through an isolated Claude Code
subagent with no file/codebase access — respond with code only, no other
context. Four arms, each tested against its **real mechanism**, not a
proxy:

- **baseline**: task prompt only, no plugin active.
- **crewcut**: identical prompt, crewcut mode `full` — instructions
  injected by the actually-installed plugin's real `SubagentStart` hook.
- **ponytail**: identical prompt, [ponytail](https://github.com/DietrichGebert/ponytail)
  mode `full` — same real-hook-injection mechanism (crewcut's is adapted
  from it), crewcut disabled for this arm.
- **karpathy-skills**: identical prompt with [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)'
  actual `CLAUDE.md` text pasted in as instructions — this project has no
  hook/plugin mechanism of its own, so pasting its guidelines into context
  *is* the realistic way it gets used (its own README says to merge it
  into project instructions); no plugins active for this arm.

Scored by hand on four axes: **code size** (lines), **assumption surfaced**
(explicitly flagged as an assumption / only in informal unmarked prose /
not stated at all), **alternate interpretation named** (did the response
name a second reasonable reading, not just pick one), and **self-check
shipped** (a runnable test/assert, unprompted).

## Four runs

**Run 1** happened in a session with ponytail active session-wide
ambiently, contaminating the baseline arm. Archived in
[results/run-1-ponytail-ambient.md](./results/run-1-ponytail-ambient.md).

**Run 2** used a clean baseline but simulated the crewcut arm with pasted
instruction text, since the plugin wasn't installable yet. Its headline
numbers didn't hold up. Archived in
[results/run-2-pasted-instructions.md](./results/run-2-pasted-instructions.md).

**Run 3** was the first to use the real installed crewcut plugin, but only
compared it against baseline. Archived in
[results/run-3-crewcut-vs-baseline.md](./results/run-3-crewcut-vs-baseline.md) —
its data is reused unchanged below.

**Run 4 (current, below)** adds real ponytail and real karpathy-skills
arms for a genuine 4-way comparison, each tested the way it's actually
meant to be used rather than approximated.

## Results (Run 4 — 4-way, real mechanisms, clean isolation between arms)

| Task | Arm | Code size | Assumption surfaced? | Alt. interpretation named? | Self-check shipped? |
|---|---|---|---|---|---|
| `mergeUserPrefs` | baseline | ~55 lines | No — informal prose only | No | No |
| `mergeUserPrefs` | crewcut | ~24 lines + 20-line self-check | **Yes** — trailing `skipped:`/`assumed:` line | No | **Yes** |
| `mergeUserPrefs` | ponytail | ~20 lines + 8-line self-check | No — trailing `→ skipped:` line documents scope, not a flagged guess | No | **Yes** |
| `mergeUserPrefs` | karpathy-skills | ~25 lines | **Yes** — 6-bullet "Assumptions:" list **before** the code | **Yes** — named shallow-merge/array-concat/TS as alternatives | No |
| `retryFetch` | baseline | ~50 lines | No | No | No |
| `retryFetch` | crewcut | 14 lines + 12-line self-check | **Yes** — trailing `skipped:`/`assumed:` line | **Yes** — network-error-only vs. any-failure | **Yes** |
| `retryFetch` | ponytail | 9 lines + 20-line self-check | No — trailing `→ skipped:` line, not flagged as a guess | No | **Yes** |
| `retryFetch` | karpathy-skills | ~30 lines | No — informal "Notes" after code | No | No |
| `formatName` | baseline | ~40 lines | No | No | No |
| `formatName` | crewcut | 18 lines + 7-line self-check | **Yes** — trailing `skipped:`/`assumed:` line | No | **Yes** |
| `formatName` | ponytail | 4 lines | No — trailing `→ skipped:` line, not flagged as a guess | No | No |
| `formatName` | karpathy-skills | ~20 lines | **Yes** — 4-bullet "Assumptions:" list **before** the code | No — invites correction, doesn't name a concrete second reading | No |

## Reading this honestly

- **Assumption surfaced (explicitly flagged, not just explained): crewcut
  3/3, karpathy-skills 2/3, ponytail 0/3, baseline 0/3.** This is the axis
  crewcut was built to win and it does, clearly — but karpathy-skills
  (just pasted `CLAUDE.md` text, no enforcement mechanism) got surprisingly
  close, missing only on the task where the model happened to skip its own
  "think before coding" step. Ponytail explicitly doesn't try to do this
  (per its own design — YAGNI ladder, not an assumption gate) and its 0/3
  here isn't a failure, it's out of scope for what ponytail claims to do.
- **Placement confirms each skill's own spec, when the assumption is
  surfaced at all.** crewcut: 3/3 *after* code, trailing line — matches
  its `## Output` section. karpathy-skills: 2/2 (of the ones that surfaced
  anything) *before* code, as a list — matches its "Think Before Coding"
  principle's literal instruction to state assumptions "before
  implementing." Neither skill is inconsistent with itself; they just
  specify opposite placement, and the models followed each specification
  when they followed it at all.
- **Self-check shipped: crewcut 3/3, ponytail 2/3, karpathy-skills 0/3,
  baseline 0/3.** The most surprising result of this run. Karpathy-skills'
  own principle #4 ("Goal-Driven Execution") explicitly gives "write a
  test, then make it pass" as the model example — and still 0/3 subagents
  produced one, unprompted. Ponytail doesn't name this as an explicit rule
  the way crewcut does, but got 2/3 anyway (its ladder's "verify" framing
  appears to trigger it as a side effect). This is real evidence for the
  comparison table's "no persistence/enforcement mechanism" claim about
  karpathy-skills: stating a principle in pasted text doesn't reliably
  produce the behavior, even when the principle is explicit and gives a
  worked example.
- **Alternate interpretation named: crewcut 1/3, karpathy-skills 1/3,
  ponytail 0/3, baseline 0/3.** Roughly tied between the two
  assumption-aware skills; not enough signal at n=3 to call a winner here.
- **Code size: ponytail is smallest at 4–20 lines** (its actual claimed
  strength — pure LOC minimization, no assumption-gate machinery to also
  emit), **crewcut is next at 14–24 lines function-only** (plus a
  self-check ponytail only sometimes includes), **karpathy-skills and
  baseline are both in the 20–55 line range** with karpathy-skills
  consistently somewhat smaller than baseline (its "Simplicity First"
  principle does have some effect, just weaker than either hook-enforced
  skill's).
- **Net read:** crewcut is the only arm that reliably does *both* things
  (flags assumptions AND stays small AND ships a self-check) — which is
  the actual point of combining ponytail's mechanism with
  karpathy-skills' principle rather than using either alone. Ponytail
  alone wins on raw size. Karpathy-skills alone can match crewcut's
  assumption-flagging on a good task but is inconsistent (misses 1/3) and
  never produces a self-check despite asking for one in its own text.
  Baseline does none of the three things any of the other three arms were
  built to do.
- **This is still a 3-task, single-run-per-condition, hand-scored
  benchmark (12 total responses across 4 arms).** Enough to show real,
  distinguishable differences between all four arms on multiple axes, not
  enough to claim a stable percentage for any of them. An automated
  harness now exists in [agentic/](./agentic/) (modeled on ponytail's
  `benchmarks/agentic/`, credited in NOTICE.md) for multi-run versions of
  this table; the results above predate it and were scored by hand.

## Reproducing

Automated (preferred): install crewcut (`/plugin marketplace add
marcusbellamyshaw-cell/crewcut && /plugin install crewcut@crewcut`) and,
for the ponytail arm, ponytail (`/plugin marketplace add
DietrichGebert/ponytail && /plugin install ponytail@ponytail`), then:

```
node benchmarks/agentic/run.js --selftest              # prove graders, no spend
node benchmarks/agentic/run.js --runs 3                # baseline vs crewcut
node benchmarks/agentic/run.js --runs 3 --arms baseline,crewcut,ponytail
```

Each cell runs headless (`claude -p`) with global plugins excluded and
exactly one plugin loaded via `--plugin-dir`, then scores the four axes
deterministically. The `altReading` grader is a heuristic — spot-check its
sub-threshold cells by hand rather than trusting a zero.

Manual (what produced the table above): run the same 3 tasks through an
isolated subagent under each arm — baseline (all plugins off), crewcut
(`/crewcut full`, ponytail off), ponytail (`/ponytail full`, crewcut off),
karpathy-skills (both plugins off, paste its `CLAUDE.md` from
[multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)
into the prompt) — and score by hand as above.
