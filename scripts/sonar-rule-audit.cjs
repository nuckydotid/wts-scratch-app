#!/usr/bin/env node
'use strict';

/**
 * Audits the in-house Sonar rule implementations against the server catalog.
 *
 * Flags implementations whose `meta.docs.description` differs from the rule
 * name in `plugins/local-sonar/active_ts_rules.json` (wording drift or a
 * different rule entirely) so they can be reviewed against the server
 * description.
 *
 * Usage:
 *   node scripts/sonar-rule-audit.cjs [--out <file>] [--json] [--check]
 *
 * `--check` exits 1 when any mismatch is found (for CI ratcheting).
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const catalog = require(
  path.join(ROOT, 'plugins/local-sonar/active_ts_rules.json'),
);
const registry = require(path.join(ROOT, 'plugins/local-sonar/registry'));

function parseArgs(argv) {
  const options = { out: null, json: false, check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--out') {
      options.out = argv[++index];
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--check') {
      options.check = true;
    }
  }
  return options;
}

function buildReport() {
  const catalogName = {};
  for (const rule of catalog.rules || []) {
    const match = /(S\d+)/i.exec(rule.key);
    if (match) {
      catalogName[match[1].toUpperCase()] = rule.name;
    }
  }

  const rows = [];
  for (const [ruleKey, entry] of Object.entries(registry)) {
    const expected = catalogName[ruleKey];
    if (!expected) {
      continue;
    }
    const actual = entry.rule.meta?.docs?.description?.replace(
      /\s*\(typescript:S\d+\)\s*$/,
      '',
    );
    if (actual !== expected) {
      rows.push({
        rule: ruleKey,
        catalog: expected,
        implementation: actual,
        file: entry.file,
      });
    }
  }
  rows.sort((a, b) => a.rule.localeCompare(b.rule));
  return rows;
}

function buildMarkdown(rows) {
  const lines = [
    '# Sonar rule implementation audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Implementations whose description differs from the server catalog: ${rows.length}`,
    '',
    '| Rule | Catalog name | Local implementation description | File |',
    '| --- | --- | --- | --- |',
  ];
  for (const row of rows) {
    lines.push(
      `| ${row.rule} | ${row.catalog} | ${row.implementation} | ${row.file} |`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const rows = buildReport();

  if (options.json) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    const markdown = buildMarkdown(rows);
    if (options.out) {
      fs.writeFileSync(path.resolve(ROOT, options.out), markdown);
      console.error(`Report written to ${options.out}`);
    } else {
      console.log(markdown);
    }
  }

  if (options.check && rows.length > 0) {
    console.error(
      `FAIL: ${rows.length} rule descriptions differ from the catalog`,
    );
    process.exit(1);
  }
}

main();
