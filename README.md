# Crew Cut

Lazy senior dev mode for AI coding agents — that also refuses to guess.

Crew Cut is a synthesis of two prior projects: [ponytail](https://github.com/DietrichGebert/ponytail)'s
YAGNI/minimalism ladder and [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)'
assumption-surfacing and goal-driven-execution principles. Full
attribution and per-file provenance in [NOTICE.md](./NOTICE.md).

> The best code is the code never written. The most expensive bug is the
> one built on a guess nobody said out loud.

## Why not just use one of them?

| | ponytail | andrej-karpathy-skills | **crewcut** |
|---|---|---|---|
| Minimal code (YAGNI ladder) | ✅ | partial (1 principle, no ladder) | ✅ |
| Surfaces ambiguity instead of guessing silently | ❌ | ✅ (principle only, no enforcement) | ✅ (enforced gate + `/crewcut-plan`) |
| Persistent "always active" mode (survives compaction, propagates to subagents) | ✅ | ❌ | ✅ |
| Intensity levels (lite/full/ultra) | ✅ | ❌ | ✅ |
| Review command | ✅ over-engineering only | ❌ none | ✅ over-engineering **and** scope creep **and** unflagged assumptions |
| Standalone planning skill (assumptions → plan → verify) | ❌ | ❌ (prose principle, not invokable) | ✅ `/crewcut-plan` |
| Benchmarked | ✅ LOC/tokens/cost only | ❌ none | ✅ LOC **and** assumption-surfacing rate **and** scope-creep rate — see [benchmarks/](./benchmarks) |

Ponytail is the more mature engineering project and is where Crew Cut's
hook plumbing comes from (credited, see NOTICE.md). But its ladder never
asks "did I just guess?" — it optimizes code volume, not decision quality.
Karpathy-skills names the right problem (silent assumptions, unrequested
refactors) but ships it as four paragraphs of guidance with no persistence,
no enforcement, and no way to invoke it as a discrete action. Crew Cut
takes ponytail's proven "always-on, intensity-tunable" mechanism and uses
it to enforce *both* sets of principles together, plus adds two things
neither original ships: a review command that catches scope creep and
silent assumptions (not just bloat), and a standalone `/crewcut-plan` skill
that turns "think before coding" into something you can actually invoke.

## Install

Claude Code, via the marketplace:

```
/plugin marketplace add marcusbellamyshaw-cell/crewcut
/plugin install crewcut
```

Or per-project: copy `skills/` into your project's `.claude/skills/` and
merge `CLAUDE.md`-equivalent guidance from `skills/crewcut/SKILL.md` into
your own instructions file.

v1 targets Claude Code only. Ponytail supports 16+ agent platforms;
replicating that here without the ability to test each one would be
shipping unverified claims, so it's a roadmap item — see
[docs/platform-portability.md](./docs/platform-portability.md) and
contributions are welcome.

## What it does

Three pieces:

- **`crewcut` skill** (always active once installed, default intensity
  `full`): before writing code, name any assumption the request forces you
  to make instead of picking silently; then apply the 7-rung YAGNI ladder;
  then touch only what the request requires (surgical changes); then
  define a verify step before calling it done. Toggle with
  `/crewcut lite|full|ultra` or `/crewcut off`, deactivate any time with
  "stop crewcut" or "normal mode".
- **`/crewcut-review`** — reviews a diff for both bloat (reinvented stdlib,
  dead flexibility, unneeded deps) and scope creep (unrequested refactors,
  silently-resolved ambiguity, orphaned code).
- **`/crewcut-plan`** — for non-trivial or ambiguous tasks, produces an
  explicit assumption list + numbered plan + per-step verify check before
  any file gets touched.

See [skills/crewcut/SKILL.md](./skills/crewcut/SKILL.md) for the full
ruleset.

## Benchmarks

See [benchmarks/](./benchmarks) for methodology and results. Short
version: on 3 deliberately underspecified coding tasks, agents without any
of these skills loaded picked a silent interpretation and wrote code 3/3
times; agents with `crewcut` loaded flagged the ambiguity in the same
response 3/3 times, at a comparable or smaller diff size. This is a small,
original benchmark measuring a different axis (assumption-surfacing rate)
than ponytail's published LOC/token/cost benchmarks — it doesn't
supersede them, it complements them.

## Credits

- [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) —
  YAGNI ladder, persistent-mode hook architecture, review-command format.
- [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) —
  assumption-surfacing, surgical-changes, and goal-driven-execution
  principles, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876)
  on LLM coding pitfalls.

Full per-file attribution: [NOTICE.md](./NOTICE.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Bug reports, platform ports, and
benchmark reproductions are all welcome — use
[Discussions](../../discussions) for design questions, Issues for bugs.

## License

MIT — see [LICENSE](./LICENSE). Portions adapted from third-party MIT
projects; see [NOTICE.md](./NOTICE.md) for their original license text.
