"use strict";

const {
  createSonarRule,
  getPropertyName,
  getStringValue,
  getMethodName,
  getStringArrayValues,
} = require("../utils/rule-helpers");

/**
 * Cloud / policy configuration rules (Sonar way, TypeScript).
 * These target infrastructure-as-code style constructs written in TypeScript
 * (CDK, SDK config objects). Patterns are matched structurally so they stay
 * effective without type information.
 */

function isStarLiteral(node) {
  return Boolean(node) && node.type === "Literal" && String(node.value) === "*";
}

function containsStar(node) {
  if (!node) {
    return false;
  }
  if (isStarLiteral(node)) {
    return true;
  }
  if (node.type === "ArrayExpression") {
    return node.elements.some((element) => isStarLiteral(element));
  }
  if (node.type === "ObjectExpression") {
    return node.properties.some(
      (property) =>
        property.type === "Property" &&
        (isStarLiteral(property.value) || containsStar(property.value)),
    );
  }
  return false;
}

function containsPublicCidr(node) {
  if (!node) {
    return false;
  }
  const value = getStringValue(node);
  if (value !== null) {
    return value === "0.0.0.0/0" || value === "::/0";
  }
  if (node.type === "ArrayExpression") {
    return node.elements.some((element) => containsPublicCidr(element));
  }
  return false;
}

function isTrueLiteral(node) {
  return Boolean(node) && node.type === "Literal" && node.value === true;
}

// S6270: Policies authorizing public access to resources are security-sensitive
const S6270 = createSonarRule(
  "S6270",
  "Policies authorizing public access to resources are security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      const value = node.value;
      const isPublicRead =
        name === "publicReadAccess" || name === "publicWriteAccess";
      if (isPublicRead && isTrueLiteral(value)) {
        context.report({
          node: value,
          message: `Public access ("${name}: true") should be disabled. [typescript:${ruleKey}]`,
        });
        return;
      }
      const isDisabledBlock =
        (name === "restrictPublicBuckets" ||
          name === "blockPublicPolicy" ||
          name === "blockPublicAcls" ||
          name === "ignorePublicAcls") &&
        value.type === "Literal" &&
        value.value === false;
      if (isDisabledBlock) {
        context.report({
          node: value,
          message: `Public access block "${name}" must not be disabled. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6281: Allowing public ACLs or policies on a S3 bucket is security-sensitive
const S6281 = createSonarRule(
  "S6281",
  "Allowing public ACLs or policies on a S3 bucket is security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (name !== "accessControl" && name !== "acl") {
        return;
      }
      const value = getStringValue(node.value);
      if (value && /public[-_]?(read|write)/i.test(value)) {
        context.report({
          node: node.value,
          message: `Public ACL "${value}" must not be used. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6265: Granting access to S3 buckets to all or authenticated users
const S6265 = createSonarRule(
  "S6265",
  "Granting access to S3 buckets to all or authenticated users is security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (
        name !== "principal" &&
        name !== "principals" &&
        name !== "Principal"
      ) {
        return;
      }
      if (containsStar(node.value)) {
        context.report({
          node: node.value,
          message:
            'Do not grant bucket access to everyone ("*"); restrict the principal. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6329: Allowing public network access to cloud resources is security-sensitive
const PUBLIC_NETWORK_PROPERTIES = new Set([
  "publiclyAccessible",
  "assignPublicIp",
  "mapPublicIpOnLaunch",
  "publicNetworkAccess",
  "publicIp",
]);

const S6329 = createSonarRule(
  "S6329",
  "Allowing public network access to cloud resources is security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (PUBLIC_NETWORK_PROPERTIES.has(name) && isTrueLiteral(node.value)) {
        context.report({
          node: node.value,
          message: `Public network access ("${name}: true") should be disabled. [typescript:${ruleKey}]`,
        });
        return;
      }
      if (
        (name === "cidr" || name === "cidrIp" || name === "cidrBlock") &&
        containsPublicCidr(node.value)
      ) {
        context.report({
          node: node.value,
          message:
            "Do not allow traffic from 0.0.0.0/0; restrict the CIDR range. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6333: Creating public APIs is security-sensitive
const S6333 = createSonarRule(
  "S6333",
  "Creating public APIs is security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (name !== "authorizationType" && name !== "authorization") {
        return;
      }
      const value = getStringValue(node.value);
      if (value && value.toUpperCase() === "NONE") {
        context.report({
          node: node.value,
          message:
            'Public APIs must require authentication; do not use "NONE" authorization. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6302: Policies granting all privileges are security-sensitive
const S6302 = createSonarRule(
  "S6302",
  "Policies granting all privileges are security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (name !== "action" && name !== "actions") {
        return;
      }
      if (containsStar(node.value)) {
        context.report({
          node: node.value,
          message: `Do not grant all privileges ("*") in a policy. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6317: AWS IAM policies should limit the scope of permissions given
const S6317 = createSonarRule(
  "S6317",
  "AWS IAM policies should limit the scope of permissions given",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (name !== "action" && name !== "actions") {
        return;
      }
      const values =
        node.value.type === "ArrayExpression"
          ? getStringArrayValues(node.value)
          : [getStringValue(node.value)].filter(Boolean);
      const wildcardServiceAction = values.find((value) =>
        /^[a-z0-9-]+:\*$/i.test(value),
      );
      if (wildcardServiceAction) {
        context.report({
          node: node.value,
          message: `Avoid wildcard IAM actions such as "${wildcardServiceAction}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6249: Authorizing HTTP communications with S3 buckets
const S6249 = createSonarRule(
  "S6249",
  "Authorizing HTTP communications with S3 buckets is security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (name !== "enforceSSL" && name !== "secureTransport") {
        return;
      }
      const value = node.value;
      if (value.type === "Literal" && value.value === false) {
        context.report({
          node: value,
          message: `HTTP communication must not be allowed ("${name}: false"). [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6268: Disabling Angular built-in sanitization is security-sensitive
const S6268 = createSonarRule(
  "S6268",
  "Disabling Angular built-in sanitization is security-sensitive",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (methodName && methodName.startsWith("bypassSecurityTrust")) {
        context.report({
          node,
          message: `"${methodName}" bypasses Angular sanitization; ensure the value is trusted. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

module.exports = {
  S6270,
  S6281,
  S6265,
  S6329,
  S6333,
  S6302,
  S6317,
  S6249,
  S6268,
};
