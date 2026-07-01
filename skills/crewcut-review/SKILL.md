---
name: crewcut-review
description: >
  Code review focused on the two most common LLM diff failures: bloat and
  scope creep. Finds what to delete (reinvented standard library, unneeded
  dependencies, speculative abstractions) AND flags what shouldn't have been
  touched (adjacent refactors, silently-resolved ambiguity, unstated
  assumptions baked into the diff). One line per finding: location, tag,
  what to cut or reconsider. Use when the user says "review for
  over-engineering", "what can we delete", "did this touch more than it
  should", "is this over-engineered", "simplify review", "crewcut-review",
  or invokes /crewcut-review. Complements correctness-focused review; this
  one only hunts bloat and scope.
---

Review a diff for two things: what's bigger than it needs to be, and what's
wider than it should be. One line per finding: location, tag, what to cut
or reconsider, replacement if any. The diff's best outcome is getting
shorter *and* narrower.

## Format

`L<line>: <tag> <what>. <replacement or resolution>.`, or
`<file>:L<line>: ...` for multi-file diffs.

### Bloat tags (is the diff bigger than it needs to be)

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

### Scope tags (is the diff wider or shakier than it should be)

- `scope:` a changed line doesn't trace to the request — an unrequested refactor, drive-by formatting change, or "improvement" to adjacent code. Resolution: revert that hunk.
- `assume:` the diff silently resolves an ambiguity in the request (a naming choice, a data shape, an edge-case behavior) without a comment, a flagged assumption, or a question. Resolution: name the assumption inline or ask.
- `orphan:` an import, variable, or branch left behind by the change, or conversely a pre-existing unrelated dead bit that got swept up and deleted without being asked. Resolution: remove what your change orphaned; restore what it wasn't asked to touch.

## Examples

❌ "This EmailValidator class might be more complex than necessary, have you
considered whether all these validation rules are needed at this stage?"

✅ `L12-38: stdlib: 27-line validator class. "@" in email, 1 line, real validation is the confirmation mail.`

✅ `L4: native: moment.js imported for one format call. Intl.DateTimeFormat, 0 deps.`

✅ `repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.`

✅ `L52-71: delete: retry wrapper around an idempotent local call. Nothing replaces it.`

✅ `L30-44: shrink: manual loop builds dict. dict(zip(keys, values)), 1 line.`

✅ `L90-104: scope: reformatted the whole file while fixing one function. Revert the reflow, keep the fix.`

✅ `L15: assume: defaults \`archived: false\` for a field the request never mentioned. Confirm that's the intended default, or flag it in a comment.`

✅ `L200: orphan: \`oldHelper\` import left after inlining its only call. Remove the import.`

## Scoring

End with the two metrics that matter:
`net: -<N> lines possible, <M> scope violations, <K> unflagged assumptions.`

If there is nothing to cut and nothing out of scope, say `Lean and narrow.
Ship.` and stop.

## Boundaries

Scope: bloat and scope-creep only. Correctness bugs, security holes, and
performance are explicitly out of scope — route them to a normal review
pass, not this one. A single smoke test or `assert`-based self-check is the
crewcut minimum, not bloat; never flag it for deletion. A flagged
assumption that's already stated in a comment or PR description isn't an
`assume:` finding — only silent ones count. Does not apply the fixes, only
lists them. "stop crewcut-review" or "normal mode": revert to verbose
review style.
