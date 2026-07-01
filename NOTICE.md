# Third-party attributions

Crew Cut is a synthesis of ideas and, in the hook plumbing, adapted code
from two prior MIT-licensed projects. This file exists to satisfy both
projects' MIT license terms ("The above copyright notice and this
permission notice shall be included in all copies or substantial portions
of the Software") and to give credit precisely, per-file.

## ponytail

**Repository:** https://github.com/DietrichGebert/ponytail
**Author:** Dietrich Gebert
**License:** MIT

The persistent "always-active mode" mechanism (SessionStart/SubagentStart/
UserPromptSubmit hooks, the mode flag file, the statusline badge, and the
config resolution order) is adapted from ponytail's hook implementation.
The following files in this repository are directly adapted from
ponytail's equivalents, renamed and edited (Codex/Copilot support
removed, `plan` mode added, comments updated), with the original logic and
structure intact:

- `hooks/crewcut-config.js` ← `hooks/ponytail-config.js`
- `hooks/crewcut-runtime.js` ← `hooks/ponytail-runtime.js`
- `hooks/crewcut-instructions.js` ← `hooks/ponytail-instructions.js` (the
  `getFallbackInstructions` ruleset text is original to Crew Cut; the
  surrounding mode-filtering logic is adapted)
- `hooks/crewcut-activate.js` ← `hooks/ponytail-activate.js`
- `hooks/crewcut-mode-tracker.js` ← `hooks/ponytail-mode-tracker.js`
- `hooks/crewcut-subagent.js` ← `hooks/ponytail-subagent.js`
- `hooks/crewcut-statusline.ps1` ← `hooks/ponytail-statusline.ps1`
- `hooks/crewcut-statusline.sh` ← `hooks/ponytail-statusline.sh`
- `hooks/claude-hooks.json` ← `hooks/claude-codex-hooks.json` (Codex/Copilot
  matchers removed)

The `skills/crewcut/SKILL.md` "ladder" (rungs 1–7), the root-cause-fix
rule, and the intensity-level (lite/full/ultra) structure are adapted from
ponytail's `skills/ponytail/SKILL.md`, rewritten and extended with the
assumption-gate, surgical-changes, and goal-driven-execution material
described below. `skills/crewcut-review/SKILL.md`'s bloat tags (`delete:`,
`stdlib:`, `native:`, `yagni:`, `shrink:`) and scoring format are adapted
from ponytail's `skills/ponytail-review/SKILL.md`.

### ponytail license (MIT)

```
MIT License

Copyright (c) 2026 DietrichGebert

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## andrej-karpathy-skills

**Repository:** https://github.com/multica-ai/andrej-karpathy-skills
**Author:** forrestchang (multica-ai)
**License:** MIT

The "assumption gate" (Crew Cut's "0. Read first, guess never" section),
the "Surgical Changes" section, and the "Goal-driven execution" section in
`skills/crewcut/SKILL.md` are rewritten from and extend the four
principles in andrej-karpathy-skills' `CLAUDE.md` / `skills/
karpathy-guidelines/SKILL.md` — specifically "Think Before Coding",
"Surgical Changes", and "Goal-Driven Execution" (its "Simplicity First"
principle overlaps with ponytail's ladder and was not separately
duplicated). The `skills/crewcut-plan/SKILL.md` skill operationalizes
"Think Before Coding" + "Goal-Driven Execution" as an invokable planning
step, which neither source project ships as a standalone skill.

### andrej-karpathy-skills license (MIT, as declared in its README)

```
MIT License

Copyright (c) 2026 forrestchang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

(andrej-karpathy-skills ships no LICENSE file in its repository at the time
of writing; the MIT text above is reproduced from its README's "## License"
section, which declares "MIT".)
