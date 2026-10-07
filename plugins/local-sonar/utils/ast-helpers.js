"use strict";

/**
 * Common AST Helper functions for ESLint rules
 */

function isStringLiteral(node) {
  return (
    node &&
    ((node.type === "Literal" && typeof node.value === "string") ||
      node.type === "StringLiteral")
  );
}

function isRegExpLiteral(node) {
  return (
    node &&
    ((node.type === "Literal" && node.regex) || node.type === "RegExpLiteral")
  );
}

function getRegExpPattern(node) {
  if (node.regex) {
    return node.regex.pattern;
  }
  if (node.pattern) {
    return node.pattern;
  }
  if (typeof node.raw === "string" && node.raw.startsWith("/")) {
    const lastSlash = node.raw.lastIndexOf("/");
    return node.raw.slice(1, lastSlash);
  }
  return "";
}

function getRegExpFlags(node) {
  if (node.regex) {
    return node.regex.flags;
  }
  if (node.flags) {
    return node.flags;
  }
  if (typeof node.raw === "string" && node.raw.startsWith("/")) {
    const lastSlash = node.raw.lastIndexOf("/");
    return node.raw.slice(lastSlash + 1);
  }
  return "";
}

function isCallTo(node, objectName, methodName) {
  if (!node || node.type !== "CallExpression") {
    return false;
  }
  const callee = node.callee;
  if (!callee || callee.type !== "MemberExpression") {
    return false;
  }

  const objMatch =
    !objectName ||
    (callee.object.type === "Identifier" && callee.object.name === objectName);
  const methodMatch =
    callee.property.type === "Identifier" &&
    callee.property.name === methodName;

  return objMatch && methodMatch;
}

module.exports = {
  isStringLiteral,
  isRegExpLiteral,
  getRegExpPattern,
  getRegExpFlags,
  isCallTo,
};
