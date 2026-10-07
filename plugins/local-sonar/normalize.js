"use strict";

const fs = require("node:fs");
const path = require("node:path");

/**
 * Merges the SonarQube catalog export (active_ts_rules.json) with the quality
 * profile activations (actives.json) into a single normalized model.
 *
 * - active_ts_rules.json is fetched without `f` so it contains every metadata
 *   field (descriptions/examples/params defaults), but no `actives`.
 * - actives.json is fetched with `f=actives` and carries the profile severity
 *   and configured parameter values for the "Sonar way" TypeScript profile.
 */

const CATALOG_PATH = path.resolve(__dirname, "active_ts_rules.json");
const ACTIVES_PATH = path.resolve(__dirname, "actives.json");

const EXAMPLE_REGEX =
  /<pre[^>]*data-diff-type="(noncompliant|compliant)"[^>]*>([\s\S]*?)<\/pre>/g;

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function decodeHtml(text) {
  return text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

function extractExamples(descriptionSections) {
  const examples = { compliant: [], noncompliant: [] };
  for (const section of descriptionSections || []) {
    const content = section.content || "";
    EXAMPLE_REGEX.lastIndex = 0;
    let match = EXAMPLE_REGEX.exec(content);
    while (match !== null) {
      const code = decodeHtml(match[2].replaceAll(/<[^>]+>/g, "")).trim();
      if (code) {
        examples[match[1]].push(code);
      }
      match = EXAMPLE_REGEX.exec(content);
    }
  }
  return examples;
}

function buildRuleMeta(rule) {
  const match = /(S\d+)/i.exec(rule.key);
  if (!match) {
    return null;
  }
  const sysTags = rule.sysTags || [];
  return {
    key: rule.key,
    sKey: match[1].toUpperCase(),
    name: rule.name,
    type: rule.type,
    scope: rule.scope,
    sysTags,
    typeDependent: sysTags.includes("type-dependent"),
    defaultSeverity: rule.severity,
    defaultParams: Object.fromEntries(
      (rule.params || []).map((param) => [param.key, param.defaultValue]),
    ),
    cleanCodeAttribute: rule.cleanCodeAttribute,
    cleanCodeAttributeCategory: rule.cleanCodeAttributeCategory,
    impacts: rule.impacts || [],
    examples: extractExamples(rule.descriptionSections),
    severity: rule.severity,
    activeParams: {},
    profileKey: null,
  };
}

function getActivation(entry) {
  if (Array.isArray(entry)) {
    return entry[0] || null;
  }
  if (entry && Array.isArray(entry.actives)) {
    return entry.actives[0] || null;
  }
  return null;
}

function applyActivation(rule, entry) {
  const activation = getActivation(entry);
  if (!rule || !activation) {
    return;
  }
  rule.severity = activation.severity || rule.defaultSeverity;
  rule.activeParams = Object.fromEntries(
    (activation.params || []).map((param) => [param.key, param.value]),
  );
  rule.profileKey = activation.qProfile || null;
}

function normalize({ catalog, actives }) {
  const byKey = new Map();
  for (const rule of catalog.rules || []) {
    const ruleMeta = buildRuleMeta(rule);
    if (ruleMeta) {
      byKey.set(ruleMeta.key, ruleMeta);
    }
  }

  const qProfiles = actives.qProfiles || {};
  const profileKey = Object.keys(qProfiles)[0] || null;

  for (const [ruleKey, entry] of Object.entries(actives.actives || {})) {
    applyActivation(byKey.get(ruleKey), entry);
  }

  const profile = profileKey ? qProfiles[profileKey] : null;
  return {
    meta: {
      profileKey,
      profileName: profile ? profile.name : null,
      total: byKey.size,
    },
    rules: [...byKey.values()],
  };
}

function loadNormalized(options) {
  const settings = options ?? {};
  return normalize({
    catalog: loadJson(settings.catalogPath || CATALOG_PATH),
    actives: loadJson(settings.activesPath || ACTIVES_PATH),
  });
}

module.exports = {
  loadNormalized,
  normalize,
  extractExamples,
  decodeHtml,
  CATALOG_PATH,
  ACTIVES_PATH,
};
