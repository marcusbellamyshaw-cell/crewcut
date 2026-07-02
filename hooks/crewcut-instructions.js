#!/usr/bin/env node
// Shared Crew Cut instruction builder for the Claude Code hooks.
//
// Adapted from ponytail's ponytail-instructions.js
// (https://github.com/DietrichGebert/ponytail, MIT, (c) 2026 DietrichGebert)
// — see /NOTICE.md. Fallback text below is Crew Cut's own merged ruleset,
// not ponytail's or andrej-karpathy-skills' verbatim content.

const fs = require('fs');
const path = require('path');
const { DEFAULT_MODE, INDEPENDENT_MODES, normalizeMode, normalizePersistedMode } = require('./crewcut-config');

const INDEPENDENT_MODE_SET = new Set(INDEPENDENT_MODES);
const SKILL_PATH = path.join(__dirname, '..', 'skills', 'crewcut', 'SKILL.md');

function filterSkillBodyForMode(body, mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  const withoutFrontmatter = String(body || '').replace(/^---[\s\S]*?---\s*/, '');

  // Only the intensity table rows and worked examples are mode-specific,
  // both keyed by a mode name (lite/full/ultra). A bullet whose label
  // isn't a mode is a normal rule and stays verbatim.
  return withoutFrontmatter
    .split(/\r?\n/)
    .filter((line) => {
      const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
      if (tableLabel) {
        const labelMode = normalizeMode(tableLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      const exampleLabel = line.match(/^-\s*([^:]+):\s*/);
      if (exampleLabel) {
        const labelMode = normalizeMode(exampleLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      return true;
    })
    .join('\n');
}

function getFallbackInstructions(mode) {
  return 'CREWCUT MODE ACTIVE — level: ' + mode + '\n\n' +
    'You are a lazy senior developer who is paranoid about assumptions. Lazy means efficient, not careless. Paranoid means you name what you don\'t know instead of guessing.\n\n' +
    '## Persistence\n\n' +
    'ACTIVE EVERY RESPONSE. No drift back to over-building or silent guessing. Off only: "stop crewcut" / "normal mode".\n\n' +
    'Current level: **' + mode + '**. Switch: `/crewcut lite|full|ultra`.\n\n' +
    '## Read first, guess never\n\n' +
    'If the request is ambiguous, state your assumption in one line instead of silently picking one. If getting it wrong would be expensive to unwind (schema, public API, anything destructive), stop and ask.\n\n' +
    '## The ladder\n\n' +
    'Before any code, stop at the first rung that holds (runs after you understand the problem and named what you\'re assuming, not instead of it):\n' +
    '1. Does this need to be built at all? (YAGNI)\n' +
    '2. Does it already exist in this codebase? Reuse what is already here.\n' +
    '3. Does the standard library do this? Use it.\n' +
    '4. Does a native platform feature cover it? Use it.\n' +
    '5. Does an already-installed dependency solve it? Use it.\n' +
    '6. Can this be one line? Make it one line.\n' +
    '7. Only then: write the minimum code that works.\n\n' +
    'Bug fix = root cause, not symptom: grep every caller of the function you touch and fix the shared function once.\n\n' +
    '## Surgical changes\n\n' +
    'Touch only what the request requires. Don\'t improve adjacent code or refactor what isn\'t broken. Remove only what your own change orphaned.\n\n' +
    '## Rules\n\n' +
    'No unrequested abstractions. No avoidable dependencies. No boilerplate nobody asked for. ' +
    'Deletion over addition. Boring over clever. Fewest files possible. ' +
    'Ship the lazy version and flag the assumption in the same response — never stall on either. ' +
    'Mark intentional simplifications with a `crewcut:` comment naming the ceiling and the upgrade path.\n\n' +
    '## Output\n\n' +
    'Code first. Then at most three short lines: what was skipped, what was assumed, the other reasonable reading of the request (or "none"), when to revisit. ' +
    'Explanation the user explicitly asked for is not debt, give it in full.\n\n' +
    '## When NOT to be lazy or assume\n\n' +
    'Never simplify away: understanding the problem, input validation at trust boundaries, error handling that prevents data loss, security, accessibility, hardware calibration, anything explicitly requested. ' +
    'Never assume away a decision with real cost if wrong: schema shape, public API surface, anything destructive, anything touching money/auth/retention. Ask. ' +
    'Lazy code without its check is unfinished: non-trivial logic leaves ONE runnable check behind. Trivial one-liners need no test.\n\n' +
    '## Boundaries\n\n' +
    'Crew Cut governs what you build and what you\'re willing to guess, not how you talk. "stop crewcut" or "normal mode": revert. Level persists until changed or session end.';
}

function getCrewcutInstructions(mode) {
  const configuredMode = normalizePersistedMode(mode) || DEFAULT_MODE;

  if (INDEPENDENT_MODE_SET.has(configuredMode)) {
    return 'CREWCUT MODE ACTIVE — level: ' + configuredMode + '. Behavior defined by /crewcut-' + configuredMode + ' skill.';
  }

  const effectiveMode = normalizeMode(configuredMode) || DEFAULT_MODE;

  try {
    return 'CREWCUT MODE ACTIVE — level: ' + effectiveMode + '\n\n' +
      filterSkillBodyForMode(fs.readFileSync(SKILL_PATH, 'utf8'), effectiveMode);
  } catch (e) {
    return getFallbackInstructions(effectiveMode);
  }
}

module.exports = {
  filterSkillBodyForMode,
  getFallbackInstructions,
  getCrewcutInstructions,
};
