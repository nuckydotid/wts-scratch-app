"use strict";

const normalizeModule = require("./normalize");
const registry = require("./registry");

/**
 * Builds the ESLint plugin rule set for the company SonarQube TypeScript
 * profile.
 *
 * Every active server rule is registered:
 * - rules with a real implementation in ./rules are exposed as-is;
 * - rules still missing an implementation are registered as tracked no-ops
 *   (meta.docs.notImplemented = true). They never report findings and are
 *   counted by scripts/sonar-coverage.cjs until implemented.
 *
 * The previous generic heuristic fallbacks were removed: they could report
 * findings under an unrelated Sonar rule ID.
 */

function createNotImplementedRule(ruleMeta) {
  return {
    meta: {
      type: "problem",
      docs: {
        description: `${ruleMeta.name} (typescript:${ruleMeta.sKey})`,
        recommended: "error",
        notImplemented: true,
      },
      schema: [],
    },
    create() {
      return {};
    },
  };
}

const normalized = normalizeModule.loadNormalized();
const allRules = {};

for (const ruleMeta of normalized.rules) {
  const implementation = registry[ruleMeta.sKey];
  allRules[ruleMeta.sKey] = implementation
    ? implementation.rule
    : createNotImplementedRule(ruleMeta);
}

const activeKeys = new Set(normalized.rules.map((rule) => rule.sKey));
const orphanImplementations = Object.keys(registry).filter(
  (ruleKey) => !activeKeys.has(ruleKey),
);
if (orphanImplementations.length > 0) {
  // Not fatal: the rule may have been deactivated server-side. The coverage
  // script surfaces this so the implementation can be removed or re-checked.
  console.warn(
    `[local-sonar] ${orphanImplementations.length} implemented rule(s) are not ` +
      `in the active profile: ${orphanImplementations.join(", ")}`,
  );
}

const recommendedRules = Object.fromEntries(
  Object.keys(allRules).map((ruleKey) => [`local-sonar/${ruleKey}`, "error"]),
);

module.exports = {
  meta: {
    name: "eslint-plugin-local-sonar",
    version: "4.0.0",
  },
  rules: allRules,
  sonar: {
    profile: normalized.meta,
    rules: normalized.rules,
    implementedCount: normalized.rules.reduce(
      (count, rule) => count + (registry[rule.sKey] ? 1 : 0),
      0,
    ),
    totalCount: normalized.rules.length,
  },
  configs: {
    recommended: {
      plugins: {
        "local-sonar": {
          rules: allRules,
        },
      },
      rules: recommendedRules,
    },
    strictErrors: recommendedRules,
  },
};
