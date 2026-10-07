#!/usr/bin/env node
'use strict';

/**
 * SonarQube rule coverage report for the in-house ESLint plugin.
 *
 * Usage:
 *   node scripts/sonar-coverage.cjs [--minimum <implemented>] [--minimum-tested <tested>]
 *                                   [--list-gaps] [--json]
 *
 * Exits non-zero when the implemented/tested counts are below the thresholds.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const TESTS_DIR = path.join(ROOT, 'plugins', 'local-sonar', 'tests');

const plugin = require(path.join(ROOT, 'plugins', 'local-sonar'));
const registry = require(path.join(ROOT, 'plugins', 'local-sonar', 'registry'));

function parseArgs(argv) {
  const options = {
    minimum: null,
    minimumTested: null,
    listGaps: false,
    json: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--minimum') {
      options.minimum = Number(argv[++i]);
    } else if (arg === '--minimum-tested') {
      options.minimumTested = Number(argv[++i]);
    } else if (arg === '--list-gaps') {
      options.listGaps = true;
    } else if (arg === '--json') {
      options.json = true;
    }
  }
  return options;
}

function collectTestedRuleKeys() {
  const tested = new Set();
  if (fs.existsSync(TESTS_DIR)) {
    for (const file of fs.readdirSync(TESTS_DIR)) {
      if (!file.endsWith('.js')) {
        continue;
      }
      const source = fs.readFileSync(path.join(TESTS_DIR, file), 'utf8');
      for (const match of source.matchAll(/\.run\(\s*['"](S\d+)['"]/g)) {
        tested.add(match[1]);
      }
    }
  }
  return tested;
}

function buildReport() {
  const rules = plugin.sonar.rules || [];
  const implemented = rules.filter(rule => Boolean(registry[rule.sKey]));
  const gaps = rules.filter(rule => !registry[rule.sKey]);
  const tested = collectTestedRuleKeys();
  const implementedNotTested = implemented.filter(
    rule => !tested.has(rule.sKey),
  );

  const bySeverityType = {};
  for (const rule of rules) {
    const bucket = `${rule.severity} ${rule.type}`;
    bySeverityType[bucket] = bySeverityType[bucket] || {
      total: 0,
      implemented: 0,
      gap: 0,
      tested: 0,
    };
    bySeverityType[bucket].total += 1;
    if (registry[rule.sKey]) {
      bySeverityType[bucket].implemented += 1;
    } else {
      bySeverityType[bucket].gap += 1;
    }
    if (tested.has(rule.sKey)) {
      bySeverityType[bucket].tested += 1;
    }
  }

  return {
    profile: plugin.sonar.profile,
    total: rules.length,
    implemented: implemented.length,
    gaps: gaps.length,
    tested: tested.size,
    implementedNotTested,
    gapRules: gaps,
    bySeverityType,
  };
}

function printReport(report, options) {
  const { profile } = report;
  console.log('SonarQube rule coverage (in-house ESLint plugin)');
  console.log(
    `Profile: ${profile.profileName || 'unknown'} (${profile.profileKey || 'n/a'})`,
  );
  console.log(
    `Rules: ${report.total} | implemented: ${report.implemented} | ` +
      `gaps: ${report.gaps} | with RuleTester tests: ${report.tested}`,
  );
  console.log('');
  console.log(
    ['Severity', 'Type', 'Total', 'Impl', 'Gap', 'Tested'].join('\t'),
  );
  const severityOrder = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'];
  for (const severity of severityOrder) {
    for (const type of [
      'BUG',
      'VULNERABILITY',
      'SECURITY_HOTSPOT',
      'CODE_SMELL',
    ]) {
      const bucket = report.bySeverityType[`${severity} ${type}`];
      if (!bucket) {
        continue;
      }
      console.log(
        [
          severity,
          type,
          bucket.total,
          bucket.implemented,
          bucket.gap,
          bucket.tested,
        ].join('\t'),
      );
    }
  }
  if (report.gapRules.length > 0) {
    console.log('');
    console.log(`Gap rules (${report.gapRules.length}): not yet implemented`);
    if (options.listGaps) {
      for (const rule of report.gapRules) {
        console.log(
          `  ${rule.sKey}\t${rule.severity}\t${rule.type}\t${rule.name}`,
        );
      }
    } else {
      console.log('  (run with --list-gaps for the full list)');
    }
  }
  if (report.implementedNotTested.length > 0) {
    console.log('');
    console.log(
      `Implemented but untested (${report.implementedNotTested.length}):`,
    );
    console.log(
      `  ${report.implementedNotTested.map(rule => rule.sKey).join(', ')}`,
    );
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = buildReport();

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          profile: report.profile,
          total: report.total,
          implemented: report.implemented,
          gaps: report.gaps,
          tested: report.tested,
          implementedNotTested: report.implementedNotTested.map(
            rule => rule.sKey,
          ),
          gapRules: report.gapRules.map(rule => ({
            key: rule.key,
            severity: rule.severity,
            type: rule.type,
            name: rule.name,
          })),
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  printReport(report, options);

  let failed = false;
  const minimum = options.minimum;
  if (typeof minimum === 'number' && report.implemented < minimum) {
    console.error(
      `\nFAIL: implemented rules ${report.implemented} < required ${minimum}`,
    );
    failed = true;
  }
  const minimumTested = options.minimumTested;
  if (typeof minimumTested === 'number' && report.tested < minimumTested) {
    console.error(
      `\nFAIL: tested rules ${report.tested} < required ${minimumTested}`,
    );
    failed = true;
  }
  process.exit(failed ? 1 : 0);
}

main();
