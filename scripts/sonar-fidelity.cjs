#!/usr/bin/env node
'use strict';

/**
 * SonarQube fidelity report.
 *
 * Compares the findings of the in-house `local-sonar` ESLint rules with the
 * issues reported by the company SonarQube server for the same project/branch,
 * per rule, and prints a markdown report (plus a CI-friendly summary).
 *
 * Usage:
 *   node scripts/sonar-fidelity.cjs [--fail-over <n>] [--json] [--out <file>]
 *                                   [--local-json <eslint-json-file>]
 *
 * Environment:
 *   SONAR_HOST     e.g. https://sonarqube.example.com
 *   SONAR_TOKEN    user token with Browse permission
 *   SONAR_PROJECT  project key (default: my-project)
 *   SONAR_BRANCH   branch key (default: current git branch)
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const PAGE_SIZE = 500;

function parseArgs(argv) {
  const options = {
    failOver: null,
    json: false,
    out: null,
    localJson: null,
    help: false,
    localScope: 'src,App.tsx',
    includeTests: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--fail-over') {
      options.failOver = Number(argv[++index]);
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--out') {
      options.out = argv[++index];
    } else if (arg === '--local-json') {
      options.localJson = argv[++index];
    } else if (arg === '--local-scope') {
      options.localScope = argv[++index];
    } else if (arg === '--include-tests') {
      options.includeTests = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }
  return options;
}

function getCurrentBranch() {
  try {
    const head = fs
      .readFileSync(path.join(ROOT, '.git', 'HEAD'), 'utf8')
      .trim();
    return head.startsWith('ref: refs/heads/')
      ? head.slice('ref: refs/heads/'.length)
      : '';
  } catch {
    return '';
  }
}

async function fetchServerIssues(host, token, project, branch) {
  const perRule = new Map();
  let page = 1;
  let total;
  for (;;) {
    const url = new URL('/api/issues/search', host);
    url.searchParams.set('componentKeys', project);
    if (branch) {
      url.searchParams.set('branch', branch);
    }
    url.searchParams.set('resolved', 'false');
    url.searchParams.set('ps', String(PAGE_SIZE));
    url.searchParams.set('p', String(page));
    url.searchParams.set('f', 'rule,severity,type,component,line');
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(
        `SonarQube request failed: ${response.status} ${response.statusText}`,
      );
    }
    const payload = await response.json();
    total = payload.total || 0;
    for (const issue of payload.issues || []) {
      const entry = perRule.get(issue.rule) || {
        count: 0,
        severity: issue.severity,
        type: issue.type,
      };
      entry.count += 1;
      perRule.set(issue.rule, entry);
    }
    if ((payload.issues || []).length < PAGE_SIZE) {
      break;
    }
    page += 1;
  }
  return { total: total ?? 0, perRule };
}

function runLocalEslint() {
  const eslintBin = path.join(ROOT, 'node_modules', '.bin', 'eslint');
  const result = spawnSync(
    eslintBin,
    ['.', '--format', 'json', '--concurrency', 'auto'],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  );
  if (result.error) {
    throw result.error;
  }
  // ESLint exits 1 when there are findings; that is expected.
  const stdout = result.stdout || '';
  const start = stdout.indexOf('[');
  if (start === -1) {
    throw new Error(
      `ESLint produced no JSON output. stderr: ${(result.stderr || '').slice(0, 400)}`,
    );
  }
  return JSON.parse(stdout.slice(start));
}

function loadLocalResults(options) {
  if (options.localJson) {
    return JSON.parse(fs.readFileSync(options.localJson, 'utf8'));
  }
  return runLocalEslint();
}

function isInScope(filePath, options) {
  const relative = path.relative(ROOT, filePath).split(path.sep).join('/');
  const scope = (options.localScope || '')
    .split(',')
    .map(prefix => prefix.trim())
    .filter(Boolean);
  if (scope.length > 0) {
    const inScope = scope.some(
      prefix => relative === prefix || relative.startsWith(prefix + '/'),
    );
    if (!inScope) {
      return false;
    }
  }
  if (options.includeTests) {
    return true;
  }
  return !/(__tests__|.test.|.spec.|jest.setup|__mocks__)/.test(relative);
}

function collectLocalCounts(lintResults, options) {
  const perRule = new Map();
  for (const file of lintResults) {
    if (!isInScope(file.filePath, options)) {
      continue;
    }
    for (const message of file.messages) {
      if (!message.ruleId || !message.ruleId.startsWith('local-sonar/')) {
        continue;
      }
      const rule = `typescript:${message.ruleId.split('/')[1]}`;
      perRule.set(rule, (perRule.get(rule) || 0) + 1);
    }
  }
  return perRule;
}

function buildRows(serverPerRule, localPerRule) {
  const rules = new Set([...serverPerRule.keys(), ...localPerRule.keys()]);
  const rows = [];
  for (const rule of rules) {
    const server = serverPerRule.get(rule) || { count: 0 };
    const local = localPerRule.get(rule) || 0;
    rows.push({
      rule,
      server: server.count || 0,
      local,
      delta: (server.count || 0) - local,
      severity: server.severity || '',
      type: server.type || '',
    });
  }
  rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  return rows;
}

function buildMarkdown({
  host,
  project,
  branch,
  serverTotal,
  rows,
  localTotal,
}) {
  const lines = [
    '# SonarQube fidelity report',
    '',
    `- Host: ${host}`,
    `- Project: ${project}`,
    `- Branch: ${branch || '(none)'}`,
    `- Server unresolved issues: ${serverTotal}`,
    `- Local local-sonar findings: ${localTotal}`,
    `- Generated: ${new Date().toISOString()}`,
    '',
    '## Divergences (|delta| >= 3)',
    '',
    '| Rule | Server | Local | Delta | Type | Severity |',
    '| --- | ---: | ---: | ---: | --- | --- |',
  ];
  for (const row of rows) {
    if (Math.abs(row.delta) < 3) {
      continue;
    }
    lines.push(
      `| ${row.rule} | ${row.server} | ${row.local} | ${row.delta > 0 ? '+' : ''}${row.delta} | ${row.type} | ${row.severity} |`,
    );
  }
  const falseNegatives = rows.filter(row => row.delta > 0);
  const falsePositives = rows.filter(row => row.delta < 0);
  lines.push(
    '',
    '## Summary',
    '',
    `- Missed findings (server > local): ${falseNegatives.reduce((sum, row) => sum + row.delta, 0)} across ${falseNegatives.length} rules`,
    `- Extra findings (local > server): ${Math.abs(falsePositives.reduce((sum, row) => sum + row.delta, 0))} across ${falsePositives.length} rules`,
    '',
  );
  return lines.join('\n');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(
      'Usage: node scripts/sonar-fidelity.cjs [--fail-over <n>] [--json] [--out <file>] [--local-json <file>] [--local-scope src,App.tsx] [--include-tests]',
    );
    return;
  }

  const host = process.env.SONAR_HOST;
  const token = process.env.SONAR_TOKEN;
  const project = process.env.SONAR_PROJECT || 'my-project';
  const branch = process.env.SONAR_BRANCH || getCurrentBranch();

  if (!host || !token) {
    console.error(
      'FAIL: SONAR_HOST and SONAR_TOKEN environment variables are required',
    );
    process.exit(1);
  }

  console.error(`Fetching SonarQube issues for ${project} (${branch}) ...`);
  const { total: serverTotal, perRule: serverPerRule } =
    await fetchServerIssues(host, token, project, branch);

  console.error('Running local ESLint ...');
  const lintResults = loadLocalResults(options);
  const localPerRule = collectLocalCounts(lintResults, options);
  const localTotal = [...localPerRule.values()].reduce(
    (sum, count) => sum + count,
    0,
  );

  const rows = buildRows(serverPerRule, localPerRule);
  const report = {
    host,
    project,
    branch,
    serverTotal,
    localTotal,
    rows,
  };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const markdown = buildMarkdown({
      host,
      project,
      branch,
      serverTotal,
      rows,
      localTotal,
    });
    console.log(markdown);
    if (options.out) {
      fs.writeFileSync(options.out, markdown);
      console.error(`\nReport written to ${options.out}`);
    }
  }

  const missed = rows
    .filter(row => row.delta > 0)
    .reduce((sum, row) => sum + row.delta, 0);
  const failOver = options.failOver;
  if (typeof failOver === 'number' && missed > failOver) {
    console.error(
      `\nFAIL: ${missed} missed findings exceed --fail-over ${failOver}`,
    );
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
