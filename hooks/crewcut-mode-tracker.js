#!/usr/bin/env node
// crewcut — UserPromptSubmit hook to track which crewcut mode is active.
// Inspects user input for /crewcut commands and writes mode to the flag file.
//
// Adapted from ponytail (https://github.com/DietrichGebert/ponytail, MIT,
// (c) 2026 DietrichGebert) — see /NOTICE.md.

const { getDefaultMode, isDeactivationCommand } = require('./crewcut-config');
const { setMode, writeHookOutput } = require('./crewcut-runtime');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input.replace(/^﻿/, ''));
    const prompt = (data.prompt || '').trim().toLowerCase();

    if (/^[/@$]crewcut/.test(prompt)) {
      const parts = prompt.split(/\s+/);
      const cmd = parts[0].replace(/^[@$]/, '/');
      const arg = parts[1] || '';

      let mode = null;

      if (cmd === '/crewcut-review' || cmd === '/crewcut:crewcut-review') {
        mode = 'review';
      } else if (cmd === '/crewcut-plan' || cmd === '/crewcut:crewcut-plan') {
        mode = 'plan';
      } else if (cmd === '/crewcut' || cmd === '/crewcut:crewcut') {
        if (arg === 'lite') mode = 'lite';
        else if (arg === 'full') mode = 'full';
        else if (arg === 'ultra') mode = 'ultra';
        else if (arg === 'off') mode = 'off';
        else mode = getDefaultMode();
      }

      if (mode && mode !== 'off') {
        setMode(mode);
        writeHookOutput(
          'UserPromptSubmit',
          mode,
          'CREWCUT MODE CHANGED — level: ' + mode,
        );
      } else if (mode === 'off') {
        // Write 'off' rather than deleting the flag: an absent flag now means
        // "never activated" (fresh install) and falls back to the default, so
        // an explicit off must be persisted to be distinguishable from it.
        setMode('off');
        writeHookOutput('UserPromptSubmit', 'off', 'CREWCUT MODE OFF');
      }
    }

    if (isDeactivationCommand(prompt)) {
      setMode('off');
      writeHookOutput('UserPromptSubmit', 'off', 'CREWCUT MODE OFF');
    }
  } catch (e) {
    // Silent fail
  }
});
