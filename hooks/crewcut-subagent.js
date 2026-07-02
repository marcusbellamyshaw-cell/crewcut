#!/usr/bin/env node
// crewcut — Claude Code SubagentStart hook
//
// SessionStart context is parent-thread only and never reaches subagents,
// so without this every Task-spawned agent runs crewcut-unaware. When
// crewcut mode is active, inject the same ruleset into each subagent.
//
// Adapted from ponytail (https://github.com/DietrichGebert/ponytail, MIT,
// (c) 2026 DietrichGebert) — see /NOTICE.md.

const { getDefaultMode } = require('./crewcut-config');
const { getCrewcutInstructions } = require('./crewcut-instructions');
const { readMode, writeHookOutput } = require('./crewcut-runtime');

// Absent flag = never activated (fresh install before any SessionStart, since
// /reload-plugins fires no SessionStart) — fall back to the configured default
// so the plugin works immediately after install. An explicit "off" was written
// by the mode tracker and is respected.
const mode = readMode() || getDefaultMode();

if (mode === 'off') {
  process.exit(0);
}

try {
  writeHookOutput('SubagentStart', mode, getCrewcutInstructions(mode));
} catch (e) {
  // Silent fail — a stdout error at hook exit must not surface as a hook failure.
}
