#!/usr/bin/env node
'use strict';

/**
 * Keeps the committed SonarQube profile exports in sync with the server.
 *
 * Files:
 *   plugins/local-sonar/active_ts_rules.json  catalog metadata (fetched without `f`)
 *   plugins/local-sonar/actives.json          quality profile activations (`f=actives`)
 *
 * Usage:
 *   node scripts/sync-sonar-rules.cjs --check          validate committed files (merge-safe, offline)
 *   node scripts/sync-sonar-rules.cjs --fetch          re-download both files from SonarQube
 *
 * Env for --fetch:
 *   SONAR_HOST     e.g. https://sonarqube.example.com
 *   SONAR_TOKEN    user token with Browse permission
 *   SONAR_PROFILE  quality profile key (default: Sonar way TypeScript)
 */

const fs = require('node:fs');
const nodeCrypto = require('node:crypto');
const path = require('node:path');

const CATALOG_PATH = path.resolve(
  __dirname,
  '..',
  'plugins',
  'local-sonar',
  'active_ts_rules.json',
);
const ACTIVES_PATH = path.resolve(
  __dirname,
  '..',
  'plugins',
  'local-sonar',
  'actives.json',
);
const DEFAULT_PROFILE = 'AYH61Cmiiuox7L-sLgDE';
const PAGE_SIZE = 500;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha256(filePath) {
  return nodeCrypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

function ruleKeySet(payload) {
  return new Set((payload.rules || []).map(rule => rule.key));
}

function check() {
  const problems = [];

  if (!fs.existsSync(CATALOG_PATH)) {
    problems.push(`missing catalog file: ${CATALOG_PATH}`);
  }
  if (!fs.existsSync(ACTIVES_PATH)) {
    problems.push(`missing actives file: ${ACTIVES_PATH}`);
  }
  if (problems.length > 0) {
    problems.forEach(problem => console.error(`  - ${problem}`));
    process.exit(1);
  }

  const catalog = readJson(CATALOG_PATH);
  const actives = readJson(ACTIVES_PATH);

  const catalogKeys = ruleKeySet(catalog);
  const activations = actives.actives || {};
  const activationKeys = new Set(
    Object.keys(activations).filter(ruleKey =>
      Array.isArray(activations[ruleKey])
        ? activations[ruleKey].length > 0
        : Boolean(activations[ruleKey]),
    ),
  );

  const onlyCatalog = [...catalogKeys].filter(key => !activationKeys.has(key));
  const onlyActives = [...activationKeys].filter(key => !catalogKeys.has(key));

  if (catalog.total !== catalogKeys.size) {
    problems.push(
      `catalog total (${catalog.total}) != unique rule keys (${catalogKeys.size})`,
    );
  }
  if (actives.total !== activationKeys.size) {
    problems.push(
      `actives total (${actives.total}) != activated rules (${activationKeys.size})`,
    );
  }
  if (onlyCatalog.length > 0) {
    problems.push(
      `${onlyCatalog.length} catalog rule(s) have no profile activation ` +
        `(first: ${onlyCatalog[0]})`,
    );
  }
  if (onlyActives.length > 0) {
    problems.push(
      `${onlyActives.length} activated rule(s) are missing from the catalog ` +
        `(first: ${onlyActives[0]})`,
    );
  }

  const profileKeys = Object.keys(actives.qProfiles || {});
  if (profileKeys.length !== 1) {
    problems.push(
      `expected exactly one quality profile in actives.json, found ${profileKeys.length}`,
    );
  }

  console.log('SonarQube profile export check');
  console.log(
    `  catalog:  ${catalogKeys.size} rules  sha256=${sha256(CATALOG_PATH)}`,
  );
  console.log(
    `  actives:  ${activationKeys.size} activations  sha256=${sha256(ACTIVES_PATH)}`,
  );
  for (const profileKey of profileKeys) {
    const profile = actives.qProfiles[profileKey];
    console.log(`  profile:  ${profile.name} (${profileKey}, ${profile.lang})`);
  }

  if (problems.length > 0) {
    console.error('\nFAIL: profile exports are inconsistent');
    problems.forEach(problem => console.error(`  - ${problem}`));
    process.exit(1);
  }
  console.log('\nOK: profile exports are consistent');
}

async function sonarGet(host, token, pathname, params) {
  const url = new URL(pathname, host);
  for (const [key, value] of Object.entries(params || {})) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(
      `SonarQube request failed: ${response.status} ${response.statusText} for ${url.pathname}`,
    );
  }
  return response.json();
}

async function fetchAllPages(host, token, params) {
  const rules = [];
  const actives = {};
  const qProfiles = {};
  let page = 1;
  for (;;) {
    const payload = await sonarGet(host, token, '/api/rules/search', {
      ...params,
      ps: String(PAGE_SIZE),
      p: String(page),
    });
    rules.push(...(payload.rules || []));
    Object.assign(actives, payload.actives || {});
    Object.assign(qProfiles, payload.qProfiles || {});
    const paging = payload.paging || {};
    const total = paging.total || rules.length;
    if (rules.length >= total || (payload.rules || []).length === 0) {
      return { total, rules, actives, qProfiles };
    }
    page += 1;
  }
}

async function fetchFromServer() {
  const host = process.env.SONAR_HOST;
  const token = process.env.SONAR_TOKEN;
  const profile = process.env.SONAR_PROFILE || DEFAULT_PROFILE;

  if (!host || !token) {
    console.error(
      'FAIL: --fetch requires SONAR_HOST and SONAR_TOKEN environment variables',
    );
    process.exit(1);
  }

  console.log(`Fetching rule catalog from ${host} ...`);
  // Metadata call: omit `f` so every default field is returned (actives excluded).
  const metadata = await fetchAllPages(host, token, {
    languages: 'ts',
    activation: 'true',
    qprofile: profile,
  });

  console.log('Fetching quality profile activations ...');
  const actives = await fetchAllPages(host, token, {
    languages: 'ts',
    activation: 'true',
    qprofile: profile,
    actives: 'true',
    f: 'actives',
  });

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(metadata));
  fs.writeFileSync(
    ACTIVES_PATH,
    JSON.stringify({
      total: actives.total,
      p: 1,
      ps: PAGE_SIZE,
      rules: actives.rules.map(rule => ({
        key: rule.key,
        type: rule.type,
        impacts: rule.impacts || [],
      })),
      actives: actives.actives,
      qProfiles: actives.qProfiles,
      paging: { pageIndex: 1, pageSize: PAGE_SIZE, total: actives.total },
    }),
  );

  console.log(`Wrote ${CATALOG_PATH}`);
  console.log(`Wrote ${ACTIVES_PATH}`);
  check();
}

const mode = process.argv.includes('--fetch') ? 'fetch' : 'check';

if (mode === 'fetch') {
  fetchFromServer().catch(error => {
    console.error(`FAIL: ${error.message}`);
    process.exit(1);
  });
} else {
  check();
}
