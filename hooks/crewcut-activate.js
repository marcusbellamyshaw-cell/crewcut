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
const { clearMode, setMode, writeHookOutput } = require('./crewcut-runtime');

const claudeDir = getClaudeDir();
const settingsPath = path.join(claudeDir, 'settings.json');

const mode = getDefaultMode();

if (mode === 'off') {
  clearMode();
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
  let hasStatusline = false;
  if (fs.existsSync(settingsPath)) {
    const raw = fs.readFileSync(settingsPath, 'utf8').replace(/^﻿/, '');
    const settings = JSON.parse(raw);
    if (settings.statusLine) {
      hasStatusline = true;
    }
  }

  if (!hasStatusline) {
    const isWindows = process.platform === 'win32';
    const scriptName = isWindows ? 'crewcut-statusline.ps1' : 'crewcut-statusline.sh';
    const scriptPath = path.join(__dirname, scriptName);
    if (isShellSafe(scriptPath)) {
      const command = isWindows
        ? `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`
        : `bash "${scriptPath}"`;
      const statusLineSnippet =
        '"statusLine": { "type": "command", "command": ' + JSON.stringify(command) + ' }';
      output += "\n\n" +
        "STATUSLINE SETUP NEEDED: The crewcut plugin includes a statusline badge showing active mode " +
        "(e.g. [CREWCUT], [CREWCUT:ULTRA]). It is not configured yet. " +
        "To enable, add this to ~/.claude/settings.json: " +
        statusLineSnippet + " " +
        "Proactively offer to set this up for the user on first interaction.";
    } else {
      output += "\n\n" +
        "STATUSLINE SETUP NEEDED: The crewcut plugin includes a statusline badge showing active mode. " +
        "Its install path contains characters unsafe to embed in a shell command, so configure it manually: " +
        "add a statusLine command of type \"command\" that runs " + scriptName +
        " from the plugin's hooks directory to ~/.claude/settings.json, quoting/escaping the path for your shell. " +
        "Proactively offer to set this up for the user on first interaction.";
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
