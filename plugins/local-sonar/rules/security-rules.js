"use strict";

const { isStringLiteral } = require("../utils/ast-helpers");

/**
 * Security & Vulnerabilities Rules Engine
 * Covers: S1313, S6437, S5730, S5547, S4507, S5739, S5734, S5728, S2068, S4790, S5122, S5334, S5689, etc.
 */

const PASSWORD_KEYWORD_REGEX =
  /^(password|passwd|pwd|secret|api[_-]?key|auth[_-]?token|bearer[_-]?token|private[_-]?key)$/i;
const WEAK_HASH_REGEX = /^(md5|sha1|sha-1|md4|des|rc4)$/i;

function isIPv4Address(str) {
  if (
    typeof str !== "string" ||
    !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(str)
  ) {
    return false;
  }
  const parts = str.split(".");
  return parts.every((p) => {
    const num = Number(p);
    return num >= 0 && num <= 255 && (p === "0" || !p.startsWith("0"));
  });
}

function createSecurityRule(ruleKey, ruleName, checkFn) {
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

// S1313: Hardcoded IP addresses
const S1313 = createSecurityRule(
  "S1313",
  "Using hardcoded IP addresses is security-sensitive",
  (context) => ({
    Literal(node) {
      if (typeof node.value === "string" && isIPv4Address(node.value)) {
        if (
          node.value !== "127.0.0.1" &&
          node.value !== "0.0.0.0" &&
          node.value !== "255.255.255.255"
        ) {
          context.report({
            node,
            message:
              "Using hardcoded IP addresses is security-sensitive. Make sure using this hardcoded IP address is safe here. [typescript:S1313]",
          });
        }
      }
    },
  }),
);

// S6437: Hardcoded secrets and credentials
const S6437 = createSecurityRule(
  "S6437",
  "Hardcoded credentials should not be used",
  (context) => ({
    VariableDeclarator(node) {
      if (node.id?.type === "Identifier") {
        if (
          PASSWORD_KEYWORD_REGEX.test(node.id.name) &&
          isStringLiteral(node.init) &&
          node.init.value.length >= 8
        ) {
          context.report({
            node: node.init,
            message: `Revoke and remove this hardcoded credential "${node.id.name}". Use environment variables or a secret vault instead. [typescript:S6437]`,
          });
        }
      }
    },
  }),
);

// S5730: Mixed content HTTP URLs
const S5730 = createSecurityRule(
  "S5730",
  "Allowing mixed-content is security-sensitive",
  (context) => ({
    Literal(node) {
      if (typeof node.value === "string") {
        if (/^http:\/\/(?!localhost|127\.0\.0\.1)/.test(node.value)) {
          context.report({
            node,
            message:
              'Using unencrypted "http://" protocol is security-sensitive. Use "https://" to avoid mixed-content and man-in-the-middle attacks. [typescript:S5730]',
          });
        }
      }
    },
  }),
);

// S5547: Weak cryptography ciphers
const S5547 = createSecurityRule(
  "S5547",
  "Weak cryptography ciphers should not be used",
  (context) => ({
    CallExpression(node) {
      if (
        node.callee?.type === "MemberExpression" &&
        node.callee.property?.name === "createCipher"
      ) {
        context.report({
          node: node.callee.property,
          message:
            'Use "createCipheriv" with a strong algorithm (e.g., AES-GCM) instead of deprecated "createCipher". [typescript:S5547]',
        });
      }
    },
  }),
);

// S4507: Debug code in production
const S4507 = createSecurityRule(
  "S4507",
  "Delivering code in production with debug features activated is security-sensitive",
  (context) => ({
    DebuggerStatement(node) {
      context.report({
        node,
        message:
          'Remove this "debugger;" statement before releasing to production. [typescript:S4507]',
      });
    },
  }),
);

// S5739: Strict-Transport-Security (HSTS)
const S5739 = createSecurityRule(
  "S5739",
  "Disabling Strict-Transport-Security policy is security-sensitive",
  (context) => ({
    Property(node) {
      if (node.key && (node.key.name === "hsts" || node.key.value === "hsts")) {
        if (node.value.type === "Literal" && node.value.value === false) {
          context.report({
            node: node.value,
            message:
              "Do not disable Strict-Transport-Security (HSTS). [typescript:S5739]",
          });
        }
      }
    },
  }),
);

// S5734: MIME type sniffing
const S5734 = createSecurityRule(
  "S5734",
  "Allowing browsers to sniff MIME types is security-sensitive",
  (context) => ({
    Property(node) {
      if (
        node.key &&
        (node.key.name === "noSniff" || node.key.value === "noSniff")
      ) {
        if (node.value.type === "Literal" && node.value.value === false) {
          context.report({
            node: node.value,
            message:
              'Do not disable X-Content-Type-Options "noSniff". [typescript:S5734]',
          });
        }
      }
    },
  }),
);

// S5728: Content Security Policy
const S5728 = createSecurityRule(
  "S5728",
  "Disabling content security policy fetch directives is security-sensitive",
  (context) => ({
    Property(node) {
      if (
        node.key &&
        (node.key.name === "contentSecurityPolicy" ||
          node.key.value === "contentSecurityPolicy")
      ) {
        if (node.value.type === "Literal" && node.value.value === false) {
          context.report({
            node: node.value,
            message:
              "Do not disable Content-Security-Policy. [typescript:S5728]",
          });
        }
      }
    },
  }),
);

// S2068: Hardcoded Credentials / Passwords
const S2068 = createSecurityRule(
  "S2068",
  "Hardcoded credentials should not be used",
  (context) => ({
    Property(node) {
      if (node.key && (node.key.name || node.key.value)) {
        const keyName = node.key.name || node.key.value;
        if (
          typeof keyName === "string" &&
          PASSWORD_KEYWORD_REGEX.test(keyName)
        ) {
          if (isStringLiteral(node.value) && node.value.value.length > 0) {
            context.report({
              node: node.value,
              message:
                "Credentials should not be hard-coded. [typescript:S2068]",
            });
          }
        }
      }
    },
    VariableDeclarator(node) {
      if (node.id?.type === "Identifier") {
        if (
          PASSWORD_KEYWORD_REGEX.test(node.id.name) &&
          isStringLiteral(node.init) &&
          node.init.value.length > 0
        ) {
          context.report({
            node: node.init,
            message: "Credentials should not be hard-coded. [typescript:S2068]",
          });
        }
      }
    },
  }),
);

// S4790: Weak Hashing Algorithms
const S4790 = createSecurityRule(
  "S4790",
  "Weak hashing algorithms should not be used",
  (context) => ({
    CallExpression(node) {
      if (
        node.callee?.type === "MemberExpression" &&
        node.callee.property?.name === "createHash" &&
        node.arguments.length > 0
      ) {
        const firstArg = node.arguments[0];
        if (isStringLiteral(firstArg) && WEAK_HASH_REGEX.test(firstArg.value)) {
          context.report({
            node: firstArg,
            message: `Weak hashing algorithm "${firstArg.value}" is security-sensitive. [typescript:S4790]`,
          });
        }
      }
    },
  }),
);

// S5122: CORS policies
const S5122 = createSecurityRule(
  "S5122",
  "CORS policies should not be overly permissive",
  (context) => ({
    Property(node) {
      if (
        node.key &&
        (node.key.name === "origin" || node.key.value === "origin")
      ) {
        if (isStringLiteral(node.value) && node.value.value === "*") {
          context.report({
            node: node.value,
            message:
              'Overly permissive CORS origin "*" is security-sensitive. [typescript:S5122]',
          });
        }
      }
    },
  }),
);

// S5334: Dynamic code execution
const S5334 = createSecurityRule(
  "S5334",
  "Dynamic code execution is security-sensitive",
  (context) => ({
    CallExpression(node) {
      if (node.callee.type === "Identifier" && node.callee.name === "eval") {
        context.report({
          node,
          message:
            'Using "eval()" to execute code dynamically is security-sensitive. [typescript:S5334]',
        });
      }
    },
    NewExpression(node) {
      if (
        node.callee.type === "Identifier" &&
        node.callee.name === "Function"
      ) {
        context.report({
          node,
          message:
            'Creating functions dynamically via "new Function()" is security-sensitive. [typescript:S5334]',
        });
      }
    },
  }),
);

// S5689: SQL parameterized queries
const S5689 = createSecurityRule(
  "S5689",
  "SQL queries should use parameterized inputs",
  (context) => ({
    BinaryExpression(node) {
      if (node.operator === "+") {
        if (
          isStringLiteral(node.left) &&
          /^(SELECT|INSERT|UPDATE|DELETE|DROP)\s/i.test(node.left.value)
        ) {
          context.report({
            node,
            message:
              "SQL queries should be parameterized instead of concatenated. [typescript:S5689]",
          });
        }
      }
    },
  }),
);

module.exports = {
  S1313,
  S6437,
  S5730,
  S5547,
  S4507,
  S5739,
  S5734,
  S5728,
  S2068,
  S4790,
  S5122,
  S5334,
  S5689,
};
