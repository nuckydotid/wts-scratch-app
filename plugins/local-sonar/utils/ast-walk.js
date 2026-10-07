"use strict";

function isNestedFunction(node) {
  return (
    node.type === "FunctionDeclaration" || node.type === "FunctionExpression"
  );
}

/**
 * Creates a depth-first walker over a node using ESLint's visitor keys.
 * Returns a function `(root, visit) => void` where `visit` can return `true`
 * to stop descending into the current node.
 *
 * Options:
 * - skipNestedFunctions: true skips nested FunctionDeclaration/FunctionExpression
 * - skipNestedFunctions: 'all' also skips nested arrow functions
 */
function createAstWalker(sourceCode, options) {
  const settings = options ?? {};
  const visitorKeys = sourceCode.visitorKeys;
  const skipMode = settings.skipNestedFunctions;

  function shouldSkip(node) {
    if (!skipMode) {
      return false;
    }
    if (skipMode === "all") {
      return isNestedFunction(node) || node.type === "ArrowFunctionExpression";
    }
    return isNestedFunction(node);
  }

  function walk(node, visit, isRoot) {
    if (!node || typeof node.type !== "string") {
      return;
    }
    if (!isRoot && shouldSkip(node)) {
      return;
    }
    if (visit(node) === true) {
      return;
    }
    const keys = visitorKeys[node.type] || [];
    for (const key of keys) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          walk(item, visit, false);
        }
      } else if (child && typeof child.type === "string") {
        walk(child, visit, false);
      }
    }
  }

  return (root, visit) => walk(root, visit, true);
}

module.exports = { createAstWalker, isNestedFunction };
