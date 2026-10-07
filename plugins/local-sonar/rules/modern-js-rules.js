"use strict";

const { isRegExpLiteral, getRegExpFlags } = require("../utils/ast-helpers");

/**
 * Modern JavaScript & ES2021+ Standards Engine
 * Covers: S7781, S6594, S6557, S6959, S3696, S6583, S7718, S7719, S7720, S6958,
 * S3799, S3800, S6509, S6635, S6637, S3626, etc.
 */

function createModernRule(ruleKey, ruleName, checkFn) {
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

// S7781: Prefer replaceAll() over replace() with global regex
const S7781 = createModernRule(
  "S7781",
  'Strings should use "replaceAll()" instead of "replace()" with global regex',
  (context) => ({
    CallExpression(node) {
      if (
        node.callee?.type === "MemberExpression" &&
        node.callee.property?.type === "Identifier" &&
        node.callee.property.name === "replace" &&
        node.arguments?.length >= 2
      ) {
        const firstArg = node.arguments[0];
        if (isRegExpLiteral(firstArg)) {
          const flags = getRegExpFlags(firstArg);
          if (flags?.includes("g")) {
            context.report({
              node: node.callee.property,
              message:
                'Prefer "String#replaceAll()" over "String#replace()" with global regex. [typescript:S7781]',
            });
          }
        }
      }
    },
  }),
);

// S6594: Prefer RegExp.exec() over String.match()
const S6594 = createModernRule(
  "S6594",
  'Prefer "RegExp.exec()" over "String.match()" for single match extraction',
  (context) => ({
    CallExpression(node) {
      if (
        node.callee?.type === "MemberExpression" &&
        node.callee.property?.type === "Identifier" &&
        node.callee.property.name === "match" &&
        node.arguments?.length === 1
      ) {
        const arg = node.arguments[0];
        if (isRegExpLiteral(arg)) {
          const flags = getRegExpFlags(arg);
          if (!flags?.includes("g")) {
            context.report({
              node: node.callee.property,
              message:
                'Use "RegExp.exec()" instead of "String.match()". [typescript:S6594]',
            });
          }
        }
      }
    },
  }),
);

// S6557: Prefer startsWith() and endsWith()
const S6557 = createModernRule(
  "S6557",
  'Prefer "String#startsWith()" and "String#endsWith()" over "indexOf() === 0" or regex',
  (context) => ({
    BinaryExpression(node) {
      if (node.operator === "===" || node.operator === "==") {
        const isLeftZero =
          node.left.type === "Literal" && node.left.value === 0;
        const isRightZero =
          node.right.type === "Literal" && node.right.value === 0;

        let callNode = null;
        if (isLeftZero) {
          callNode = node.right;
        } else if (isRightZero) {
          callNode = node.left;
        }
        if (
          callNode?.type === "CallExpression" &&
          callNode.callee?.type === "MemberExpression" &&
          callNode.callee.property?.name === "indexOf"
        ) {
          context.report({
            node,
            message:
              'Use "String#startsWith()" instead of checking "indexOf() === 0". [typescript:S6557]',
          });
        }
      }
    },
  }),
);

// S6959: Array.reduce() should have an initial value
const S6959 = createModernRule(
  "S6959",
  'Provide an initial value when calling "Array.reduce()"',
  (context) => ({
    CallExpression(node) {
      if (
        node.callee?.type === "MemberExpression" &&
        node.callee.property?.type === "Identifier" &&
        node.callee.property.name === "reduce" &&
        node.arguments?.length === 1
      ) {
        context.report({
          node: node.callee.property,
          message:
            'Provide an initial value when calling "Array.reduce()". [typescript:S6959]',
        });
      }
    },
  }),
);

// S3696: Throw Error objects instead of string literals
const S3696 = createModernRule(
  "S3696",
  "Throw Error objects instead of literals",
  (context) => ({
    ThrowStatement(node) {
      if (
        node.argument?.type === "Literal" ||
        node.argument?.type === "TemplateLiteral"
      ) {
        context.report({
          node,
          message:
            'Throw an "Error" object instead of a literal value. [typescript:S3696]',
        });
      }
    },
  }),
);

function hasMixedEnumMemberTypes(members) {
  if (!members || members.length <= 1) {
    return false;
  }
  let hasString = false;
  let hasNumber = false;
  for (const member of members) {
    if (member.initializer?.type === "Literal") {
      const val = member.initializer.value;
      if (typeof val === "string") {
        hasString = true;
      }
      if (typeof val === "number") {
        hasNumber = true;
      }
    } else if (!member.initializer) {
      hasNumber = true;
    }
  }
  return hasString && hasNumber;
}

// S6583: Enums should not have mixed string and numeric members
const S6583 = createModernRule(
  "S6583",
  "Enums should have either all string or all numeric members",
  (context) => ({
    TSEnumDeclaration(node) {
      if (hasMixedEnumMemberTypes(node.members)) {
        context.report({
          node,
          message:
            "Enums should not contain both numeric and string values. [typescript:S6583]",
        });
      }
    },
  }),
);

// S7718: Catch clause error parameters naming (e.g. error, err, e)
const S7718 = createModernRule(
  "S7718",
  "Error parameters in catch clauses should follow consistent naming convention",
  (context) => ({
    CatchClause(node) {
      if (node.param?.type === "Identifier") {
        const name = node.param.name;
        if (!/^(e|err|error|_error|_err|_e)$/i.test(name)) {
          context.report({
            node: node.param,
            message: `Catch parameter "${name}" should follow standard naming (e.g. "error", "err", "e"). [typescript:S7718]`,
          });
        }
      }
    },
  }),
);

// S7719: Date objects should be cloned directly without calling "getTime()"
const S7719 = createModernRule(
  "S7719",
  'Date objects should be cloned directly without calling "getTime()"',
  (context) => ({
    NewExpression(node) {
      if (
        node.callee?.type === "Identifier" &&
        node.callee.name === "Date" &&
        node.arguments?.length === 1
      ) {
        const arg = node.arguments[0];
        if (
          arg?.type === "CallExpression" &&
          arg.callee?.type === "MemberExpression" &&
          arg.callee.property?.name === "getTime"
        ) {
          context.report({
            node: arg,
            message:
              'Clone Date directly with "new Date(originalDate)" instead of calling ".getTime()". [typescript:S7719]',
          });
        }
      }
    },
  }),
);

// S7720: Ternary expressions in array spreads should use consistent types
const S7720 = createModernRule(
  "S7720",
  "Ternary expressions in array spreads should use consistent types",
  (context) => ({
    SpreadElement(node) {
      if (node.argument?.type === "ConditionalExpression") {
        const { consequent, alternate } = node.argument;
        const isConsequentArray = consequent?.type === "ArrayExpression";
        const isAlternateArray = alternate?.type === "ArrayExpression";
        if (isConsequentArray !== isAlternateArray) {
          context.report({
            node: node.argument,
            message:
              "Both branches of a ternary inside array spread should evaluate to arrays or elements consistently. [typescript:S7720]",
          });
        }
      }
    },
  }),
);

// S6958: Literals should not be used as functions
const S6958 = createModernRule(
  "S6958",
  "Literals should not be used as functions",
  (context) => ({
    CallExpression(node) {
      if (
        node.callee?.type === "Literal" ||
        node.callee?.type === "ArrayExpression" ||
        (node.callee?.type === "ObjectExpression" && !node.callee.properties)
      ) {
        context.report({
          node: node.callee,
          message:
            "Literals and primitive values cannot be called as functions. [typescript:S6958]",
        });
      }
    },
  }),
);

// S3799: Destructuring patterns should not be empty
const S3799 = createModernRule(
  "S3799",
  "Destructuring patterns should not be empty",
  (context) => ({
    ObjectPattern(node) {
      if (node.properties?.length === 0) {
        context.report({
          node,
          message:
            "Unexpected empty object destructuring pattern. [typescript:S3799]",
        });
      }
    },
    ArrayPattern(node) {
      if (node.elements?.length === 0) {
        context.report({
          node,
          message:
            "Unexpected empty array destructuring pattern. [typescript:S3799]",
        });
      }
    },
  }),
);

// S3800: Return statements should not contain assignments
const S3800 = createModernRule(
  "S3800",
  "Return statements should not contain assignments",
  (context) => ({
    ReturnStatement(node) {
      if (node.argument?.type === "AssignmentExpression") {
        context.report({
          node: node.argument,
          message:
            'Assignment expression inside "return" statement. [typescript:S3800]',
        });
      }
    },
    ArrowFunctionExpression(node) {
      if (node.body?.type === "AssignmentExpression") {
        context.report({
          node: node.body,
          message:
            "Assignment expression inside arrow function return. [typescript:S3800]",
        });
      }
    },
  }),
);

// S6509: Redundant double-negation boolean cast
const S6509 = createModernRule(
  "S6509",
  "Redundant double-negation boolean cast should be removed",
  (context) => ({
    UnaryExpression(node) {
      if (
        node.operator === "!" &&
        node.argument?.type === "UnaryExpression" &&
        node.argument.operator === "!" &&
        node.parent?.type === "IfStatement" &&
        node.parent.test === node
      ) {
        context.report({
          node,
          message:
            'Redundant double-negation "!!" in boolean context. [typescript:S6509]',
        });
      }
    },
  }),
);

// S6635: Class constructors should not return values
const S6635 = createModernRule(
  "S6635",
  "Class constructors should not return values",
  (context) => ({
    MethodDefinition(node) {
      if (node.kind === "constructor" && node.value?.body?.body) {
        for (const stmt of node.value.body.body) {
          if (stmt.type === "ReturnStatement" && stmt.argument) {
            context.report({
              node: stmt,
              message:
                "Constructors should not return a value. [typescript:S6635]",
            });
          }
        }
      }
    },
  }),
);

// S6637: Arrow functions should not be bound with .bind()
const S6637 = createModernRule(
  "S6637",
  "Arrow functions should not be bound with .bind()",
  (context) => ({
    CallExpression(node) {
      if (
        node.callee?.type === "MemberExpression" &&
        node.callee.property?.name === "bind" &&
        node.callee.object?.type === "ArrowFunctionExpression"
      ) {
        context.report({
          node,
          message:
            'Arrow functions cannot be bound with ".bind()". [typescript:S6637]',
        });
      }
    },
  }),
);

// S3626: Redundant return statements at the end of function
const S3626 = createModernRule(
  "S3626",
  "Redundant return statements at the end of function should be removed",
  (context) => ({
    FunctionDeclaration(node) {
      if (node.body?.type === "BlockStatement" && node.body.body?.length > 0) {
        const last = node.body.body.at(-1);
        if (last?.type === "ReturnStatement" && !last.argument) {
          context.report({
            node: last,
            message:
              "Redundant return statement at the end of function. [typescript:S3626]",
          });
        }
      }
    },
  }),
);

// S4624: Template literals should not be nested
function isNestedTemplateLiteral(node) {
  let parent = node.parent;
  while (parent) {
    if (
      parent.type === "FunctionDeclaration" ||
      parent.type === "FunctionExpression" ||
      parent.type === "ArrowFunctionExpression"
    ) {
      break;
    }
    if (parent.type === "TemplateLiteral") {
      return true;
    }
    parent = parent.parent;
  }
  return false;
}

const S4624 = createModernRule(
  "S4624",
  "Template literals should not be nested",
  (context) => ({
    TemplateLiteral(node) {
      if (isNestedTemplateLiteral(node)) {
        context.report({
          node,
          message:
            "Refactor this code to not use nested template literals. [typescript:S4624]",
        });
      }
    },
  }),
);

// S3812: Parentheses should be used when negating "in" and "instanceof" operations
const S3812 = createModernRule(
  "S3812",
  'Parentheses should be used when negating "in" and "instanceof" operations',
  (context) => {
    const sourceCode = context.sourceCode;

    function isParenthesized(node) {
      return sourceCode.text[node.range[0] - 1] === "(";
    }

    return {
      BinaryExpression(node) {
        if (node.operator !== "in" && node.operator !== "instanceof") {
          return;
        }
        const left = node.left;
        if (!left || left.type !== "UnaryExpression" || left.operator !== "!") {
          return;
        }
        if (isParenthesized(left)) {
          return;
        }
        context.report({
          node,
          message: `Add parentheses to clarify the negation applied to "${node.operator}". [typescript:S3812]`,
        });
      },
    };
  },
);

module.exports = {
  S7781,
  S3812,
  S6594,
  S6557,
  S6959,
  S3696,
  S6583,
  S7718,
  S7719,
  S7720,
  S6958,
  S3799,
  S3800,
  S6509,
  S6635,
  S6637,
  S3626,
  S4624,
};
