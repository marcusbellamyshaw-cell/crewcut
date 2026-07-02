#!/usr/bin/env node
// crewcut — Claude Code SessionStart activation hook
//
// Runs on every session start:
//   1. Writes flag file at $CLAUDE_CONFIG_DIR/.crewcut-active (statusline reads this)
//   2. Emits the crewcut ruleset as hidden SessionStart context
//   3. Detects missing statusline config and emits a setup nudge
//
// Adapted from ponytail (https://github.com/DietrichGebert/ponytail, MIT,
// (c) 2026 DietrichGebert) — see /NOTICE.md.

const fs = require('fs');
const path = require('path');
const { getDefaultMode, getClaudeDir, isShellSafe } = require('./crewcut-config');
const { getCrewcutInstructions } = require('./crewcut-instructions');
const { setMode, writeHookOutput } = require('./crewcut-runtime');

const claudeDir = getClaudeDir();
const settingsPath = path.join(claudeDir, 'settings.json');

const mode = getDefaultMode();

if (mode === 'off') {
  // Persist 'off' rather than deleting the flag — absent now means "never
  // activated" and consumers fall back to the default, so off must be written.
  try { setMode('off'); } catch (e) {}
  writeHookOutput('SessionStart', 'off', 'OK');
  process.exit(0);
}

try {
  setMode(mode);
} catch (e) {
  // Silent fail — flag is best-effort, don't block the hook
}

let output = getCrewcutInstructions(mode);

try {
  const isWindows = process.platform === 'win32';
  const scriptName = isWindows ? 'crewcut-statusline.ps1' : 'crewcut-statusline.sh';
  const scriptPath = path.join(__dirname, scriptName);
  const nudgeMarkerPath = path.join(claudeDir, '.crewcut-statusline-nudged');

  let statusLineCommand = '';
  if (fs.existsSync(settingsPath)) {
    const raw = fs.readFileSync(settingsPath, 'utf8').replace(/^﻿/, '');
    const settings = JSON.parse(raw);
    if (settings.statusLine) {
      statusLineCommand = typeof settings.statusLine.command === 'string'
        ? settings.statusLine.command
        : 'non-command statusline'; // present but not ours to touch
    }
  }

  // Three states: no statusline (nudge once per install path, marker-gated),
  // a crewcut statusline pointing at another install path (stale after a
  // version upgrade moved the cache dir — always nudge, it's silently broken),
  // or a working/foreign statusline (leave alone).
  const isCrewcutStatusline = /crewcut-statusline/.test(statusLineCommand);
  const isStale = isCrewcutStatusline && !statusLineCommand.includes(__dirname);

  let alreadyNudged = false;
  try {
    alreadyNudged = fs.readFileSync(nudgeMarkerPath, 'utf8').trim() === scriptPath;
  } catch (e) {}

  const needsNudge = isStale || (!statusLineCommand && !alreadyNudged);

  if (needsNudge) {
    const intro = isStale
      ? "STATUSLINE UPDATE NEEDED: The statusLine in ~/.claude/settings.json points at a previous " +
        "crewcut install path that no longer matches this version, so the badge is silently broken. "
      : "STATUSLINE SETUP NEEDED: The crewcut plugin includes a statusline badge showing active mode " +
        "(e.g. [CREWCUT], [CREWCUT:ULTRA]). It is not configured yet. ";

    if (isShellSafe(scriptPath)) {
      const command = isWindows
        ? `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`
        : `bash "${scriptPath}"`;
      const statusLineSnippet =
        '"statusLine": { "type": "command", "command": ' + JSON.stringify(command) + ' }';
      output += "\n\n" + intro +
        (isStale ? "Update the statusLine entry to: " : "To enable, add this to ~/.claude/settings.json: ") +
        statusLineSnippet + " " +
        "Proactively offer to set this up for the user on first interaction.";
    } else {
      output += "\n\n" + intro +
        "The install path contains characters unsafe to embed in a shell command, so configure it manually: " +
        "set a statusLine command of type \"command\" that runs " + scriptName +
        " from the plugin's hooks directory in ~/.claude/settings.json, quoting/escaping the path for your shell. " +
        "Proactively offer to set this up for the user on first interaction.";
    }

    if (!isStale) {
      // One nudge per install path for first-time setup; a stale path keeps
      // nudging because the badge stays broken until it's fixed.
      try { fs.writeFileSync(nudgeMarkerPath, scriptPath); } catch (e) {}
    }
  }
} catch (e) {
  // Silent fail — don't block session start over statusline detection
}

try {
  writeHookOutput('SessionStart', mode, output);
} catch (e) {
  // Silent fail — stdout closed/EPIPE at hook exit must not surface as a hook failure
}
