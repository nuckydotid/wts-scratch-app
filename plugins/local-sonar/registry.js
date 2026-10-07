"use strict";

const fs = require("node:fs");
const path = require("node:path");

/**
 * Auto-discovers rule implementations from ./rules/*.js. Every named export
 * matching /^S\d+$/ is registered. Duplicate keys across files are a hard
 * error: a Sonar rule must have exactly one implementation.
 */

const RULES_DIR = path.resolve(__dirname, "rules");

const registry = {};

for (const file of fs
  .readdirSync(RULES_DIR)
  .sort((a, b) => a.localeCompare(b))) {
  if (!file.endsWith(".js")) {
    continue;
  }
  const moduleExports = require(path.join(RULES_DIR, file));
  for (const [ruleName, rule] of Object.entries(moduleExports)) {
    if (!/^S\d+$/.test(ruleName)) {
      continue;
    }
    if (registry[ruleName]) {
      throw new Error(
        `Duplicate local-sonar implementation for ${ruleName}: ` +
          `${registry[ruleName].file} and ${file}`,
      );
    }
    registry[ruleName] = { rule, file };
  }
}

module.exports = registry;
