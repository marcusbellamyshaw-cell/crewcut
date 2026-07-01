#!/usr/bin/env node
// crewcut — shared runtime state (native Claude Code only for v1; see
// docs/agent-portability.md for why other platforms aren't wired up yet).
//
// Adapted from ponytail (https://github.com/DietrichGebert/ponytail, MIT,
// (c) 2026 DietrichGebert) — see /NOTICE.md.

const fs = require('fs');
const path = require('path');
const { getClaudeDir } = require('./crewcut-config');

const STATE_FILE = '.crewcut-active';
const statePath = path.join(getClaudeDir(), STATE_FILE);

function setMode(mode) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, mode);
}

function clearMode() {
  try { fs.unlinkSync(statePath); } catch (e) {}
}

// Live mode written by activate/mode-tracker. Absent flag = crewcut off.
function readMode() {
  try {
    return fs.readFileSync(statePath, 'utf8').trim() || null;
  } catch (e) {
    return null;
  }
}

function writeHookOutput(event, mode, context = '') {
  // SessionStart accepts raw stdout; SubagentStart needs the
  // hookSpecificOutput JSON form or the context is dropped.
  if (event === 'SubagentStart') {
    process.stdout.write(JSON.stringify(
      { hookSpecificOutput: { hookEventName: event, additionalContext: context } }));
    return;
  }
  process.stdout.write(context);
}

module.exports = {
  clearMode,
  readMode,
  setMode,
  writeHookOutput,
};
