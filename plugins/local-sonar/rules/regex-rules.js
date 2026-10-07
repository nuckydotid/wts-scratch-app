"use strict";

const BACKSLASH = String.fromCharCode(92);

const { isRegExpLiteral, getRegExpPattern } = require("../utils/ast-helpers");
const { checkAnchorPrecedence } = require("../utils/regex-helpers");

/**
 * Regular Expressions AST Engine
 * Covers: S5850, S6397, S6326, S6035, S6331, S6323, S6325, S5856, S2639, S5868, etc.
 */

function createRegexRule(ruleKey, ruleName, checkFn) {
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

// S5850: Strict anchor operator precedence
const S5850 = createRegexRule(
  "S5850",
  "Operator precedence should be explicit in regular expressions containing anchors",
  (context) => ({
    Literal(node) {
      if (isRegExpLiteral(node)) {
        const pattern = getRegExpPattern(node);
        const result = checkAnchorPrecedence(pattern);
        if (!result.isCompliant) {
          context.report({
            node,
            message: result.message,
          });
        }
      }
    },
  }),
);

// S6397: Single-character character classes should be simplified (e.g. [a] -> a)
const S6397 = createRegexRule(
  "S6397",
  "Single-character character classes should be simplified",
  (context) => ({
    Literal(node) {
      if (isRegExpLiteral(node)) {
        const pattern = getRegExpPattern(node);
        if (/\[([a-zA-Z0-9])\]/.test(pattern)) {
          context.report({
            node,
            message:
              "Simplify single-character character class by removing brackets. [typescript:S6397]",
          });
        }
      }
    },
  }),
);

// S6326: Multiple spaces in regex should use quantifiers
const S6326 = createRegexRule(
  "S6326",
  "Multiple consecutive spaces in regex should use quantifiers",
  (context) => ({
    Literal(node) {
      if (isRegExpLiteral(node)) {
        const pattern = getRegExpPattern(node);
        if (/ {2,}/.test(pattern)) {
          context.report({
            node,
            message:
              'Use a quantifier like " {n}" instead of multiple consecutive spaces. [typescript:S6326]',
          });
        }
      }
    },
  }),
);

// S6035: Single-character alternations should use character classes (e.g. a|b -> [ab])
const S6035 = createRegexRule(
  "S6035",
  "Single-character alternations should use character classes",
  (context) => ({
    Literal(node) {
      if (isRegExpLiteral(node)) {
        const pattern = getRegExpPattern(node);
        if (/\b([a-zA-Z0-9])\|([a-zA-Z0-9])\b/.test(pattern)) {
          context.report({
            node,
            message:
              'Use a character class like "[ab]" instead of single-character alternation "a|b". [typescript:S6035]',
          });
        }
      }
    },
  }),
);

// S6331: Regular expressions should not contain empty groups
function stripCharacterClasses(pattern) {
  let result = "";
  let inClass = false;
  let index = 0;
  while (index < pattern.length) {
    const char = pattern[index];
    if (char === BACKSLASH) {
      const next = pattern[index + 1];
      result += next ? `\\${next}` : char;
      index += 2;
      continue;
    }
    if (char === "[" && !inClass) {
      inClass = true;
      result += "[]";
      index += 1;
      continue;
    }
    if (char === "]" && inClass) {
      inClass = false;
      index += 1;
      continue;
    }
    if (!inClass) {
      result += char;
    }
    index += 1;
  }
  return result;
}

const S6331 = createRegexRule(
  "S6331",
  "Regular expressions should not contain empty groups",
  (context) => ({
    Literal(node) {
      if (isRegExpLiteral(node)) {
        const pattern = getRegExpPattern(node);
        // Ignore character classes: "()" inside "[...]" is not a group.
        const withoutCharClasses = stripCharacterClasses(pattern);
        if (
          /\(\)/.test(withoutCharClasses) ||
          /\(\?:\)/.test(withoutCharClasses)
        ) {
          context.report({
            node,
            message:
              "Remove empty group in regular expression. [typescript:S6331]",
          });
        }
      }
    },
  }),
);

// S6323: Alternation in regular expressions should not contain empty alternatives
const S6323 = createRegexRule(
  "S6323",
  "Alternation in regular expressions should not contain empty alternatives",
  (context) => ({
    Literal(node) {
      if (isRegExpLiteral(node)) {
        const pattern = getRegExpPattern(node);
        if (
          pattern.startsWith("|") ||
          pattern.endsWith("|") ||
          pattern.includes("||")
        ) {
          context.report({
            node,
            message:
              "Remove empty alternative in regular expression. [typescript:S6323]",
          });
        }
      }
    },
  }),
);

// S6325: Prefer regex literals over RegExp constructor with static strings
const S6325 = createRegexRule(
  "S6325",
  'Prefer regular expression literals over "RegExp" constructor with static string',
  (context) => ({
    NewExpression(node) {
      if (
        node.callee.type === "Identifier" &&
        node.callee.name === "RegExp" &&
        node.arguments.length >= 1 &&
        node.arguments[0].type === "Literal" &&
        typeof node.arguments[0].value === "string"
      ) {
        context.report({
          node,
          message:
            'Use a regular expression literal instead of "new RegExp()". [typescript:S6325]',
        });
      }
    },
  }),
);

// S5856: Regular expressions should be syntactically valid
function isValidRegExp(pattern) {
  try {
    return Boolean(new RegExp(pattern));
  } catch {
    return false;
  }
}

const S5856 = createRegexRule(
  "S5856",
  "Regular expressions should be syntactically valid",
  (context) => ({
    Literal(node) {
      if (isRegExpLiteral(node)) {
        const pattern = getRegExpPattern(node);
        if (!isValidRegExp(pattern)) {
          context.report({
            node,
            message:
              "Fix syntax error in regular expression. [typescript:S5856]",
          });
        }
      }
    },
  }),
);

// S2639: Regular expressions should not contain empty character classes
const S2639 = createRegexRule(
  "S2639",
  "Regular expressions should not contain empty character classes",
  (context) => ({
    Literal(node) {
      if (isRegExpLiteral(node)) {
        const pattern = getRegExpPattern(node);
        if (/\[\]/.test(pattern)) {
          context.report({
            node,
            message:
              'Remove empty character class "[]" in regular expression. [typescript:S2639]',
          });
        }
      }
    },
  }),
);

function findDuplicateCharInClass(content) {
  const seen = new Set();
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === BACKSLASH && i + 1 < content.length) {
      i++;
      continue;
    }
    if (char === "-") {
      continue;
    }
    if (seen.has(char)) {
      return char;
    }
    seen.add(char);
  }
  return null;
}

function extractCharacterClasses(pattern) {
  const classes = [];
  let inClass = false;
  let current = "";
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    if (char === BACKSLASH && i + 1 < pattern.length) {
      if (inClass) {
        current += pattern.slice(i, i + 2);
      }
      i++;
    } else if (char === "[" && !inClass) {
      inClass = true;
      current = "";
    } else if (char === "]" && inClass) {
      inClass = false;
      classes.push(current);
    } else if (inClass) {
      current += char;
    }
  }
  return classes;
}

function getDuplicateCharInPattern(pattern) {
  const classes = extractCharacterClasses(pattern);
  for (const classContent of classes) {
    const dup = findDuplicateCharInClass(classContent);
    if (dup) {
      return dup;
    }
  }
  return null;
}

// S5868: Character classes should not contain duplicate characters
const S5868 = createRegexRule(
  "S5868",
  "Character classes should not contain duplicate characters",
  (context) => ({
    Literal(node) {
      if (isRegExpLiteral(node)) {
        const pattern = getRegExpPattern(node);
        const dupChar = getDuplicateCharInPattern(pattern);
        if (dupChar) {
          context.report({
            node,
            message: `Character class contains duplicate character "${dupChar}". [typescript:S5868]`,
          });
        }
      }
    },
  }),
);

module.exports = {
  S5850,
  S6397,
  S6326,
  S6035,
  S6331,
  S6323,
  S6325,
  S5856,
  S2639,
  S5868,
};
