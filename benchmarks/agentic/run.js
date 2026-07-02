#!/usr/bin/env node
// Automated benchmark harness for crewcut's assumption-surfacing axes.
//
// Modeled on ponytail's benchmarks/agentic/ harness (run.py --selftest
// pattern, plugin-dir arm isolation, deterministic graders proven before
// any API spend; https://github.com/DietrichGebert/ponytail, MIT,
// (c) 2026 DietrichGebert — see /NOTICE.md). The self-check grader's
// detection regex is adapted from ponytail's behavior.js "onecheck" probe.
//
//   node run.js --selftest
//       Prove every grader on canned good/bad outputs. No API, no spend.
//       Run first, always.
//
//   node run.js --runs 3 [--arms baseline,crewcut,ponytail]
//       Live run through headless `claude -p` sessions (spends API).
//       Arm isolation: --setting-sources project excludes globally-enabled
//       plugins, then --plugin-dir loads exactly one plugin per arm — the
//       same technique ponytail's harness uses. Results are written to
//       runs/<stamp>.json for hand inspection.
//
// Graded axes (deterministic, from benchmarks/README.md's rubric):
//   codeLines         lines inside fenced code blocks
//   assumptionFlagged an explicit assumed:/assumption(s): marker, not just prose
//   altReading        a named second interpretation (other reading:/vs.)
//   selfCheck         a runnable assert/test left behind
//
// The altReading grader keys on crewcut >=0.2.0's mandatory "other reading:"
// output slot plus common judge-able phrasings; treat sub-threshold scores on
// non-crewcut arms as "verify by hand", not as a hard zero.

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const TASKS = [
  { id: 'mergeUserPrefs', prompt: 'Write a function `mergeUserPrefs(defaults, overrides)` that merges a user\'s preference overrides into the app defaults.' },
  { id: 'retryFetch', prompt: 'Write a function `retryFetch(url)` that fetches a URL and retries on failure.' },
  { id: 'formatName', prompt: 'Write a function `formatName(user)` that returns a user\'s display name for the UI.' },
];

const PREAMBLE = 'Respond with code only for the following task. Do not explore any codebase or read/write any files — treat this as a standalone code snippet request, not tied to any project. Give your best implementation plus whatever brief explanation you\'d normally include.\n\nTask: ';

const PLUGIN_CACHE = path.join(os.homedir(), '.claude', 'plugins', 'cache');

function pluginDir(name) {
  const envOverride = process.env[name.toUpperCase() + '_PLUGIN_DIR'];
  if (envOverride) return envOverride;
  const base = path.join(PLUGIN_CACHE, name, name);
  const versions = fs.existsSync(base)
    ? fs.readdirSync(base).filter((v) => fs.statSync(path.join(base, v)).isDirectory()).sort()
    : [];
  if (!versions.length) {
    throw new Error(`${name} plugin dir not found under ${base}; install it or set ${name.toUpperCase()}_PLUGIN_DIR`);
  }
  return path.join(base, versions[versions.length - 1]);
}

// Arms resolve lazily so a missing ponytail install can't block a crewcut run.
const ARMS = {
  baseline: () => ({ args: [] }),
  crewcut: () => ({ args: ['--plugin-dir', pluginDir('crewcut')] }),
  ponytail: () => ({ args: ['--plugin-dir', pluginDir('ponytail')] }),
};

// --- graders ---

function codeOf(text) {
  return [...String(text || '').matchAll(/```[\w-]*\r?\n([\s\S]*?)```/g)].map((m) => m[1]).join('\n');
}

function proseOf(text) {
  return String(text || '').replace(/```[\s\S]*?```/g, ' ');
}

const GRADERS = {
  codeLines(output) {
    return codeOf(output).split('\n').filter((l) => l.trim()).length;
  },
  // Explicitly flagged, not merely explained: an assumed:/assumption(s): marker.
  assumptionFlagged(output) {
    return /\bassum(ed|ption[s]?)\s*:/i.test(output) ? 1 : 0;
  },
  // A named second interpretation of the request.
  altReading(output) {
    const p = proseOf(output);
    return /other reading\s*:|alternative interpretation|second (reasonable )?(reading|interpretation)|\bvs\.\s|if you (actually )?(want|meant)/i.test(p) ? 1 : 0;
  },
  // Adapted from ponytail behavior.js "onecheck" (credited in header).
  selfCheck(output) {
    return /\bassert\b|def\s+test_|if\s+__name__|unittest|pytest|console\.assert|\bexpect\(|\bdescribe\(|\bit\(/.test(output) ? 1 : 0;
  },
};

function grade(output) {
  const scores = {};
  for (const [name, fn] of Object.entries(GRADERS)) scores[name] = fn(output);
  return scores;
}

// --- selftest: prove the graders before any spend ---

const SELFTEST = [
  {
    name: 'crewcut-style output',
    text: '```js\nconst x = 1;\nconsole.assert(x === 1);\n```\nskipped: nothing, assumed: shallow merge, other reading: deep merge, confirm when prefs nest.',
    expect: { assumptionFlagged: 1, altReading: 1, selfCheck: 1 },
  },
  {
    name: 'karpathy-style output',
    text: '**Assumptions:**\n- deep merge\n\n```js\nconst y = 2;\n```\nIf you actually want a shallow merge, say so.',
    expect: { assumptionFlagged: 1, altReading: 1, selfCheck: 0 },
  },
  {
    name: 'baseline-style output',
    text: '```js\nfunction f() { return 1; }\n```\nNotes: I chose a deep merge because preferences are often nested.',
    expect: { assumptionFlagged: 0, altReading: 0, selfCheck: 0 },
  },
  {
    name: 'assert inside code is a self-check even without prose',
    text: '```python\ndef test_f():\n    assert f() == 1\n```',
    expect: { assumptionFlagged: 0, altReading: 0, selfCheck: 1 },
  },
];

function selftest() {
  let failed = 0;
  for (const t of SELFTEST) {
    const scores = grade(t.text);
    for (const [axis, want] of Object.entries(t.expect)) {
      if (scores[axis] !== want) {
        console.error(`FAIL ${t.name} :: ${axis} = ${scores[axis]}, want ${want}`);
        failed++;
      }
    }
  }
  const c = GRADERS.codeLines(SELFTEST[0].text);
  if (c !== 2) { console.error(`FAIL codeLines = ${c}, want 2`); failed++; }
  if (failed) { console.error(`selftest: ${failed} failure(s)`); process.exit(1); }
  console.log('selftest: all graders pass');
}

// --- live run ---

function runCell(arm, task) {
  const { args } = ARMS[arm]();
  const out = execFileSync('claude', [
    '-p', PREAMBLE + task.prompt,
    '--output-format', 'json',
    '--setting-sources', 'project',
    ...args,
  ], { timeout: 300000, encoding: 'utf8' });
  const parsed = JSON.parse(out);
  return { text: parsed.result || '', costUsd: parsed.total_cost_usd, durationMs: parsed.duration_ms };
}

function live(arms, runs) {
  const results = [];
  for (let r = 1; r <= runs; r++) {
    for (const arm of arms) {
      for (const task of TASKS) {
        process.stderr.write(`run ${r}/${runs} ${arm}/${task.id}... `);
        try {
          const cell = runCell(arm, task);
          results.push({ run: r, arm, task: task.id, ...grade(cell.text), costUsd: cell.costUsd, durationMs: cell.durationMs, text: cell.text });
          process.stderr.write('ok\n');
        } catch (e) {
          results.push({ run: r, arm, task: task.id, error: String(e.message || e) });
          process.stderr.write('ERROR\n');
        }
      }
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(__dirname, 'runs');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  for (const arm of arms) {
    const cells = results.filter((x) => x.arm === arm && !x.error);
    if (!cells.length) { console.log(`${arm}: all cells errored`); continue; }
    const sum = (k) => cells.reduce((a, c) => a + c[k], 0);
    console.log(`${arm}: assumptionFlagged ${sum('assumptionFlagged')}/${cells.length}, altReading ${sum('altReading')}/${cells.length}, selfCheck ${sum('selfCheck')}/${cells.length}, median codeLines ${cells.map((c) => c.codeLines).sort((a, b) => a - b)[Math.floor(cells.length / 2)]}`);
  }
  console.log(`full results: ${outPath}`);
}

// --- cli ---

const argv = process.argv.slice(2);
if (argv.includes('--selftest')) {
  selftest();
} else {
  const armsArg = argv[argv.indexOf('--arms') + 1];
  const arms = argv.includes('--arms') ? armsArg.split(',') : ['baseline', 'crewcut'];
  const runs = argv.includes('--runs') ? parseInt(argv[argv.indexOf('--runs') + 1], 10) : 1;
  for (const a of arms) if (!ARMS[a]) { console.error(`unknown arm: ${a}`); process.exit(1); }
  live(arms, runs);
}
