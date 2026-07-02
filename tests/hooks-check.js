#!/usr/bin/env node
// Runnable check for the hook state machine (v0.2.0 dead-zone fix and
// statusline nudge states). No framework: node tests/hooks-check.js
// Uses a throwaway CLAUDE_CONFIG_DIR so it never touches real state.

const assert = require('assert');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const HOOKS = path.join(__dirname, '..', 'hooks');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'crewcut-check-'));
const env = { ...process.env, CLAUDE_CONFIG_DIR: tmp, CREWCUT_DEFAULT_MODE: '' };
delete env.CREWCUT_DEFAULT_MODE;

const flagPath = path.join(tmp, '.crewcut-active');
const run = (script, input) =>
  execFileSync('node', [path.join(HOOKS, script)], { env, input: input || '' }).toString();

// 1. Fresh install (no flag file): subagent hook falls back to default 'full'.
let out = run('crewcut-subagent.js');
assert(out.includes('CREWCUT MODE ACTIVE'), 'fresh install: subagent should inject default mode');

// 2. Configured default off: subagent injects nothing.
out = execFileSync('node', [path.join(HOOKS, 'crewcut-subagent.js')],
  { env: { ...env, CREWCUT_DEFAULT_MODE: 'off' } }).toString();
assert.strictEqual(out, '', 'default off: subagent should inject nothing');

// 3. /crewcut off writes an explicit 'off' (not a deletion) and it sticks.
run('crewcut-mode-tracker.js', JSON.stringify({ prompt: '/crewcut off' }));
assert.strictEqual(fs.readFileSync(flagPath, 'utf8').trim(), 'off', 'off must be persisted, not cleared');
out = run('crewcut-subagent.js');
assert.strictEqual(out, '', 'explicit off: subagent must stay silent despite default full');

// 4. "stop crewcut" deactivation phrase also persists off.
run('crewcut-mode-tracker.js', JSON.stringify({ prompt: '/crewcut ultra' }));
run('crewcut-mode-tracker.js', JSON.stringify({ prompt: 'stop crewcut' }));
assert.strictEqual(fs.readFileSync(flagPath, 'utf8').trim(), 'off', 'deactivation phrase must persist off');

// 5. Activate: nudges statusline setup once, then respects the marker.
out = run('crewcut-activate.js');
assert(out.includes('STATUSLINE SETUP NEEDED'), 'first activate: setup nudge expected');
out = run('crewcut-activate.js');
assert(!out.includes('STATUSLINE SETUP NEEDED'), 'second activate: nudge must be marker-suppressed');

// 6. Stale crewcut statusline path: always re-nudges with UPDATE wording.
fs.writeFileSync(path.join(tmp, 'settings.json'), JSON.stringify({
  statusLine: { type: 'command', command: 'powershell -File "C:\\old\\0.0.1\\hooks\\crewcut-statusline.ps1"' },
}));
out = run('crewcut-activate.js');
assert(out.includes('STATUSLINE UPDATE NEEDED'), 'stale path: update nudge expected');

// 7. Foreign statusline: left alone, no nudge.
fs.writeFileSync(path.join(tmp, 'settings.json'), JSON.stringify({
  statusLine: { type: 'command', command: 'my-own-statusline.sh' },
}));
out = run('crewcut-activate.js');
assert(!out.includes('STATUSLINE'), 'foreign statusline: no nudge');

fs.rmSync(tmp, { recursive: true, force: true });
console.log('hooks-check: all 7 checks passed');
