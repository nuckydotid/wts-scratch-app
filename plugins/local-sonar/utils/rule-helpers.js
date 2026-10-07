"use strict";

/**
 * Shared helpers for Sonar rule implementations.
 */

function createSonarRule(ruleKey, ruleName, createFn) {
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
      return createFn(context, ruleKey);
    },
  };
}

function getPropertyName(node) {
  if (!node || !node.key) {
    return null;
  }
  if (node.key.type === "Identifier" || node.key.type === "PrivateIdentifier") {
    return node.key.name;
  }
  if (node.key.type === "Literal") {
    return String(node.key.value);
  }
  return null;
}

function getObjectProperty(objectExpression, name) {
  if (!objectExpression || objectExpression.type !== "ObjectExpression") {
    return null;
  }
  return (
    objectExpression.properties.find(
      (property) =>
        property.type === "Property" && getPropertyName(property) === name,
    ) || null
  );
}

function hasProperty(objectExpression, name) {
  return Boolean(getObjectProperty(objectExpression, name));
}

function getPropertyValue(objectExpression, name) {
  const property = getObjectProperty(objectExpression, name);
  return property ? property.value : null;
}

function isStringLiteral(node) {
  return (
    Boolean(node) && node.type === "Literal" && typeof node.value === "string"
  );
}

function getStringValue(node) {
  return isStringLiteral(node) ? node.value : null;
}

function getMethodName(node) {
  if (!node || node.type !== "CallExpression" || !node.callee) {
    return null;
  }
  const callee = node.callee;
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

function isFunction(node) {
  return (
    Boolean(node) &&
    (node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression")
  );
}

function getStringArrayValues(node) {
  if (!node || node.type !== "ArrayExpression") {
    return [];
  }
  return node.elements
    .map((element) => getStringValue(element))
    .filter((value) => value !== null);
}

module.exports = {
  createSonarRule,
  getPropertyName,
  getObjectProperty,
  hasProperty,
  getPropertyValue,
  isStringLiteral,
  getStringValue,
  getMethodName,
  isFunction,
  getStringArrayValues,
};
