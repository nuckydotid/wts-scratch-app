"use strict";

const {
  createSonarRule,
  getPropertyName,
  getMethodName,
  getStringValue,
} = require("../utils/rule-helpers");
const { createTaintTracker } = require("../utils/taint-helpers");

/**
 * MAJOR VULNERABILITY & SECURITY HOTSPOT rules (Sonar way, TypeScript).
 * Taint-based rules use the shared conservative tracker; the SonarQube server
 * remains the authority for full data-flow analysis.
 */

const HTTP_CLIENTS = new Set(["axios", "http", "https", "got", "request"]);
const HTTP_METHODS = new Set([
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "request",
]);
const CHILD_PROCESS_METHODS = new Set([
  "exec",
  "execSync",
  "execFile",
  "execFileSync",
  "spawn",
  "spawnSync",
  "fork",
]);
const FS_MODULES = ["fs", "fs/promises"];
const FS_PATH_METHODS = new Set([
  "readFile",
  "readFileSync",
  "writeFile",
  "writeFileSync",
  "appendFile",
  "appendFileSync",
  "createReadStream",
  "createWriteStream",
  "open",
  "openSync",
  "unlink",
  "unlinkSync",
  "rm",
  "rmSync",
  "rmdir",
  "rmdirSync",
  "mkdir",
  "mkdirSync",
  "rename",
  "renameSync",
  "copyFile",
  "copyFileSync",
  "access",
  "accessSync",
  "stat",
  "statSync",
  "lstat",
  "lstatSync",
  "readdir",
  "readdirSync",
  "opendir",
  "realpath",
  "chmod",
  "chmodSync",
  "chown",
  "chownSync",
  "truncate",
  "truncateSync",
  "cp",
  "link",
  "symlink",
]);

function isTargetModule(source, moduleNames) {
  return (
    typeof source === "string" &&
    moduleNames.includes(source.replace(/^node:/, ""))
  );
}

function createModuleTracker(moduleNames) {
  const namespaceVars = new Set();
  const namedVars = new Map();

  function track(node) {
    const init = node.init;
    if (
      !init ||
      init.type !== "CallExpression" ||
      init.callee.type !== "Identifier" ||
      init.callee.name !== "require" ||
      init.arguments.length === 0 ||
      init.arguments[0].type !== "Literal" ||
      !isTargetModule(init.arguments[0].value, moduleNames)
    ) {
      return;
    }
    if (node.id.type === "Identifier") {
      namespaceVars.add(node.id.name);
    } else if (node.id.type === "ObjectPattern") {
      for (const property of node.id.properties) {
        if (
          property.type === "Property" &&
          property.key.type === "Identifier" &&
          property.value.type === "Identifier"
        ) {
          namedVars.set(property.value.name, property.key.name);
        }
      }
    }
  }

  function bindImport(node) {
    if (!isTargetModule(node.source.value, moduleNames)) {
      return;
    }
    for (const specifier of node.specifiers) {
      if (specifier.type === "ImportNamespaceSpecifier") {
        namespaceVars.add(specifier.local.name);
      } else if (
        specifier.type === "ImportSpecifier" ||
        specifier.type === "ImportDefaultSpecifier"
      ) {
        namedVars.set(
          specifier.local.name,
          specifier.imported ? specifier.imported.name : "",
        );
      }
    }
  }

  function resolve(node) {
    const callee = node.callee;
    if (callee.type === "Identifier" && namedVars.has(callee.name)) {
      return { method: namedVars.get(callee.name) };
    }
    if (callee.type !== "MemberExpression") {
      return null;
    }
    const object = callee.object;
    if (object.type === "Identifier" && namespaceVars.has(object.name)) {
      return { method: getMethodName(node) };
    }
    if (
      object.type === "CallExpression" &&
      object.callee.type === "Identifier" &&
      object.callee.name === "require" &&
      object.arguments[0] &&
      object.arguments[0].type === "Literal" &&
      isTargetModule(object.arguments[0].value, moduleNames)
    ) {
      return { method: getMethodName(node) };
    }
    return null;
  }

  return { track, bindImport, resolve };
}

// S7790: Templates should not be constructed dynamically
const TEMPLATE_ENGINES = new Set([
  "ejs",
  "pug",
  "handlebars",
  "nunjucks",
  "mustache",
  "hbs",
  "eta",
]);

const S7790 = createSonarRule(
  "S7790",
  "Templates should not be constructed dynamically",
  (context, ruleKey) => ({
    CallExpression(node) {
      const callee = node.callee;
      if (callee.type !== "MemberExpression" || callee.computed) {
        return;
      }
      const object = callee.object;
      const engineName = object.type === "Identifier" ? object.name : null;
      if (!engineName || !TEMPLATE_ENGINES.has(engineName)) {
        return;
      }
      const method = getMethodName(node);
      if (
        method !== "render" &&
        method !== "compile" &&
        method !== "renderString" &&
        method !== "renderFile"
      ) {
        return;
      }
      const template = node.arguments[0];
      if (
        template &&
        template.type !== "Literal" &&
        template.type !== "TemplateLiteral"
      ) {
        context.report({
          node: template,
          message:
            "Do not construct template content dynamically; use a static template with a context object. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S5144: Server-side request forgery
const S5144 = createSonarRule(
  "S5144",
  "Server-side requests should not be vulnerable to forging attacks",
  (context, ruleKey) => {
    const tracker = createTaintTracker();
    return tracker.makeVisitors({
      CallExpression(node) {
        const callee = node.callee;
        let isRequest = false;
        if (
          callee.type === "Identifier" &&
          (callee.name === "fetch" || callee.name === "axios")
        ) {
          isRequest = true;
        } else if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          HTTP_CLIENTS.has(callee.object.name) &&
          HTTP_METHODS.has(getMethodName(node))
        ) {
          isRequest = true;
        }
        if (!isRequest) {
          return;
        }
        const target = node.arguments[0];
        if (target && tracker.isTainted(target)) {
          context.report({
            node: target,
            message: `Server-side request URL should not be built from untrusted data. [typescript:${ruleKey}]`,
          });
        }
      },
    });
  },
);

// S6287: Session cookies from untrusted input
const S6287 = createSonarRule(
  "S6287",
  "Applications should not create session cookies from untrusted input",
  (context, ruleKey) => {
    const tracker = createTaintTracker();
    return tracker.makeVisitors({
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== "MemberExpression") {
          return;
        }
        const method = getMethodName(node);
        const objectName =
          callee.object.type === "Identifier" ? callee.object.name : null;
        if (
          method === "cookie" &&
          objectName &&
          new Set(["res", "response", "reply"]).has(objectName)
        ) {
          const value = node.arguments[1];
          if (value && tracker.isTainted(value)) {
            context.report({
              node: value,
              message: `Session cookie values should not come from untrusted data. [typescript:${ruleKey}]`,
            });
          }
          return;
        }
        if (
          (method === "setHeader" || method === "header") &&
          node.arguments[0] &&
          node.arguments[0].type === "Literal" &&
          String(node.arguments[0].value).toLowerCase() === "set-cookie"
        ) {
          const value = node.arguments[1];
          if (value && tracker.isTainted(value)) {
            context.report({
              node: value,
              message: `Set-Cookie headers should not be built from untrusted data. [typescript:${ruleKey}]`,
            });
          }
        }
      },
    });
  },
);

// S6350: Constructing arguments of system commands from user input
const S6350 = createSonarRule(
  "S6350",
  "Constructing arguments of system commands from user input is security-sensitive",
  (context, ruleKey) => {
    const tracker = createTaintTracker();
    const modules = createModuleTracker(["child_process"]);
    return tracker.makeVisitors({
      VariableDeclarator: (node) => modules.track(node),
      ImportDeclaration: (node) => modules.bindImport(node),
      CallExpression(node) {
        const resolved = modules.resolve(node);
        if (!resolved || !CHILD_PROCESS_METHODS.has(resolved.method)) {
          return;
        }
        for (const argument of node.arguments) {
          if (tracker.isTainted(argument)) {
            context.report({
              node: argument,
              message: `System command arguments should not be built from user input. [typescript:${ruleKey}]`,
            });
          }
        }
      },
    });
  },
);

// S7044: Server-side path traversal
const S7044 = createSonarRule(
  "S7044",
  "Server-side requests should not be vulnerable to traversing attacks",
  (context, ruleKey) => {
    const tracker = createTaintTracker();
    const modules = createModuleTracker(FS_MODULES);
    return tracker.makeVisitors({
      VariableDeclarator: (node) => modules.track(node),
      ImportDeclaration: (node) => modules.bindImport(node),
      CallExpression(node) {
        const resolved = modules.resolve(node);
        if (!resolved || !FS_PATH_METHODS.has(resolved.method)) {
          return;
        }
        const pathArgument = node.arguments[0];
        if (pathArgument && tracker.isTainted(pathArgument)) {
          context.report({
            node: pathArgument,
            message: `File paths should not be built from untrusted data (path traversal). [typescript:${ruleKey}]`,
          });
        }
      },
    });
  },
);

// S2077: Formatting SQL queries is security-sensitive
const SQL_FORMATTING_METHODS = new Set([
  "query",
  "raw",
  "execute",
  "queryRawUnsafe",
  "executeRawUnsafe",
]);

const S2077 = createSonarRule(
  "S2077",
  "Formatting SQL queries is security-sensitive",
  (context, ruleKey) => ({
    CallExpression(node) {
      const method = getMethodName(node);
      if (!method || !SQL_FORMATTING_METHODS.has(method)) {
        return;
      }
      const query = node.arguments[0];
      if (
        query &&
        (query.type === "TemplateLiteral" ||
          (query.type === "BinaryExpression" && query.operator === "+"))
      ) {
        context.report({
          node: query,
          message:
            "Use parameterized queries instead of formatting SQL strings. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S2612: Setting loose POSIX file permissions
const S2612 = createSonarRule(
  "S2612",
  "Setting loose POSIX file permissions is security-sensitive",
  (context, ruleKey) => ({
    Literal(node) {
      if (
        typeof node.value !== "number" ||
        typeof node.raw !== "string" ||
        !/^0[oO]/.test(node.raw)
      ) {
        return;
      }
      // Others-write bit (octal 0o002).
      if ((node.value & 2) !== 0) {
        context.report({
          node,
          message: `"${node.raw}" allows write access for others; use restrictive permissions. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6275 / S6332: Unencrypted EBS volumes / EFS file systems
function createEncryptionPropertyRule(ruleKey, ruleName, propertyNames) {
  return createSonarRule(ruleKey, ruleName, (context, key) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (name && propertyNames.includes(name)) {
        const value = node.value;
        if (value.type === "Literal" && value.value === false) {
          context.report({
            node: value,
            message: `Encryption must be enabled ("${name}: false"). [typescript:${key}]`,
          });
        }
      }
    },
  }));
}

const S6275 = createEncryptionPropertyRule(
  "S6275",
  "Using unencrypted EBS volumes is security-sensitive",
  ["encrypted"],
);

const S6332 = createEncryptionPropertyRule(
  "S6332",
  "Using unencrypted EFS file systems is security-sensitive",
  ["encrypted"],
);

// S6303: Unencrypted RDS
const S6303 = createEncryptionPropertyRule(
  "S6303",
  "Using unencrypted RDS DB resources is security-sensitive",
  ["storageEncrypted"],
);

// S6308: Unencrypted Opensearch
const S6308 = createEncryptionPropertyRule(
  "S6308",
  "Using unencrypted Opensearch domains is security-sensitive",
  ["encryptAtRest", "encryptionAtRest"],
);

// S6319: Unencrypted SageMaker notebook instances
const S6319 = createSonarRule(
  "S6319",
  "Using unencrypted SageMaker notebook instances is security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (name !== "volumeKmsKeyId" && name !== "kmsKeyId") {
        return;
      }
      const value = node.value;
      const empty =
        (value.type === "Literal" && value.value === "") ||
        (value.type === "Literal" && value.value === false);
      if (empty) {
        context.report({
          node: value,
          message: `Provide a KMS key so the notebook volume is encrypted. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6327 / S6330: Unencrypted SNS topics / SQS queues
const createKmsRule = (ruleKey, ruleName) =>
  createSonarRule(ruleKey, ruleName, (context, key) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (name !== "kmsMasterKeyId" && name !== "sqsManagedSseEnabled") {
        return;
      }
      const value = node.value;
      const disabled =
        (value.type === "Literal" &&
          (value.value === "" || value.value === false)) ||
        (name === "sqsManagedSseEnabled" &&
          value.type === "Literal" &&
          value.value === false);
      if (disabled) {
        context.report({
          node: value,
          message: `Enable server-side encryption ("${name}" must not be empty or false). [typescript:${key}]`,
        });
      }
    },
  }));

const S6327 = createKmsRule(
  "S6327",
  "Using unencrypted SNS topics is security-sensitive",
);

const S6330 = createKmsRule(
  "S6330",
  "Using unencrypted SQS queues is security-sensitive",
);

// S5604: Using intrusive permissions
const INTRUSIVE_PERMISSIONS = new Set([
  "geolocation",
  "camera",
  "microphone",
  "contacts",
  "calendar",
  "location",
  "phone",
  "sms",
  "callphone",
  "readcontacts",
  "readcalendar",
]);

const S5604 = createSonarRule(
  "S5604",
  "Using intrusive permissions is security-sensitive",
  (context, ruleKey) => {
    function checkPermission(node) {
      const value = getStringValue(node);
      if (value && INTRUSIVE_PERMISSIONS.has(value.toLowerCase())) {
        context.report({
          node,
          message: `The intrusive permission "${value}" should not be requested unless strictly required. [typescript:${ruleKey}]`,
        });
      }
    }

    function checkArray(node) {
      for (const element of node.elements) {
        checkPermission(element);
      }
    }

    return {
      VariableDeclarator(node) {
        if (
          node.id.type === "Identifier" &&
          /permission/i.test(node.id.name) &&
          node.init &&
          node.init.type === "ArrayExpression"
        ) {
          checkArray(node.init);
        }
      },
      Property(node) {
        if (getPropertyName(node) !== "permissions") {
          return;
        }
        const value = node.value;
        if (value.type === "Literal") {
          checkPermission(value);
        } else if (value.type === "ArrayExpression") {
          checkArray(value);
        }
      },
    };
  },
);

// S4721: Using shell interpreter when executing OS commands
const S4721 = createSonarRule(
  "S4721",
  "Using shell interpreter when executing OS commands is security-sensitive",
  (context, ruleKey) => {
    const modules = createModuleTracker(["child_process"]);
    return {
      VariableDeclarator: (node) => modules.track(node),
      ImportDeclaration: (node) => modules.bindImport(node),
      Property(node) {
        if (
          getPropertyName(node) === "shell" &&
          node.value.type === "Literal" &&
          node.value.value === true
        ) {
          context.report({
            node: node.value,
            message:
              "Do not use a shell interpreter (shell: true) unless required and sanitized. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
      CallExpression(node) {
        const resolved = modules.resolve(node);
        if (
          resolved &&
          (resolved.method === "exec" || resolved.method === "execSync")
        ) {
          context.report({
            node,
            message: `"${resolved.method}()" uses a shell interpreter; prefer spawn/execFile. [typescript:${ruleKey}]`,
          });
        }
      },
    };
  },
);

// S5691: Statically serving hidden files
const S5691 = createSonarRule(
  "S5691",
  "Statically serving hidden files is security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      if (
        getPropertyName(node) === "dotfiles" &&
        getStringValue(node.value) === "allow"
      ) {
        context.report({
          node: node.value,
          message:
            "Do not serve hidden files (\"dotfiles: 'allow'\"). [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S5693: Allowing requests with excessive content length
const SIZE_UNITS = {
  b: 1,
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
};

function parseSizeToBytes(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  const match = /^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/i.exec(value.trim());
  if (!match) {
    return null;
  }
  const unit = (match[2] || "b").toLowerCase();
  return Number(match[1]) * SIZE_UNITS[unit];
}

const MAX_STANDARD_SIZE = 2000000;
const BODY_LIMIT_METHODS = new Set([
  "json",
  "urlencoded",
  "text",
  "raw",
  "bodyParser",
]);

const S5693 = createSonarRule(
  "S5693",
  "Allowing requests with excessive content length is security-sensitive",
  (context, ruleKey) => ({
    CallExpression(node) {
      const method = getMethodName(node);
      if (!method || !BODY_LIMIT_METHODS.has(method)) {
        return;
      }
      const options = node.arguments.find(
        (argument) => argument.type === "ObjectExpression",
      );
      if (!options) {
        return;
      }
      const limitProperty = options.properties.find(
        (property) =>
          property.type === "Property" && getPropertyName(property) === "limit",
      );
      if (!limitProperty) {
        return;
      }
      const value = limitProperty.value;
      const bytes = parseSizeToBytes(
        value.type === "Literal" ? value.value : null,
      );
      if (bytes === null || bytes <= MAX_STANDARD_SIZE) {
        return;
      }
      context.report({
        node: value,
        message: `The request size limit exceeds ${MAX_STANDARD_SIZE} bytes. [typescript:${ruleKey}]`,
      });
    },
  }),
);

// S5247: Disabling auto-escaping in template engines
const S5247 = createSonarRule(
  "S5247",
  "Disabling auto-escaping in template engines is security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (
        (name === "autoescape" || name === "autoEscape" || name === "escape") &&
        node.value.type === "Literal" &&
        node.value.value === false
      ) {
        context.report({
          node: node.value,
          message: `Do not disable auto-escaping ("${name}: false"). [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

module.exports = {
  S7790,
  S5144,
  S6287,
  S6350,
  S7044,
  S2077,
  S2612,
  S6275,
  S6332,
  S6303,
  S6308,
  S6319,
  S6327,
  S6330,
  S5604,
  S4721,
  S5691,
  S5693,
  S5247,
};
