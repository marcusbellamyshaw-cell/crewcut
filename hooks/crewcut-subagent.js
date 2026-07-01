#!/usr/bin/env node
// crewcut — Claude Code SubagentStart hook
//
// SessionStart context is parent-thread only and never reaches subagents,
// so without this every Task-spawned agent runs crewcut-unaware. When
// crewcut mode is active, inject the same ruleset into each subagent.
//
// Adapted from ponytail (https://github.com/DietrichGebert/ponytail, MIT,
// (c) 2026 DietrichGebert) — see /NOTICE.md.

const { getCrewcutInstructions } = require('./crewcut-instructions');
const { readMode, writeHookOutput } = require('./crewcut-runtime');

const mode = readMode();

if (!mode || mode === 'off') {
  process.exit(0);
}

try {
  writeHookOutput('SubagentStart', mode, getCrewcutInstructions(mode));
} catch (e) {
  // Silent fail — a stdout error at hook exit must not surface as a hook failure.
}
