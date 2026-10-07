"use strict";

/**
 * Lightweight taint-tracking helpers for the injection rules.
 *
 * This is intentionally conservative: taint only originates from well-known
 * untrusted sources (HTTP requests, process args/env, browser location/URL,
 * navigation params) and propagates through literals, operators, calls and
 * destructuring. Anything the tracker cannot reason about is treated as clean,
 * which keeps false positives low at the cost of missing indirect flows.
 */

const UNTRUSTED_MEMBER_PREFIXES = [
  "process.argv",
  "process.env",
  "req",
  "request",
  "ctx.request",
  "window.location",
  "document.location",
  "document.URL",
  "document.referrer",
  "document.cookie",
  "location",
  "route.params",
  "route.query",
  "navigation.params",
  "props.route.params",
  "props.navigation",
];

const SANITIZER_CALLEES = new Set([
  "Number",
  "parseInt",
  "parseFloat",
  "Boolean",
]);

function getStaticMemberPath(node) {
  if (!node) {
    return null;
  }
  if (node.type === "Identifier") {
    return node.name;
  }
  if (node.type !== "MemberExpression") {
    return null;
  }
  const objectPath = getStaticMemberPath(node.object);
  if (!objectPath) {
    return null;
  }
  let property = null;
  if (!node.computed && node.property.type === "Identifier") {
    property = node.property.name;
  } else if (
    node.computed &&
    node.property.type === "Literal" &&
    typeof node.property.value === "string"
  ) {
    property = node.property.value;
  }
  if (property === null) {
    return null;
  }
  return `${objectPath}.${property}`;
}

function isUntrustedSource(node) {
  const memberPath = getStaticMemberPath(node);
  if (!memberPath) {
    return false;
  }
  return UNTRUSTED_MEMBER_PREFIXES.some(
    (prefix) => memberPath === prefix || memberPath.startsWith(`${prefix}.`),
  );
}

function getCalleeName(node) {
  if (!node || node.type !== "CallExpression") {
    return null;
  }
  const callee = node.callee;
  if (!callee) {
    return null;
  }
  if (callee.type === "Identifier") {
    return callee.name;
  }
  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier"
  ) {
    return callee.property.name;
  }
  return null;
}

function isTaintedCall(node, tainted) {
  const callee = node.callee;
  if (
    callee &&
    callee.type === "Identifier" &&
    SANITIZER_CALLEES.has(callee.name)
  ) {
    return false;
  }
  if (callee && callee.type === "MemberExpression") {
    const method = getCalleeName(node);
    if (method === "get" || method === "getAll") {
      const objectPath = getStaticMemberPath(callee.object);
      if (objectPath && objectPath.endsWith("searchParams")) {
        return true;
      }
      if (
        callee.object &&
        callee.object.type === "NewExpression" &&
        callee.object.callee &&
        callee.object.callee.type === "Identifier" &&
        callee.object.callee.name === "URLSearchParams"
      ) {
        return true;
      }
    }
  }
  return node.arguments.some((argument) => isTainted(argument, tainted));
}

/**
 * Returns true when the expression can carry untrusted data.
 * @param {import('estree').Node|null|undefined} node
 * @param {Set<string>} tainted identifier names tracked in the file
 */
function isTainted(node, tainted) {
  if (!node) {
    return false;
  }
  switch (node.type) {
    case "Identifier":
      return tainted.has(node.name);
    case "MemberExpression":
      return isUntrustedSource(node) || isTainted(node.object, tainted);
    case "ChainExpression":
      return isTainted(node.expression, tainted);
    case "TemplateLiteral":
      return node.expressions.some((expression) =>
        isTainted(expression, tainted),
      );
    case "BinaryExpression":
      return isTainted(node.left, tainted) || isTainted(node.right, tainted);
    case "LogicalExpression":
      return isTainted(node.left, tainted) || isTainted(node.right, tainted);
    case "ConditionalExpression":
      return (
        isTainted(node.test, tainted) ||
        isTainted(node.consequent, tainted) ||
        isTainted(node.alternate, tainted)
      );
    case "CallExpression":
      return isTaintedCall(node, tainted);
    case "NewExpression":
      return node.arguments.some((argument) => isTainted(argument, tainted));
    case "ArrayExpression":
      return node.elements.some((element) => isTainted(element, tainted));
    case "ObjectExpression":
      return node.properties.some(
        (property) =>
          property.type === "Property" && isTainted(property.value, tainted),
      );
    case "AwaitExpression":
      return isTainted(node.argument, tainted);
    case "SpreadElement":
      return isTainted(node.argument, tainted);
    case "SequenceExpression":
      return isTainted(node.expressions.at(-1), tainted);
    case "TSAsExpression":
    case "TSTypeAssertion":
    case "TSNonNullExpression":
    case "TSInstantiationExpression":
      return isTainted(node.expression, tainted);
    default:
      return false;
  }
}

function createTaintTracker() {
  const tainted = new Set();

  function track(pattern) {
    if (!pattern) {
      return;
    }
    switch (pattern.type) {
      case "Identifier":
        tainted.add(pattern.name);
        break;
      case "ObjectPattern":
        for (const property of pattern.properties) {
          if (property.type === "Property") {
            track(property.value);
          } else if (property.type === "RestElement") {
            track(property.argument);
          }
        }
        break;
      case "ArrayPattern":
        for (const element of pattern.elements) {
          track(element);
        }
        break;
      case "AssignmentPattern":
        track(pattern.left);
        break;
      case "RestElement":
        track(pattern.argument);
        break;
      default:
        break;
    }
  }

  return {
    tainted,
    track,
    isTainted: (node) => isTainted(node, tainted),
    makeVisitors(extraVisitors) {
      const visitors = {
        VariableDeclarator(node) {
          if (node.init && isTainted(node.init, tainted)) {
            track(node.id);
          }
        },
        AssignmentExpression(node) {
          if (node.right && isTainted(node.right, tainted)) {
            track(node.left);
          }
        },
      };
      for (const [selector, handler] of Object.entries(extraVisitors ?? {})) {
        const base = visitors[selector];
        visitors[selector] = base
          ? (node) => {
              base(node);
              handler(node);
            }
          : handler;
      }
      return visitors;
    },
  };
}

module.exports = {
  createTaintTracker,
  isTainted,
  isUntrustedSource,
  getStaticMemberPath,
  getCalleeName,
  UNTRUSTED_MEMBER_PREFIXES,
};
