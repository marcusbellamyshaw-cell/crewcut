# Run 3 (archived) — real installed plugin, crewcut vs. baseline only

First run using the actually-installed plugin (`/plugin install
crewcut@crewcut`, real marketplace source, real `SubagentStart` hook
injection) instead of pasted instruction text. Corrected two of Run 2's
headline claims (see [run-2-pasted-instructions.md](./run-2-pasted-instructions.md)).

Superseded by [Run 4](../README.md), which reuses this run's baseline and
crewcut data unchanged and adds two more arms — ponytail-alone and
andrej-karpathy-skills-alone, both also tested against their real
mechanisms — for a genuine 4-way comparison instead of crewcut vs. nothing.

## Results (real installed plugin, clean baseline)

| Task | Arm | Code size | Assumption surfaced? | Alt. interpretation named? |
|---|---|---|---|---|
| `mergeUserPrefs(defaults, overrides)` | baseline | ~55 lines (JSDoc, deep-merge, `isPlainObject` helper) | No — only informal "design choices" prose after the code | No — deep-merge picked and justified, shallow-merge never named as a live option |
| `mergeUserPrefs(defaults, overrides)` | crewcut | ~24 lines + 20-line self-check | **Yes** — trailing `skipped:`/`assumed:` line, code-first per the skill's `## Output` spec | No — states the assumed shape, doesn't name a second concrete reading |
| `retryFetch(url)` | baseline | ~50 lines (AbortController timeout, backoff+jitter, JSDoc, `retryOn` predicate) | No — design notes after the code, nothing flagged as an assumption | No |
| `retryFetch(url)` | crewcut | 14 lines + 12-line self-check | **Yes** — trailing `skipped:`/`assumed:` line | **Yes** — named retry-on-network-error-only vs. retry-on-any-failure as the two readings |
| `formatName(user)` | baseline | ~40 lines (5-tier fallback chain, whitespace cleanup, JSDoc) | No — caveat about differing shapes appears only after the code | No |
| `formatName(user)` | crewcut | 18 lines + 7-line self-check | **Yes** — trailing `skipped:`/`assumed:` line | No — states the assumed shape, doesn't name a second concrete reading |

## Findings (superseded/expanded in Run 4 — kept for the record)

- The "assumption stated *before* code" claim from Run 2 was wrong: crewcut
  is 3/3 consistent, but consistently *code-first, then* a trailing
  `skipped:`/`assumed:` line, matching the skill's own `## Output` spec.
- 1/3 crewcut runs named a concrete alternate interpretation vs. 0/3
  baseline.
- New finding: 3/3 crewcut runs shipped a runnable self-check; 0/3 baseline
  did.
- Code size dropped 2x–5.5x, not the 4x–30x Run 2 reported.
