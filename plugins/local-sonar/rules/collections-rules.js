"use strict";

/**
 * Collections, Arrays & Objects Engine
 * Covers: S2201, S2870, S3001, S4144, S108, S3984, S4030, S4125, S4158, etc.
 */

function createCollectionRule(ruleKey, ruleName, checkFn) {
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

// S2870: "delete" operator should not be used on arrays
const S2870 = createCollectionRule(
  "S2870",
  '"delete" operator should not be used on arrays',
  (context) => ({
    UnaryExpression(node) {
      if (node.operator === "delete" && node.argument) {
        if (
          node.argument.type === "MemberExpression" &&
          node.argument.computed &&
          node.argument.property?.type === "Literal" &&
          typeof node.argument.property.value === "number"
        ) {
          context.report({
            node,
            message:
              'Use "Array#splice()" instead of "delete" operator on arrays. [typescript:S2870]',
          });
        }
      }
    },
  }),
);

// S3001: "delete" operator should not be used on variables
const S3001 = createCollectionRule(
  "S3001",
  '"delete" operator should not be used on variables',
  (context) => ({
    UnaryExpression(node) {
      if (node.operator === "delete" && node.argument?.type === "Identifier") {
        context.report({
          node,
          message:
            'Do not use "delete" on variables or identifiers. [typescript:S3001]',
        });
      }
    },
  }),
);

// S4144: Duplicate keys in object literals should not be used
const S4144 = createCollectionRule(
  "S4144",
  "Duplicate keys in object literals should not be used",
  (context) => ({
    ObjectExpression(node) {
      const seen = new Set();
      for (const prop of node.properties || []) {
        const key = prop.key?.name || prop.key?.value;
        if (key) {
          if (seen.has(key)) {
            context.report({
              node: prop.key,
              message: `Duplicate key "${key}" in object literal. [typescript:S4144]`,
            });
          } else {
            seen.add(key);
          }
        }
      }
    },
  }),
);

// S108: Empty block statements should not be used
const S108 = createCollectionRule(
  "S108",
  "Empty block statements should not be used",
  (context) => ({
    BlockStatement(node) {
      if (
        node.body?.length === 0 &&
        !node.parent?.type.includes("Catch") &&
        node.parent?.type !== "ArrowFunctionExpression" &&
        node.parent?.type !== "FunctionExpression" &&
        node.parent?.type !== "FunctionDeclaration"
      ) {
        context.report({
          node,
          message: "Empty block statement. [typescript:S108]",
        });
      }
    },
  }),
);

// S2201: Unused expressions should not be used
const S2201 = createCollectionRule(
  "S2201",
  "Unused expressions should not be used",
  (context) => ({
    ExpressionStatement(node) {
      if (
        node.directive ||
        (node.expression?.type === "Literal" &&
          node.expression.value === "use strict")
      ) {
        return;
      }
      if (
        node.expression?.type === "Identifier" ||
        (node.expression?.type === "Literal" &&
          typeof node.expression.value !== "string")
      ) {
        context.report({
          node,
          message:
            "Expected an assignment or function call and instead saw an expression. [typescript:S2201]",
        });
      }
    },
  }),
);

// S2871: "Array.prototype.sort()" and "Array.prototype.toSorted()" should use a compare function
const S2871 = createCollectionRule(
  "S2871",
  '"Array.prototype.sort()" and "Array.prototype.toSorted()" should use a compare function',
  (context) => ({
    CallExpression(node) {
      const callee = node.callee;
      if (
        callee?.type === "MemberExpression" &&
        !callee.computed &&
        callee.property?.type === "Identifier" &&
        (callee.property.name === "sort" ||
          callee.property.name === "toSorted") &&
        node.arguments.length === 0
      ) {
        context.report({
          node,
          message: `Provide a compare function to "${callee.property.name}()". [typescript:S2871]`,
        });
      }
    },
  }),
);

module.exports = {
  S2870,
  S3001,
  S4144,
  S108,
  S2201,
  S2871,
};
