---
name: crewcut-plan
description: >
  Turns a task into an explicit assumption list, a numbered plan, and a
  verify step per item — before any code gets written. Use for non-trivial
  or ambiguous requests before implementing: multi-file changes, unclear
  requirements, anything where guessing wrong is expensive to undo. Use
  when the user says "plan this out", "what's your plan", "crewcut-plan",
  invokes /crewcut-plan, or asks for a task to be scoped before starting.
  Not for trivial single-line fixes or fully-specified requests — those
  skip straight to crewcut's ladder.
---

Produce three short sections, in order, before touching any file. This is
the planning half of Crew Cut: it exists because "think before coding" and
"define success criteria" are easy principles to state and easy to skip
under time pressure. Making them a checklist is what makes them stick.

## 1. Assumptions

One line per ambiguity in the request, each resolved:

`<what's ambiguous> → assuming <resolution> (cheap to be wrong about | ask if wrong)`

If the request is fully specified, write `No ambiguity — spec is complete.`
and move on. Don't invent ambiguity to fill the section.

Anything tagged "ask if wrong" — a schema/API shape, anything destructive,
anything touching money/auth/retention — gets asked about now, not after
the plan ships. Stop and ask before section 2 if any such item exists.

## 2. Plan

Numbered steps, each with its own verify:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Keep steps at the size of one reviewable diff. A step with no verify isn't
a step, it's a hope — merge it into a neighbor or add the check. Prefer the
fewest steps that are each independently checkable over many tiny ones.

## 3. Ladder note

One line: which rung of the crewcut ladder (YAGNI / reuse / stdlib /
native / installed dep / one-liner / minimum code) each step is expected to
land on, only where it's not obvious. Skip this section entirely if every
step is plainly "minimum code that works."

## After the plan

Execute the plan under crewcut rules (ladder, surgical changes, output
discipline). Re-run `crewcut-plan` only if new ambiguity surfaces mid-task
that changes the shape of remaining steps — don't re-plan for its own sake.

## Boundaries

One-shot planning artifact, not a running mode — it doesn't persist across
turns the way `/crewcut` does. Doesn't apply fixes or write code, only
scopes the work. Skip this skill entirely for trivial, fully-specified,
single-file asks; forcing a plan onto a one-liner is itself the kind of
overhead crewcut exists to cut.
