"use strict";

const {
  createSonarRule,
  getPropertyName,
  getPropertyValue,
  hasProperty,
  isStringLiteral,
  getStringValue,
  getMethodName,
  isFunction,
  getStringArrayValues,
} = require("../utils/rule-helpers");
const { createAstWalker } = require("../utils/ast-walk");

/**
 * Crypto, transport and web security rules (Sonar way, TypeScript).
 * These are pattern-based approximations of the server rules; the SonarQube
 * server remains the authority for full taint/semantic analysis.
 */

const WEAK_TLS_VALUES = new Set([
  "sslv2",
  "sslv3",
  "tlsv1",
  "tlsv1.1",
  "sslv23_method",
  "sslv3_method",
  "tlsv1_method",
  "tlsv1_1_method",
]);

const WRITABLE_DIRECTORIES = ["/tmp", "/var/tmp", "/dev/shm"];

const SECRET_KEY_REGEX =
  /(api[_.-]?key|auth|credential|secret|token|passwd|password)/i;

const WALLET_PHRASE_REGEX =
  /(mnemonic|seed[_. -]?phrase|wallet[_. -]?(phrase|words)|recovery[_. -]?phrase)/i;

const PLACEHOLDER_REGEX =
  /^(your[-_]|<|\.\.\.|xxx|todo|changeme|example|placeholder|\$\{)/i;

function report(context, node, ruleKey, message) {
  context.report({ node, message: `${message} [typescript:${ruleKey}]` });
}

function getBindingName(keyNameNode) {
  if (!keyNameNode) {
    return null;
  }
  if (keyNameNode.type === "Identifier") {
    return keyNameNode.name;
  }
  if (keyNameNode.type === "Literal") {
    return String(keyNameNode.value);
  }
  return null;
}

// S1523: Dynamically executing code is security-sensitive
const S1523 = createSonarRule(
  "S1523",
  "Dynamically executing code is security-sensitive",
  (context, ruleKey) => ({
    CallExpression(node) {
      const calleeName = getMethodName(node);
      if (calleeName === "eval" || calleeName === "execScript") {
        report(
          context,
          node,
          ruleKey,
          "Avoid dynamically executing code with eval().",
        );
        return;
      }
      if (calleeName === "Function") {
        report(
          context,
          node,
          ruleKey,
          "Avoid constructing functions from strings.",
        );
        return;
      }
      if (calleeName === "setTimeout" || calleeName === "setInterval") {
        const handler = node.arguments[0];
        if (
          isStringLiteral(handler) ||
          (handler && handler.type === "TemplateLiteral")
        ) {
          report(
            context,
            handler,
            ruleKey,
            "Do not pass strings to timers; pass a function instead.",
          );
        }
      }
    },
    NewExpression(node) {
      if (
        node.callee.type === "Identifier" &&
        node.callee.name === "Function"
      ) {
        report(
          context,
          node,
          ruleKey,
          "Avoid constructing functions from strings.",
        );
      }
    },
  }),
);

// S2245: Using pseudorandom number generators (PRNGs) is security-sensitive
const S2245 = createSonarRule(
  "S2245",
  "Using pseudorandom number generators (PRNGs) is security-sensitive",
  (context, ruleKey) => ({
    CallExpression(node) {
      const callee = node.callee;
      if (
        callee.type === "MemberExpression" &&
        !callee.computed &&
        callee.object.type === "Identifier" &&
        callee.object.name === "Math" &&
        callee.property.type === "Identifier" &&
        callee.property.name === "random"
      ) {
        report(
          context,
          node,
          ruleKey,
          "Math.random() is not cryptographically secure; use a CSPRNG for security-sensitive values.",
        );
      }
      if (getMethodName(node) === "pseudoRandomBytes") {
        report(
          context,
          node,
          ruleKey,
          "pseudoRandomBytes is not cryptographically secure.",
        );
      }
    },
  }),
);

// S6418: Hard-coded secrets are security-sensitive
const S6418 = createSonarRule(
  "S6418",
  "Hard-coded secrets are security-sensitive",
  (context, ruleKey) => {
    function checkValue(keyNameNode, valueNode) {
      const name = getBindingName(keyNameNode);
      if (!name || !SECRET_KEY_REGEX.test(name)) {
        return;
      }
      const value = getStringValue(valueNode);
      if (!value || value.length < 8 || PLACEHOLDER_REGEX.test(value)) {
        return;
      }
      report(
        context,
        valueNode,
        ruleKey,
        `Revoke and remove this hard-coded secret "${name}".`,
      );
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type === "Identifier") {
          checkValue(node.id, node.init);
        }
      },
      Property(node) {
        checkValue(node.key, node.value);
      },
    };
  },
);

// S7639: Wallet phrases should not be hard-coded
const S7639 = createSonarRule(
  "S7639",
  "Wallet phrases should not be hard-coded",
  (context, ruleKey) => {
    function checkValue(keyNameNode, valueNode) {
      const name = getBindingName(keyNameNode);
      if (!name || !WALLET_PHRASE_REGEX.test(name)) {
        return;
      }
      const value = getStringValue(valueNode);
      if (!value || value.trim().split(/\s+/).length < 4) {
        return;
      }
      report(
        context,
        valueNode,
        ruleKey,
        "Wallet recovery phrases must not be hard-coded; load them from secure storage.",
      );
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type === "Identifier") {
          checkValue(node.id, node.init);
        }
      },
      Property(node) {
        checkValue(node.key, node.value);
      },
    };
  },
);

// S5332: Using clear-text protocols is security-sensitive
const S5332 = createSonarRule(
  "S5332",
  "Using clear-text protocols is security-sensitive",
  (context, ruleKey) => ({
    Literal(node) {
      if (typeof node.value !== "string") {
        return;
      }
      const isCleartextWs = /^ws:\/\//i.test(node.value);
      if (isCleartextWs) {
        report(context, node, ruleKey, 'Use "wss://" instead of "ws://".');
      }
    },
    Property(node) {
      const name = getPropertyName(node);
      if (!name) {
        return;
      }
      const value = node.value;
      const isDisabledTransport =
        (name === "secure" || name === "tls") &&
        value.type === "Literal" &&
        value.value === false;
      const isHttpProtocol =
        name === "protocol" &&
        isStringLiteral(value) &&
        value.value.toLowerCase() === "http";
      if (isDisabledTransport || isHttpProtocol) {
        report(
          context,
          value,
          ruleKey,
          "Use an encrypted transport instead of clear-text protocols.",
        );
      }
    },
  }),
);

// S5443: Using publicly writable directories is security-sensitive
function isWritableDirectoryValue(value) {
  return WRITABLE_DIRECTORIES.some(
    (directory) => value === directory || value.startsWith(`${directory}/`),
  );
}

function isUsedInOperation(node) {
  const parent = node.parent;
  if (!parent) {
    return false;
  }
  if (
    (parent.type === "CallExpression" || parent.type === "NewExpression") &&
    parent.arguments.includes(node)
  ) {
    return true;
  }
  if (parent.type === "Property" && parent.value === node) {
    return true;
  }
  if (parent.type === "VariableDeclarator" && parent.init === node) {
    return true;
  }
  if (parent.type === "BinaryExpression" || parent.type === "TemplateLiteral") {
    return true;
  }
  return false;
}

const S5443 = createSonarRule(
  "S5443",
  "Using publicly writable directories is security-sensitive",
  (context, ruleKey) => ({
    Literal(node) {
      if (typeof node.value !== "string") {
        return;
      }
      if (!isWritableDirectoryValue(node.value) || !isUsedInOperation(node)) {
        return;
      }
      report(
        context,
        node,
        ruleKey,
        `"${node.value}" is a publicly writable directory; use a private directory with restrictive permissions.`,
      );
    },
  }),
);

// S5042: Expanding archive files without controlling resource consumption
const EXPANSION_METHODS = new Set([
  "inflate",
  "inflateSync",
  "gunzip",
  "gunzipSync",
  "brotliDecompress",
  "brotliDecompressSync",
  "unzip",
  "unzipSync",
  "createInflate",
  "createGunzip",
  "createBrotliDecompress",
  "createUnzip",
]);

const S5042 = createSonarRule(
  "S5042",
  "Expanding archive files without controlling resource consumption is security-sensitive",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (!methodName || !EXPANSION_METHODS.has(methodName)) {
        return;
      }
      const options = node.arguments.find(
        (argument) => argument.type === "ObjectExpression",
      );
      if (options && hasProperty(options, "maxOutputLength")) {
        return;
      }
      report(
        context,
        node,
        ruleKey,
        'Set "maxOutputLength" when expanding archives to prevent resource exhaustion.',
      );
    },
  }),
);

// S2598: File uploads should be restricted
const UPLOAD_LIBRARIES = {
  multer: {
    knownOptions: ["limits", "fileFilter"],
    message: 'Restrict file uploads with "limits" and "fileFilter".',
  },
  formidable: {
    knownOptions: ["maxFileSize", "maxFields"],
    message: 'Restrict file uploads with "maxFileSize" and "maxFields".',
  },
  busboy: {
    knownOptions: ["limits"],
    message: 'Restrict file uploads with "limits".',
  },
};

const S2598 = createSonarRule(
  "S2598",
  "File uploads should be restricted",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      const library =
        methodName &&
        Object.prototype.hasOwnProperty.call(UPLOAD_LIBRARIES, methodName)
          ? UPLOAD_LIBRARIES[methodName]
          : null;
      if (!library) {
        return;
      }
      const options = node.arguments.find(
        (argument) => argument.type === "ObjectExpression",
      );
      const restricted =
        options &&
        library.knownOptions.some((option) => hasProperty(options, option));
      if (!restricted) {
        report(context, node, ruleKey, library.message);
      }
    },
  }),
);

// S4502: Disabling CSRF protections is security-sensitive
const STATEFUL_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const CSRF_DISABLE_PROPERTIES = new Set([
  "disableCsrf",
  "csrfProtection",
  "csrfEnabled",
]);

const S4502 = createSonarRule(
  "S4502",
  "Disabling CSRF protections is security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (!name) {
        return;
      }
      const value = node.value;
      if (name === "ignoreMethods") {
        const ignored = getStringArrayValues(value).map((method) =>
          method.toUpperCase(),
        );
        if (ignored.some((method) => STATEFUL_METHODS.has(method))) {
          report(
            context,
            value,
            ruleKey,
            "CSRF protection must not be ignored for state-changing methods.",
          );
        }
        return;
      }
      const disablesCsrf =
        (name === "csrf" ||
          name === "csrfProtection" ||
          CSRF_DISABLE_PROPERTIES.has(name)) &&
        value.type === "Literal" &&
        (value.value === false || value.value === 0);
      if (disablesCsrf) {
        report(
          context,
          value,
          ruleKey,
          "CSRF protection must not be disabled.",
        );
      }
    },
  }),
);

// S5876: A new session should be created during user authentication
const S5876 = createSonarRule(
  "S5876",
  "A new session should be created during user authentication",
  (context, ruleKey) => {
    let firstSessionWrite = null;
    let regeneratesSession = false;

    function isSessionAssignmentTarget(node) {
      if (!node || node.type !== "MemberExpression") {
        return false;
      }
      const object = node.object;
      if (!object || object.type !== "MemberExpression") {
        return false;
      }
      const root = object.object;
      if (
        !root ||
        root.type !== "Identifier" ||
        (root.name !== "req" && root.name !== "request")
      ) {
        return false;
      }
      return (
        !object.computed &&
        object.property.type === "Identifier" &&
        object.property.name === "session"
      );
    }

    return {
      AssignmentExpression(node) {
        if (isSessionAssignmentTarget(node.left) && !firstSessionWrite) {
          firstSessionWrite = node.left;
        }
      },
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === "MemberExpression" &&
          !callee.computed &&
          callee.property.type === "Identifier"
        ) {
          const method = callee.property.name;
          const object = callee.object;
          if (
            (method === "regenerate" || method === "destroy") &&
            object.type === "MemberExpression" &&
            !object.computed &&
            object.property.type === "Identifier" &&
            object.property.name === "session"
          ) {
            regeneratesSession = true;
          }
        }
      },
      "Program:exit"() {
        if (firstSessionWrite && !regeneratesSession) {
          report(
            context,
            firstSessionWrite,
            ruleKey,
            "Regenerate the session during authentication to prevent session fixation.",
          );
        }
      },
    };
  },
);

// S2819: Origins should be verified during cross-origin communications
const S2819 = createSonarRule(
  "S2819",
  "Origins should be verified during cross-origin communications",
  (context, ruleKey) => {
    const walk = createAstWalker(context.sourceCode, {
      skipNestedFunctions: true,
    });

    function handlerChecksOrigin(handler) {
      if (!handler || !isFunction(handler)) {
        return true;
      }
      let checksOrigin = false;
      walk(handler.body, (child) => {
        if (
          child.type === "MemberExpression" &&
          !child.computed &&
          child.property.type === "Identifier" &&
          child.property.name === "origin"
        ) {
          checksOrigin = true;
          return true;
        }
        return false;
      });
      return checksOrigin;
    }

    return {
      CallExpression(node) {
        const methodName = getMethodName(node);
        if (methodName === "postMessage") {
          const targetOrigin = node.arguments[1];
          if (isStringLiteral(targetOrigin) && targetOrigin.value === "*") {
            report(
              context,
              targetOrigin,
              ruleKey,
              'Do not use "*" as postMessage target origin.',
            );
          }
          return;
        }
        if (methodName === "addEventListener") {
          const eventName = node.arguments[0];
          if (isStringLiteral(eventName) && eventName.value === "message") {
            const handler = node.arguments[1];
            if (isFunction(handler) && !handlerChecksOrigin(handler)) {
              report(
                context,
                handler,
                ruleKey,
                'Verify "event.origin" before handling cross-origin messages.',
              );
            }
          }
        }
      },
    };
  },
);

// S2755: XML parsers should not be vulnerable to XXE attacks
const XXE_FLAGS = new Set([
  "noent",
  "resolveExternals",
  "allowExternalEntities",
  "loadExternalDtd",
  "externalEntities",
]);

const S2755 = createSonarRule(
  "S2755",
  "XML parsers should not be vulnerable to XXE attacks",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (!name || !XXE_FLAGS.has(name)) {
        return;
      }
      const value = node.value;
      const enablesEntities =
        (value.type === "Literal" && value.value === true) ||
        getStringValue(value) === "true";
      if (enablesEntities) {
        report(
          context,
          value,
          ruleKey,
          "Disable external entity resolution to prevent XXE.",
        );
      }
    },
  }),
);

// S4423: Weak SSL/TLS protocols should not be used
const TLS_OPTION_NAMES = new Set([
  "secureProtocol",
  "secureProtocols",
  "minVersion",
  "maxVersion",
  "version",
  "protocol",
]);

function isWeakTlsValue(value) {
  return typeof value === "string" && WEAK_TLS_VALUES.has(value.toLowerCase());
}

const S4423 = createSonarRule(
  "S4423",
  "Weak SSL/TLS protocols should not be used",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (!name || !TLS_OPTION_NAMES.has(name)) {
        return;
      }
      const value = getStringValue(node.value);
      if (isWeakTlsValue(value)) {
        report(
          context,
          node.value,
          ruleKey,
          `"${value}" is a weak SSL/TLS protocol version.`,
        );
      }
    },
    VariableDeclarator(node) {
      if (
        node.id.type === "Identifier" &&
        TLS_OPTION_NAMES.has(node.id.name) &&
        isWeakTlsValue(getStringValue(node.init))
      ) {
        report(
          context,
          node.init,
          ruleKey,
          `"${node.init.value}" is a weak SSL/TLS protocol version.`,
        );
      }
    },
  }),
);

// S4830: Server certificates should be verified during SSL/TLS connections
const S4830 = createSonarRule(
  "S4830",
  "Server certificates should be verified during SSL/TLS connections",
  (context, ruleKey) => ({
    Property(node) {
      if (getPropertyName(node) !== "rejectUnauthorized") {
        return;
      }
      const value = node.value;
      if (value.type === "Literal" && value.value === false) {
        report(
          context,
          value,
          ruleKey,
          "Certificate verification must not be disabled (rejectUnauthorized: false).",
        );
      }
    },
    AssignmentExpression(node) {
      const left = node.left;
      if (
        left.type === "MemberExpression" &&
        !left.computed &&
        left.property.type === "Identifier" &&
        left.property.name === "NODE_TLS_REJECT_UNAUTHORIZED" &&
        node.right.type === "Literal" &&
        String(node.right.value) === "0"
      ) {
        report(
          context,
          node.right,
          ruleKey,
          "Certificate verification must not be disabled via NODE_TLS_REJECT_UNAUTHORIZED=0.",
        );
      }
    },
  }),
);

// S5527: Server hostnames should be verified during SSL/TLS connections
const S5527 = createSonarRule(
  "S5527",
  "Server hostnames should be verified during SSL/TLS connections",
  (context, ruleKey) => ({
    Property(node) {
      if (getPropertyName(node) === "checkServerIdentity") {
        report(
          context,
          node.value,
          ruleKey,
          'Do not override "checkServerIdentity"; it disables hostname verification.',
        );
      }
    },
  }),
);

// S4426: Cryptographic keys should be robust
const MIN_RSA_KEY_SIZE = 2048;

const S4426 = createSonarRule(
  "S4426",
  "Cryptographic keys should be robust",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (
        methodName === "generateKeyPair" ||
        methodName === "generateKeyPairSync"
      ) {
        const options = node.arguments.find(
          (argument) => argument.type === "ObjectExpression",
        );
        if (!options) {
          return;
        }
        const modulusLength = getPropertyValue(options, "modulusLength");
        if (
          modulusLength &&
          modulusLength.type === "Literal" &&
          typeof modulusLength.value === "number" &&
          modulusLength.value < MIN_RSA_KEY_SIZE
        ) {
          report(
            context,
            modulusLength,
            ruleKey,
            `RSA modulus length must be at least ${MIN_RSA_KEY_SIZE} bits.`,
          );
        }
      }
      if (methodName === "createDiffieHellman") {
        const primeLength = node.arguments[0];
        if (
          primeLength &&
          primeLength.type === "Literal" &&
          typeof primeLength.value === "number" &&
          primeLength.value < MIN_RSA_KEY_SIZE
        ) {
          report(
            context,
            primeLength,
            ruleKey,
            `Diffie-Hellman prime length must be at least ${MIN_RSA_KEY_SIZE} bits.`,
          );
        }
      }
    },
  }),
);

// S5542: Encryption algorithms should be used with secure mode and padding scheme
const S5542 = createSonarRule(
  "S5542",
  "Encryption algorithms should be used with secure mode and padding scheme",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (
        methodName !== "createCipher" &&
        methodName !== "createCipheriv" &&
        methodName !== "createDecipher" &&
        methodName !== "createDecipheriv"
      ) {
        return;
      }
      const algorithm = getStringValue(node.arguments[0]);
      if (algorithm && /(^|-)ecb$/i.test(algorithm)) {
        report(
          context,
          node.arguments[0],
          ruleKey,
          `"${algorithm}" uses ECB mode, which is not semantically secure.`,
        );
      }
    },
  }),
);

// S5659: JWT should be signed and verified with strong cipher algorithms
const WEAK_JWT_ALGORITHMS = new Set(["none", "hs256"]);

const S5659 = createSonarRule(
  "S5659",
  "JWT should be signed and verified with strong cipher algorithms",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (methodName === "decode") {
        const callee = node.callee;
        if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          /jwt|jose/i.test(callee.object.name)
        ) {
          report(
            context,
            node,
            ruleKey,
            "jwt.decode() does not verify the token signature; use jwt.verify().",
          );
        }
        return;
      }
      if (methodName === "sign" || methodName === "verify") {
        const options = node.arguments.find(
          (argument) => argument.type === "ObjectExpression",
        );
        if (!options) {
          return;
        }
        const algorithm =
          getPropertyValue(options, "algorithm") ||
          getPropertyValue(options, "algorithms");
        if (!algorithm) {
          return;
        }
        const values =
          algorithm.type === "ArrayExpression"
            ? getStringArrayValues(algorithm).map((value) =>
                value.toLowerCase(),
              )
            : [getStringValue(algorithm)]
                .filter(Boolean)
                .map((value) => value.toLowerCase());
        if (values.some((value) => WEAK_JWT_ALGORITHMS.has(value))) {
          report(
            context,
            algorithm,
            ruleKey,
            "JWT must be signed and verified with a strong algorithm.",
          );
        }
      }
    },
  }),
);

// S5852: Using slow regular expressions is security-sensitive
const NESTED_QUANTIFIER = /\((?:\\.|[^()\\])*[*+](?:\\.|[^()\\])*\)\s*[*+{]/;
const CAPTURING_ALTERNATION_QUANTIFIER =
  /\((?!\?:)(?:\\.|[^()\\])*\|(?:\\.|[^()\\])*\)\s*[*+]/;

function hasNestedQuantifier(pattern) {
  return (
    NESTED_QUANTIFIER.test(pattern) ||
    CAPTURING_ALTERNATION_QUANTIFIER.test(pattern)
  );
}

const S5852 = createSonarRule(
  "S5852",
  "Using slow regular expressions is security-sensitive",
  (context, ruleKey) => {
    function checkPattern(node, pattern) {
      if (typeof pattern === "string" && hasNestedQuantifier(pattern)) {
        report(
          context,
          node,
          ruleKey,
          "This regular expression can backtrack super-linearly; simplify the quantified groups.",
        );
      }
    }

    return {
      Literal(node) {
        if (node.regex && typeof node.regex.pattern === "string") {
          checkPattern(node, node.regex.pattern);
        }
      },
      NewExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "RegExp"
        ) {
          const pattern = getStringValue(node.arguments[0]);
          if (pattern !== null) {
            checkPattern(node, pattern);
          }
        }
      },
    };
  },
);

module.exports = {
  S1523,
  S2245,
  S6418,
  S7639,
  S5332,
  S5443,
  S5042,
  S2598,
  S4502,
  S5876,
  S2819,
  S2755,
  S4423,
  S4830,
  S5527,
  S4426,
  S5542,
  S5659,
  S5852,
};
