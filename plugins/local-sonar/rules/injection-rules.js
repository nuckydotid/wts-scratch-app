"use strict";

const {
  createTaintTracker,
  getStaticMemberPath,
  getCalleeName,
} = require("../utils/taint-helpers");

/**
 * Injection & untrusted-data rules (Sonar way, TypeScript).
 *
 * These rules implement conservative data-flow checks: identifiers assigned
 * from well-known untrusted sources are tracked within the file and reported
 * when reaching dangerous sinks. Cross-file flows are out of scope for the
 * AST heuristic; the SonarQube server remains the authority for full taint
 * analysis.
 */

function createInjectionRule(ruleKey, ruleName, createFn) {
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

function isTargetModule(source, moduleNames) {
  if (typeof source !== "string") {
    return false;
  }
  return moduleNames.includes(source.replace(/^node:/, ""));
}

/**
 * Tracks variables bound to a set of modules (require/import) so sinks can be
 * resolved to module calls, including destructured and namespace bindings.
 */
function createModuleTracker(moduleNames) {
  const namespaceVars = new Map();
  const namedVars = new Map();
  const moduleVarNames = new Set(moduleNames);

  function bindRequire(declarator) {
    const init = declarator.init;
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
    if (declarator.id.type === "Identifier") {
      namespaceVars.set(declarator.id.name, init.arguments[0].value);
      return;
    }
    if (declarator.id.type === "ObjectPattern") {
      for (const property of declarator.id.properties) {
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
        namespaceVars.set(specifier.local.name, node.source.value);
      } else if (specifier.type === "ImportSpecifier") {
        namedVars.set(specifier.local.name, specifier.imported.name);
      } else if (specifier.type === "ImportDefaultSpecifier") {
        namespaceVars.set(specifier.local.name, node.source.value);
      }
    }
  }

  function resolveModuleCall(node) {
    const callee = node.callee;
    if (!callee) {
      return null;
    }
    if (callee.type === "Identifier" && namedVars.has(callee.name)) {
      return {
        moduleName: namedVars.get(callee.name),
        methodName: callee.name,
      };
    }
    if (callee.type !== "MemberExpression") {
      return null;
    }
    const methodName =
      !callee.computed && callee.property.type === "Identifier"
        ? callee.property.name
        : null;
    if (!methodName) {
      return null;
    }
    let object = callee.object;
    if (
      object.type === "MemberExpression" &&
      !object.computed &&
      object.property.type === "Identifier" &&
      object.property.name === "promises"
    ) {
      object = object.object;
    }
    if (object.type === "Identifier" && namespaceVars.has(object.name)) {
      return { moduleName: namespaceVars.get(object.name), methodName };
    }
    if (
      object.type === "CallExpression" &&
      object.callee.type === "Identifier" &&
      object.callee.name === "require" &&
      object.arguments.length > 0 &&
      object.arguments[0].type === "Literal" &&
      isTargetModule(object.arguments[0].value, moduleNames)
    ) {
      return { moduleName: object.arguments[0].value, methodName };
    }
    return null;
  }

  function trackVariable(node) {
    bindRequire(node);
  }

  return {
    moduleVarNames,
    trackVariable,
    bindImport,
    resolveModuleCall,
    isNamespaceVar: (name) => namespaceVars.has(name),
    getNamedBindings: () => namedVars,
  };
}

function isResponseRoot(name) {
  return new Set(["res", "response", "reply", "ctx", "context"]).has(name);
}

function getRootName(node) {
  const memberPath = getStaticMemberPath(node);
  return memberPath ? memberPath.split(".")[0] : null;
}

function getPropertyName(node) {
  if (!node || node.type !== "Property" || !node.key) {
    return null;
  }
  if (node.key.type === "Identifier") {
    return node.key.name;
  }
  if (node.key.type === "Literal") {
    return String(node.key.value);
  }
  return null;
}

// S2076: OS command injection
const CHILD_PROCESS_MODULES = ["child_process"];
const CHILD_PROCESS_METHODS = new Set([
  "exec",
  "execSync",
  "execFile",
  "execFileSync",
  "spawn",
  "spawnSync",
  "fork",
]);

const S2076 = createInjectionRule(
  "S2076",
  "OS commands should not be vulnerable to command injection attacks",
  (context, ruleKey) => {
    const tracker = createTaintTracker();
    const modules = createModuleTracker(CHILD_PROCESS_MODULES);

    return tracker.makeVisitors({
      VariableDeclarator: (node) => modules.trackVariable(node),
      ImportDeclaration: (node) => modules.bindImport(node),
      CallExpression(node) {
        const resolved = modules.resolveModuleCall(node);
        if (!resolved || !CHILD_PROCESS_METHODS.has(resolved.methodName)) {
          return;
        }
        for (const argument of node.arguments) {
          if (tracker.isTainted(argument)) {
            context.report({
              node: argument,
              message: `OS command arguments should not be built from untrusted data. [typescript:${ruleKey}]`,
            });
          }
        }
      },
    });
  },
);

// S2083: Path injection on I/O calls
const FS_MODULES = ["fs", "fs/promises"];
const FS_PATH_METHODS = new Set([
  "readFile",
  "readFileSync",
  "writeFile",
  "writeFileSync",
  "appendFile",
  "appendFileSync",
  "open",
  "openSync",
  "createReadStream",
  "createWriteStream",
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
  "opendirSync",
  "realpath",
  "realpathSync",
  "chmod",
  "chmodSync",
  "chown",
  "chownSync",
  "truncate",
  "truncateSync",
  "utimes",
  "utimesSync",
  "cp",
  "link",
  "symlink",
]);

const S2083 = createInjectionRule(
  "S2083",
  "I/O function calls should not be vulnerable to path injection attacks",
  (context, ruleKey) => {
    const tracker = createTaintTracker();
    const modules = createModuleTracker(FS_MODULES);

    return tracker.makeVisitors({
      VariableDeclarator: (node) => modules.trackVariable(node),
      ImportDeclaration: (node) => modules.bindImport(node),
      CallExpression(node) {
        const resolved = modules.resolveModuleCall(node);
        if (!resolved || !FS_PATH_METHODS.has(resolved.methodName)) {
          return;
        }
        const pathArgument = node.arguments[0];
        if (pathArgument && tracker.isTainted(pathArgument)) {
          context.report({
            node: pathArgument,
            message: `I/O paths should not be built from untrusted data. [typescript:${ruleKey}]`,
          });
        }
      },
    });
  },
);

// S3649: Database query injection
const DB_QUERY_METHODS = new Set([
  "query",
  "raw",
  "queryRaw",
  "queryRawUnsafe",
  "executeRaw",
  "executeRawUnsafe",
  "$queryRaw",
  "$queryRawUnsafe",
  "$executeRaw",
  "$executeRawUnsafe",
  "literal",
  "unsafe",
]);

const S3649 = createInjectionRule(
  "S3649",
  "Database queries should not be vulnerable to injection attacks",
  (context, ruleKey) => {
    const tracker = createTaintTracker();

    return tracker.makeVisitors({
      CallExpression(node) {
        const methodName = getCalleeName(node);
        if (!methodName || !DB_QUERY_METHODS.has(methodName)) {
          return;
        }
        // Only the query text (first argument) is a sink: parameterized values
        // passed in later arguments are the recommended pattern.
        const query = node.arguments[0];
        if (query && tracker.isTainted(query)) {
          context.report({
            node: query,
            message: `Database queries should not be built from untrusted data. [typescript:${ruleKey}]`,
          });
        }
      },
    });
  },
);

// S5147: NoSQL injection
const NOSQL_METHODS = new Set([
  "find",
  "findOne",
  "findOneAndUpdate",
  "findOneAndDelete",
  "findOneAndReplace",
  "updateOne",
  "updateMany",
  "replaceOne",
  "deleteOne",
  "deleteMany",
  "countDocuments",
  "estimatedDocumentCount",
  "distinct",
  "aggregate",
  "bulkWrite",
  "insertOne",
  "insertMany",
  "mapReduce",
]);

const S5147 = createInjectionRule(
  "S5147",
  "NoSQL operations should not be vulnerable to injection attacks",
  (context, ruleKey) => {
    const tracker = createTaintTracker();

    return tracker.makeVisitors({
      CallExpression(node) {
        const methodName = getCalleeName(node);
        if (!methodName || !NOSQL_METHODS.has(methodName)) {
          return;
        }
        for (const argument of node.arguments) {
          // Inline objects containing "$where" are reported by the Property
          // handler to avoid duplicate findings.
          if (
            argument.type === "ObjectExpression" &&
            argument.properties.some(
              (property) =>
                property.type === "Property" &&
                ((property.key.type === "Identifier" &&
                  property.key.name === "$where") ||
                  (property.key.type === "Literal" &&
                    property.key.value === "$where")),
            )
          ) {
            continue;
          }
          if (tracker.isTainted(argument)) {
            context.report({
              node: argument,
              message: `NoSQL queries should not be built from untrusted data. [typescript:${ruleKey}]`,
            });
          }
        }
      },
      Property(node) {
        if (
          getPropertyName(node) === "$where" &&
          tracker.isTainted(node.value)
        ) {
          context.report({
            node: node.value,
            message: `"$where" should not be built from untrusted data. [typescript:${ruleKey}]`,
          });
        }
      },
    });
  },
);

// S5146: HTTP redirect (open redirect)
const REDIRECT_ROOTS = ["res", "response", "reply", "ctx", "context"];
const HEADER_METHODS = new Set(["setHeader", "header"]);

function isLocationHeaderName(node) {
  if (!node) {
    return false;
  }
  if (node.type === "Identifier") {
    return node.name.toLowerCase() === "location";
  }
  if (node.type === "Literal") {
    return String(node.value).toLowerCase() === "location";
  }
  return false;
}

const S5146 = createInjectionRule(
  "S5146",
  "HTTP request redirections should not be open to forging attacks",
  (context, ruleKey) => {
    const tracker = createTaintTracker();

    function report(node) {
      context.report({
        node,
        message: `HTTP redirects should not use untrusted data. [typescript:${ruleKey}]`,
      });
    }

    function checkHeaderCall(node) {
      const headerName = node.arguments[0];
      const headerValue = node.arguments[1];
      if (
        isLocationHeaderName(headerName) &&
        headerValue &&
        tracker.isTainted(headerValue)
      ) {
        report(headerValue);
      }
    }

    function checkWriteHeadHeaders(node) {
      const headers = node.arguments[1];
      if (!headers || headers.type !== "ObjectExpression") {
        return;
      }
      for (const property of headers.properties) {
        if (
          property.type === "Property" &&
          isLocationHeaderName(property.key) &&
          tracker.isTainted(property.value)
        ) {
          report(property.value);
        }
      }
    }

    return tracker.makeVisitors({
      CallExpression(node) {
        const callee = node.callee;
        if (!callee || callee.type !== "MemberExpression") {
          return;
        }
        const rootName = getRootName(callee.object);
        if (!rootName || !REDIRECT_ROOTS.includes(rootName)) {
          return;
        }
        const methodName = getCalleeName(node);
        if (methodName === "redirect") {
          const target = node.arguments[0];
          if (target && tracker.isTainted(target)) {
            report(target);
          }
          return;
        }
        if (HEADER_METHODS.has(methodName)) {
          checkHeaderCall(node);
          return;
        }
        if (methodName === "writeHead") {
          checkWriteHeadHeaders(node);
        }
      },
    });
  },
);

// S6105: DOM navigation open redirect
const S6105 = createInjectionRule(
  "S6105",
  "DOM updates should not lead to open redirect vulnerabilities",
  (context, ruleKey) => {
    const tracker = createTaintTracker();

    function isLocationPath(node) {
      const memberPath = getStaticMemberPath(node);
      if (!memberPath) {
        return false;
      }
      return (
        memberPath === "window.location" ||
        memberPath === "document.location" ||
        memberPath === "location" ||
        memberPath.startsWith("window.location.") ||
        memberPath.startsWith("document.location.") ||
        memberPath.startsWith("location.")
      );
    }

    function report(node) {
      context.report({
        node,
        message: `DOM navigation should not use untrusted data. [typescript:${ruleKey}]`,
      });
    }

    function reportIfTainted(target) {
      if (target && tracker.isTainted(target)) {
        report(target);
      }
    }

    function checkNavigationCall(node) {
      const callee = node.callee;
      if (!callee || callee.type !== "MemberExpression") {
        return;
      }
      const methodName = getCalleeName(node);
      if (methodName === "open") {
        const objectPath = getStaticMemberPath(callee.object);
        if (objectPath === "window" || objectPath === "globalThis") {
          reportIfTainted(node.arguments[0]);
        }
        return;
      }
      if (
        (methodName === "assign" || methodName === "replace") &&
        isLocationPath(callee.object)
      ) {
        reportIfTainted(node.arguments[0]);
      }
    }

    return tracker.makeVisitors({
      AssignmentExpression(node) {
        if (
          node.left.type === "MemberExpression" &&
          isLocationPath(node.left) &&
          tracker.isTainted(node.right)
        ) {
          report(node.right);
        }
      },
      CallExpression: checkNavigationCall,
    });
  },
);

// S5131: Reflected XSS in HTTP responses
const RESPONSE_METHODS = new Set(["send", "write", "end", "html", "sendFile"]);

const S5131 = createInjectionRule(
  "S5131",
  "Endpoints should not be vulnerable to reflected cross-site scripting (XSS) attacks",
  (context, ruleKey) => {
    const tracker = createTaintTracker();

    return tracker.makeVisitors({
      CallExpression(node) {
        const callee = node.callee;
        if (!callee || callee.type !== "MemberExpression") {
          return;
        }
        const methodName = getCalleeName(node);
        if (!methodName || !RESPONSE_METHODS.has(methodName)) {
          return;
        }
        const objectPath = getStaticMemberPath(callee.object);
        const rootName = objectPath ? objectPath.split(".")[0] : null;
        if (!rootName || !isResponseRoot(rootName)) {
          return;
        }
        const payload = node.arguments[0];
        if (payload && tracker.isTainted(payload)) {
          context.report({
            node: payload,
            message: `Reflected user input should be escaped before being written to the response. [typescript:${ruleKey}]`,
          });
        }
      },
      AssignmentExpression(node) {
        if (node.left.type !== "MemberExpression") {
          return;
        }
        const object = node.left.object;
        if (object.type !== "Identifier" || !isResponseRoot(object.name)) {
          return;
        }
        const property =
          !node.left.computed && node.left.property.type === "Identifier"
            ? node.left.property.name
            : null;
        if (
          property &&
          ["body", "html"].includes(property) &&
          tracker.isTainted(node.right)
        ) {
          context.report({
            node: node.right,
            message: `Reflected user input should be escaped before being written to the response. [typescript:${ruleKey}]`,
          });
        }
      },
    });
  },
);

// S5696: DOM XSS
const DOM_HTML_PROPERTIES = new Set(["innerHTML", "outerHTML"]);
const DOM_WRITE_METHODS = new Set(["write", "writeln", "insertAdjacentHTML"]);

const S5696 = createInjectionRule(
  "S5696",
  "DOM updates should not lead to cross-site scripting (XSS) attacks",
  (context, ruleKey) => {
    const tracker = createTaintTracker();

    function report(node) {
      context.report({
        node,
        message: `DOM updates should not use untrusted data. [typescript:${ruleKey}]`,
      });
    }

    return tracker.makeVisitors({
      AssignmentExpression(node) {
        if (
          node.left.type !== "MemberExpression" ||
          node.left.computed ||
          node.left.property.type !== "Identifier"
        ) {
          return;
        }
        const property = node.left.property.name;
        if (
          DOM_HTML_PROPERTIES.has(property) &&
          tracker.isTainted(node.right)
        ) {
          report(node.right);
        }
      },
      CallExpression(node) {
        const callee = node.callee;
        if (!callee || callee.type !== "MemberExpression") {
          return;
        }
        const methodName = getCalleeName(node);
        if (!methodName || !DOM_WRITE_METHODS.has(methodName)) {
          return;
        }
        const objectPath = getStaticMemberPath(callee.object);
        if (
          methodName === "insertAdjacentHTML" ||
          objectPath === "document" ||
          objectPath === "window.document"
        ) {
          const payload = node.arguments.at(-1);
          if (payload && tracker.isTainted(payload)) {
            report(payload);
          }
        }
      },
      JSXAttribute(node) {
        if (!node.name || node.name.name !== "dangerouslySetInnerHTML") {
          return;
        }
        const value = node.value;
        if (
          !value ||
          value.type !== "JSXExpressionContainer" ||
          value.expression.type !== "ObjectExpression"
        ) {
          return;
        }
        for (const property of value.expression.properties) {
          if (
            property.type === "Property" &&
            tracker.isTainted(property.value)
          ) {
            report(property.value);
          }
        }
      },
    });
  },
);

// S6096: Zip slip (archive entry names used as file paths)
const ARCHIVE_ENTRY_FIELDS = new Set([
  "fileName",
  "filename",
  "path",
  "name",
  "fullName",
  "entryName",
]);

const S6096 = createInjectionRule(
  "S6096",
  "Extracting archives should not lead to zip slip vulnerabilities",
  (context, ruleKey) => {
    const tracker = createTaintTracker();
    const modules = createModuleTracker(FS_MODULES);
    const entryNames = new Set();

    function collectEntryParam(pattern) {
      if (!pattern) {
        return;
      }
      if (pattern.type === "Identifier") {
        entryNames.add(pattern.name);
      } else if (pattern.type === "ObjectPattern") {
        for (const property of pattern.properties) {
          if (property.type === "Property") {
            collectEntryParam(property.value);
          }
        }
      }
    }

    function isEntryMemberAccess(node) {
      if (node.type !== "MemberExpression") {
        return false;
      }
      const property =
        !node.computed && node.property.type === "Identifier"
          ? node.property.name
          : null;
      return (
        Boolean(property) &&
        ARCHIVE_ENTRY_FIELDS.has(property) &&
        node.object.type === "Identifier" &&
        entryNames.has(node.object.name)
      );
    }

    function isEntryExpression(node) {
      if (!node) {
        return false;
      }
      if (node.type === "Identifier") {
        return entryNames.has(node.name);
      }
      if (node.type === "MemberExpression") {
        return isEntryMemberAccess(node) || isEntryExpression(node.object);
      }
      if (node.type === "TemplateLiteral") {
        return node.expressions.some((expression) =>
          isEntryExpression(expression),
        );
      }
      if (node.type === "BinaryExpression") {
        return isEntryExpression(node.left) || isEntryExpression(node.right);
      }
      if (node.type === "CallExpression") {
        return node.arguments.some((argument) => isEntryExpression(argument));
      }
      return false;
    }

    function trackEntryCallback(node) {
      if (
        getCalleeName(node) !== "on" ||
        node.arguments.length < 2 ||
        node.arguments[0].type !== "Literal" ||
        !/^(entry|file)$/.test(String(node.arguments[0].value))
      ) {
        return;
      }
      const callback = node.arguments[1];
      if (
        callback.type !== "ArrowFunctionExpression" &&
        callback.type !== "FunctionExpression"
      ) {
        return;
      }
      for (const parameter of callback.params) {
        collectEntryParam(parameter);
      }
    }

    function checkFsSink(node) {
      const resolved = modules.resolveModuleCall(node);
      if (!resolved || !FS_PATH_METHODS.has(resolved.methodName)) {
        return;
      }
      const pathArgument = node.arguments[0];
      if (isEntryExpression(pathArgument)) {
        context.report({
          node: pathArgument,
          message: `Archive entry names should be validated before building file paths (zip slip). [typescript:${ruleKey}]`,
        });
      }
    }

    return tracker.makeVisitors({
      VariableDeclarator: (node) => modules.trackVariable(node),
      ImportDeclaration: (node) => modules.bindImport(node),
      CallExpression(node) {
        trackEntryCallback(node);
        checkFsSink(node);
      },
    });
  },
);

// S2631: Regular expression injection
const S2631 = createInjectionRule(
  "S2631",
  "Regular expressions should not be vulnerable to Denial of Service attacks",
  (context, ruleKey) => {
    const tracker = createTaintTracker();

    function checkPattern(node, pattern) {
      if (pattern && tracker.isTainted(pattern)) {
        context.report({
          node: pattern,
          message: `Regular expressions should not be built from untrusted data. [typescript:${ruleKey}]`,
        });
      }
    }

    return tracker.makeVisitors({
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "RegExp"
        ) {
          checkPattern(node, node.arguments[0]);
        }
      },
      NewExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "RegExp"
        ) {
          checkPattern(node, node.arguments[0]);
        }
      },
    });
  },
);

module.exports = {
  S2076,
  S2083,
  S3649,
  S5146,
  S5147,
  S6105,
  S5131,
  S5696,
  S6096,
  S2631,
  FS_MODULES,
  FS_PATH_METHODS,
};
