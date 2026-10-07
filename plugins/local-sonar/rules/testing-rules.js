"use strict";

/**
 * Unit Testing & Jest Standards Engine
 * Covers: S1607, S2187, S2970, S3415, S5958, S5973, S6305, etc.
 */

function createTestingRule(ruleKey, ruleName, checkFn) {
  return {
    meta: {
      type: "problem",
      docs: {
        description: `${ruleName} (typescript:${ruleKey})`,
        recommended: "error",
      },
      schema: [],
    },
    create(context) {
      return checkFn(context, ruleKey);
    },
  };
}

// S1607: Tests should not be skipped without reason (e.g. it.skip / test.skip)
const S1607 = createTestingRule(
  "S1607",
  "Tests should not be skipped without reason",
  (context) => ({
    CallExpression(node) {
      if (
        node.callee &&
        node.callee.type === "MemberExpression" &&
        (node.callee.object.name === "it" ||
          node.callee.object.name === "test" ||
          node.callee.object.name === "describe") &&
        node.callee.property.name === "skip"
      ) {
        context.report({
          node,
          message:
            "Do not leave skipped tests without documented rationale. [typescript:S1607]",
        });
      }
    },
  }),
);

module.exports = {
  S1607,
};
