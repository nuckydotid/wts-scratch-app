"use strict";

const {
  createSonarRule,
  getPropertyName,
  getMethodName,
  getStringValue,
  isFunction,
} = require("../utils/rule-helpers");
const { createAstWalker } = require("../utils/ast-walk");
const { createTaintTracker } = require("../utils/taint-helpers");
const { getTypeServices, getTypescript } = require("../utils/type-helpers");

/**
 * MINOR / INFO rules (Sonar way, TypeScript).
 */

const BUILTIN_MODULES = new Set([
  "assert",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "inspector",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "timers",
  "tls",
  "trace_events",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "wasi",
  "worker_threads",
  "zlib",
]);

const COOKIE_RESPONSE_ROOTS = new Set(["res", "response", "reply"]);

function isBuiltinErrorName(name) {
  return /^(?:Error|[A-Z][A-Za-z]*Error)$/.test(name);
}

// S7722: Built-in error objects should have meaningful messages
const S7722 = createSonarRule(
  "S7722",
  "Built-in error objects should have meaningful messages",
  (context, ruleKey) => ({
    NewExpression(node) {
      const calleeName =
        node.callee.type === "Identifier" ? node.callee.name : null;
      if (!calleeName || !isBuiltinErrorName(calleeName)) {
        return;
      }
      const message = node.arguments[0];
      const isEmptyMessage =
        !message ||
        (message.type === "Literal" &&
          typeof message.value === "string" &&
          message.value.trim().length === 0);
      if (isEmptyMessage) {
        context.report({
          node,
          message: `Provide a meaningful message to ${calleeName}. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7723: Built-in constructors should be called consistently
const S7723 = createSonarRule(
  "S7723",
  'Built-in constructors should be called consistently with or without "new"',
  (context, ruleKey) => ({
    CallExpression(node) {
      const name = node.callee.type === "Identifier" ? node.callee.name : null;
      if (name && (name === "Array" || name === "Error")) {
        context.report({
          node,
          message: `Call "${name}()" with "new". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7726: Default exports should be named
const S7726 = createSonarRule(
  "S7726",
  "Default exports should be named",
  (context, ruleKey) => ({
    ExportDefaultDeclaration(node) {
      const declaration = node.declaration;
      if (
        declaration.type === "ArrowFunctionExpression" ||
        declaration.type === "FunctionExpression" ||
        declaration.type === "ClassExpression"
      ) {
        context.report({
          node: declaration,
          message:
            "Name this default export so it appears in stack traces. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7729: Array method callbacks should not use the "thisArg" parameter
const S7729 = createSonarRule(
  "S7729",
  'Array method callbacks should not use the "thisArg" parameter',
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      const callee = node.callee;
      const receiver =
        callee && callee.type === "MemberExpression" ? callee.object : null;
      const isChildrenMap =
        receiver &&
        ((receiver.type === "Identifier" && receiver.name === "Children") ||
          (receiver.type === "MemberExpression" &&
            receiver.property?.type === "Identifier" &&
            receiver.property.name === "Children"));
      if (
        methodName &&
        !isChildrenMap &&
        new Set(["map", "forEach", "filter", "some", "every", "find"]).has(
          methodName,
        ) &&
        node.arguments.length > 1
      ) {
        context.report({
          node: node.arguments[1],
          message: `Do not use the "thisArg" parameter of "${methodName}()". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7752: ".map().flat()" should be replaced with ".flatMap()"
const S7752 = createSonarRule(
  "S7752",
  'Array methods ".map().flat()" should be replaced with ".flatMap()"',
  (context, ruleKey) => ({
    CallExpression(node) {
      if (
        getMethodName(node) === "flat" &&
        node.callee.type === "MemberExpression" &&
        node.callee.object.type === "CallExpression" &&
        getMethodName(node.callee.object) === "map"
      ) {
        context.report({
          node,
          message:
            'Replace ".map().flat()" with ".flatMap()". [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7753: indexOf should be used for simple equality searches
const S7753 = createSonarRule(
  "S7753",
  '"indexOf()" and "lastIndexOf()" should be used instead of "findIndex()" and "findLastIndex()" for simple equality searches',
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (
        (methodName === "findIndex" || methodName === "findLastIndex") &&
        node.arguments[0] &&
        (node.arguments[0].type === "ArrowFunctionExpression" ||
          node.arguments[0].type === "FunctionExpression")
      ) {
        const callback = node.arguments[0];
        const body = callback.body;
        const returnsEquality =
          (body.type === "BinaryExpression" &&
            (body.operator === "===" || body.operator === "==")) ||
          (body.type === "BlockStatement" &&
            body.body.length === 1 &&
            body.body[0].type === "ReturnStatement" &&
            body.body[0].argument &&
            body.body[0].argument.type === "BinaryExpression" &&
            (body.body[0].argument.operator === "===" ||
              body.body[0].argument.operator === "=="));
        if (returnsEquality) {
          context.report({
            node,
            message: `Use "indexOf()" instead of "${methodName}()" for a simple equality search. [typescript:${ruleKey}]`,
          });
        }
      }
    },
  }),
);

// S7754: Use ".some()" instead of ".filter().length" checks
const S7754 = createSonarRule(
  "S7754",
  'Use ".some()" instead of ".filter().length" checks or ".find()" for existence testing',
  (context, ruleKey) => ({
    MemberExpression(node) {
      if (
        !node.computed &&
        node.property.type === "Identifier" &&
        node.property.name === "length" &&
        node.object.type === "CallExpression" &&
        getMethodName(node.object) === "filter"
      ) {
        context.report({
          node,
          message:
            'Use ".some()" instead of ".filter().length". [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7756: Modern Blob methods should be used instead of FileReader
const S7756 = createSonarRule(
  "S7756",
  "Modern Blob methods should be used instead of FileReader",
  (context, ruleKey) => ({
    NewExpression(node) {
      if (
        node.callee.type === "Identifier" &&
        node.callee.name === "FileReader"
      ) {
        context.report({
          node,
          message:
            "Use Blob.text()/arrayBuffer() instead of FileReader. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7757: Class properties should be declared as fields
function collectClassFieldNames(classBody) {
  const names = new Set();
  for (const member of classBody.body) {
    if (
      member.type === "PropertyDefinition" &&
      member.key?.type === "Identifier"
    ) {
      names.add(member.key.name);
    }
  }
  return names;
}

const S7757 = createSonarRule(
  "S7757",
  "Class properties should be declared as fields rather than assigned in constructors",
  (context, ruleKey) => {
    function collectAssigned(constructor) {
      const assigned = new Set();
      const walk = createAstWalker(context.sourceCode);
      walk(constructor.value.body, (child) => {
        if (
          child.type === "AssignmentExpression" &&
          child.left.type === "MemberExpression" &&
          !child.left.computed &&
          child.left.object.type === "ThisExpression" &&
          child.left.property.type === "Identifier"
        ) {
          assigned.add(child.left.property.name);
        }
        return false;
      });
      return assigned;
    }

    return {
      ClassBody(node) {
        const fieldNames = collectClassFieldNames(node);
        for (const member of node.body) {
          if (
            member.type !== "MethodDefinition" ||
            member.kind !== "constructor"
          ) {
            continue;
          }
          const assigned = collectAssigned(member);
          const missing = [...assigned].find((name) => !fieldNames.has(name));
          if (missing) {
            context.report({
              node: member.key,
              message: `Declare "${missing}" as a class field instead of assigning it in the constructor. [typescript:${ruleKey}]`,
            });
            return;
          }
        }
      },
    };
  },
);

// S7758: Unicode-aware string methods
const S7758 = createSonarRule(
  "S7758",
  "Unicode-aware string methods should be used for proper character handling",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (methodName === "charAt" || methodName === "charCodeAt") {
        const replacement = methodName === "charAt" ? "at()" : "codePointAt()";
        context.report({
          node,
          message: `Use "${replacement}" for Unicode-aware character handling. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7759: Use Date.now() for timestamps
const S7759 = createSonarRule(
  "S7759",
  'Use "Date.now()" instead of creating Date objects to get current timestamp',
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (
        (methodName === "getTime" || methodName === "valueOf") &&
        node.callee.type === "MemberExpression" &&
        node.callee.object.type === "NewExpression" &&
        node.callee.object.callee.type === "Identifier" &&
        node.callee.object.callee.name === "Date" &&
        node.callee.object.arguments.length === 0
      ) {
        context.report({
          node,
          message:
            "Use Date.now() instead of new Date().getTime(). [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7750: Prefer find/findLast over filter for single elements
const S7750 = createSonarRule(
  "S7750",
  'Array methods ".find()" and ".findLast()" should be preferred over ".filter()" for single element retrieval',
  (context, ruleKey) => ({
    MemberExpression(node) {
      if (node.computed || node.property.type !== "Literal") {
        return;
      }
      if (
        node.property.value === 0 &&
        node.object.type === "CallExpression" &&
        getMethodName(node.object) === "filter"
      ) {
        context.report({
          node,
          message:
            'Use ".find()" instead of ".filter()[0]". [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7751: Array flattening should use flat()
const S7751 = createSonarRule(
  "S7751",
  'Array flattening should use the native "flat()" method',
  (context, ruleKey) => ({
    CallExpression(node) {
      if (getMethodName(node) !== "concat") {
        return;
      }
      if (
        node.arguments.some((argument) => argument.type === "SpreadElement")
      ) {
        context.report({
          node,
          message:
            'Use ".flat()" instead of concat with spread. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7755: Use .at() for complex index access
const S7755 = createSonarRule(
  "S7755",
  'Complex index access patterns should be replaced with ".at()" method',
  (context, ruleKey) => ({
    MemberExpression(node) {
      if (!node.computed || node.property.type !== "BinaryExpression") {
        return;
      }
      const { left, right, operator } = node.property;
      if (
        operator === "-" &&
        left.type === "MemberExpression" &&
        !left.computed &&
        left.property.type === "Identifier" &&
        left.property.name === "length" &&
        left.object === node.object &&
        right.type === "Literal"
      ) {
        context.report({
          node,
          message: `Use ".at(-${right.value})" instead of a length calculation. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7763: Re-exports should use "export...from" syntax
const S7763 = createSonarRule(
  "S7763",
  'Re-exports should use "export...from" syntax',
  (context, ruleKey) => {
    const importedNames = new Set();
    return {
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          if (specifier.type === "ImportSpecifier") {
            importedNames.add(specifier.local.name);
          }
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source || importedNames.size === 0) {
          return;
        }
        for (const specifier of node.specifiers || []) {
          if (
            specifier.local?.type === "Identifier" &&
            importedNames.has(specifier.local.name)
          ) {
            context.report({
              node: specifier,
              message:
                'Re-export directly with "export ... from". [typescript:' +
                ruleKey +
                "]",
            });
          }
        }
      },
    };
  },
);

// S7764: Use globalThis
const S7764 = createSonarRule(
  "S7764",
  'Use "globalThis" instead of "window", "self", or "global"',
  (context, ruleKey) => ({
    MemberExpression(node) {
      if (
        node.object.type === "Identifier" &&
        new Set(["window", "self", "global"]).has(node.object.name) &&
        !node.computed &&
        node.property.type === "Identifier" &&
        node.property.name !== "location"
      ) {
        context.report({
          node: node.object,
          message: `Use "globalThis" instead of "${node.object.name}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7765: Use includes instead of indexOf existence checks
const S7765 = createSonarRule(
  "S7765",
  'Existence checks should use ".includes()" instead of ".indexOf()" or ".lastIndexOf()"',
  (context, ruleKey) => ({
    BinaryExpression(node) {
      if (!new Set(["!==", "!=", "===", "==", ">=", ">"]).has(node.operator)) {
        return;
      }
      const isIndexOf = (operand) =>
        operand.type === "CallExpression" &&
        ["indexOf", "lastIndexOf"].includes(getMethodName(operand));
      const zero = (operand) =>
        operand.type === "Literal" && operand.value === 0;
      const negativeOne = (operand) =>
        operand.type === "Literal" && operand.value === -1;
      const exists =
        (isIndexOf(node.left) &&
          ((zero(node.right) &&
            (node.operator === ">=" || node.operator === ">")) ||
            (negativeOne(node.right) &&
              (node.operator === "!==" || node.operator === "!=")))) ||
        (isIndexOf(node.right) &&
          zero(node.left) &&
          (node.operator === "<=" || node.operator === "<"));
      if (exists) {
        context.report({
          node,
          message:
            'Use ".includes()" for existence checks. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7766: Use Math.min/Math.max for simple comparisons
const S7766 = createSonarRule(
  "S7766",
  'Ternary expressions should be replaced with "Math.min()" or "Math.max()" for simple comparisons',
  (context, ruleKey) => ({
    ConditionalExpression(node) {
      const { test, consequent, alternate } = node;
      if (
        test.type === "BinaryExpression" &&
        (test.operator === "<" || test.operator === ">") &&
        context.sourceCode.getText(test.left) ===
          context.sourceCode.getText(consequent) &&
        context.sourceCode.getText(test.right) ===
          context.sourceCode.getText(alternate)
      ) {
        context.report({
          node,
          message:
            "Use Math.min()/Math.max() for this comparison. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7769: Modern Math APIs
const S7769 = createSonarRule(
  "S7769",
  "Modern Math APIs should be used instead of legacy mathematical expressions",
  (context, ruleKey) => ({
    CallExpression(node) {
      if (
        getMethodName(node) === "pow" &&
        node.callee.type === "MemberExpression" &&
        node.callee.object.type === "Identifier" &&
        node.callee.object.name === "Math"
      ) {
        context.report({
          node,
          message:
            "Use the exponentiation operator (**) instead of Math.pow(). [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7732: instanceof should not be used with built-ins
const S7732 = createSonarRule(
  "S7732",
  '"instanceof" should not be used with built-in objects',
  (context, ruleKey) => ({
    BinaryExpression(node) {
      if (
        node.operator === "instanceof" &&
        node.right.type === "Identifier" &&
        new Set([
          "Array",
          "Object",
          "String",
          "Number",
          "Boolean",
          "Function",
        ]).has(node.right.name)
      ) {
        context.report({
          node,
          message: `Use Array.isArray()/typeof instead of "instanceof ${node.right.name}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7733: HTTP GET/HEAD requests should not include a body
const S7733 = createSonarRule(
  "S7733",
  "HTTP GET and HEAD requests should not include a request body",
  (context, ruleKey) => ({
    CallExpression(node) {
      if (getMethodName(node) !== "fetch" || node.arguments.length < 2) {
        return;
      }
      const options = node.arguments[1];
      if (!options || options.type !== "ObjectExpression") {
        return;
      }
      const method = getPropertyNameValue(options, "method");
      const isGetOrHead =
        !method || ["GET", "HEAD"].includes(String(method).toUpperCase());
      if (isGetOrHead && hasPropertyName(options, "body")) {
        context.report({
          node,
          message:
            "GET/HEAD requests must not include a body. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

function getPropertyNameValue(objectExpression, name) {
  const property = (objectExpression.properties || []).find(
    (item) => item.type === "Property" && getPropertyName(item) === name,
  );
  if (!property) {
    return null;
  }
  const value = property.value;
  return value.type === "Literal" ? value.value : null;
}

function hasPropertyName(objectExpression, name) {
  return (objectExpression.properties || []).some(
    (item) => item.type === "Property" && getPropertyName(item) === name,
  );
}

// S7734: Default imports/exports should use dedicated syntax
const S7734 = createSonarRule(
  "S7734",
  "Default imports and exports should use the dedicated syntax",
  (context, ruleKey) => ({
    ImportDeclaration(node) {
      for (const specifier of node.specifiers) {
        if (
          specifier.type === "ImportSpecifier" &&
          specifier.imported.type === "Identifier" &&
          specifier.imported.name === "default"
        ) {
          context.report({
            node: specifier,
            message:
              'Use a default import instead of "{ default as ... }". [typescript:' +
              ruleKey +
              "]",
          });
        }
      }
    },
    ExportNamedDeclaration(node) {
      for (const specifier of node.specifiers || []) {
        if (
          specifier.exported.type === "Identifier" &&
          specifier.exported.name === "default"
        ) {
          context.report({
            node: specifier,
            message:
              'Use "export default" instead of "export { ... as default }". [typescript:' +
              ruleKey +
              "]",
          });
        }
      }
    },
  }),
);

// S7736: Negated expressions should not be used in equality checks
const S7736 = createSonarRule(
  "S7736",
  "Negated expressions should not be used in equality checks",
  (context, ruleKey) => ({
    BinaryExpression(node) {
      if (
        (node.operator === "===" || node.operator === "==") &&
        node.right.type === "Literal" &&
        typeof node.right.value === "boolean" &&
        node.left.type === "UnaryExpression" &&
        node.left.operator === "!"
      ) {
        context.report({
          node,
          message:
            'Rewrite this negated equality check without the "!" operator. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7737: Objects should not be used as default parameters
const S7737 = createSonarRule(
  "S7737",
  "Objects should not be used as default parameters",
  (context, ruleKey) => {
    function check(fn) {
      for (const param of fn.params || []) {
        if (
          param.type === "AssignmentPattern" &&
          param.right.type === "ObjectExpression" &&
          param.right.properties.length > 0
        ) {
          context.report({
            node: param,
            message:
              "Do not use a shared object literal as a default parameter. [typescript:" +
              ruleKey +
              "]",
          });
        }
      }
    }
    return {
      FunctionDeclaration: check,
      FunctionExpression: check,
      ArrowFunctionExpression: check,
    };
  },
);

// S7738: Single-element arrays should not be passed to Promise methods
const S7738 = createSonarRule(
  "S7738",
  "Single-element arrays should not be passed to Promise methods",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (
        methodName &&
        new Set(["all", "race", "allSettled", "any"]).has(methodName) &&
        node.callee.type === "MemberExpression" &&
        node.callee.object.type === "Identifier" &&
        node.callee.object.name === "Promise" &&
        node.arguments[0] &&
        node.arguments[0].type === "ArrayExpression" &&
        node.arguments[0].elements.length === 1
      ) {
        context.report({
          node: node.arguments[0],
          message: `Pass the promise directly instead of a single-element array to Promise.${methodName}(). [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7741: typeof should not be used to check for undefined
const S7741 = createSonarRule(
  "S7741",
  '"typeof" should not be used to check for "undefined"',
  (context, ruleKey) => ({
    BinaryExpression(node) {
      if (!new Set(["===", "!==", "==", "!="]).has(node.operator)) {
        return;
      }
      const isTypeof = (operand) =>
        operand.type === "UnaryExpression" &&
        operand.operator === "typeof" &&
        operand.argument.type === "Identifier";
      const isUndefinedLiteral = (operand) =>
        (operand.type === "Literal" && operand.value === "undefined") ||
        (operand.type === "Identifier" && operand.name === "undefined");
      if (
        (isTypeof(node.left) && isUndefinedLiteral(node.right)) ||
        (isTypeof(node.right) && isUndefinedLiteral(node.left))
      ) {
        context.report({
          node,
          message:
            "Compare the value directly with undefined. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7742: Polyfills should not be used
const S7742 = createSonarRule(
  "S7742",
  "Polyfills should not be used when native support is available in target environments",
  (context, ruleKey) => ({
    AssignmentExpression(node) {
      const left = node.left;
      if (
        left.type === "MemberExpression" &&
        left.object.type === "MemberExpression" &&
        !left.object.computed &&
        left.object.object.type === "Identifier" &&
        new Set(["Object", "Array", "String", "Number"]).has(
          left.object.object.name,
        ) &&
        left.object.property.type === "Identifier" &&
        left.object.property.name === "prototype"
      ) {
        context.report({
          node: left,
          message:
            "Native support exists for this API; remove the polyfill. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7743: IIFE with parenthesized arrow expressions
const S7743 = createSonarRule(
  "S7743",
  "Immediately invoked arrow functions with parenthesized expressions should be avoided",
  (context, ruleKey) => ({
    CallExpression(node) {
      if (
        node.callee.type === "ArrowFunctionExpression" &&
        node.callee.body.type !== "BlockStatement"
      ) {
        context.report({
          node,
          message:
            "Avoid immediately invoked arrow functions with expression bodies. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7745: Array length checks before some/every
const S7745 = createSonarRule(
  "S7745",
  'Array length checks should not be used before "some()" and "every()" calls',
  (context, ruleKey) => ({
    LogicalExpression(node) {
      if (node.operator !== "&&") {
        return;
      }
      const isLengthCheck = (operand) =>
        operand.type === "BinaryExpression" &&
        operand.left.type === "MemberExpression" &&
        !operand.left.computed &&
        operand.left.property.type === "Identifier" &&
        operand.left.property.name === "length";
      const isSomeOrEvery = (operand) =>
        operand.type === "CallExpression" &&
        ["some", "every"].includes(getMethodName(operand));
      if (isLengthCheck(node.left) && isSomeOrEvery(node.right)) {
        context.report({
          node: node.left,
          message:
            'Remove the length check before ".some()/.every()". [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7747: Spread syntax should not be used unnecessarily
const S7747 = createSonarRule(
  "S7747",
  "Spread syntax should not be used unnecessarily",
  (context, ruleKey) => ({
    ArrayExpression(node) {
      if (
        node.elements.length === 1 &&
        node.elements[0] &&
        node.elements[0].type === "SpreadElement" &&
        node.parent &&
        (node.parent.type === "CallExpression" ||
          node.parent.type === "NewExpression") &&
        node.parent.arguments.includes(node)
      ) {
        context.report({
          node,
          message:
            "Pass the array directly instead of spreading it into a new array. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7748: Number literals should not have unnecessary decimal points
const S7748 = createSonarRule(
  "S7748",
  "Number literals should not have unnecessary decimal points or trailing zeros",
  (context, ruleKey) => ({
    Literal(node) {
      if (
        typeof node.value === "number" &&
        typeof node.raw === "string" &&
        /^\d+\.0+$/.test(node.raw)
      ) {
        context.report({
          node,
          message: `Remove the unnecessary decimal point from "${node.raw}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7744: Unnecessary fallback objects when spreading
const S7744 = createSonarRule(
  "S7744",
  "Unnecessary fallback objects should not be used when spreading in object literals",
  (context, ruleKey) => ({
    SpreadElement(node) {
      if (
        node.argument.type === "LogicalExpression" &&
        node.argument.operator === "||" &&
        node.argument.right.type === "ObjectExpression" &&
        node.argument.right.properties.length === 0
      ) {
        context.report({
          node: node.argument.right,
          message:
            'Remove the unnecessary "|| {}" fallback when spreading. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7749: Consistent digit grouping
const S7749 = createSonarRule(
  "S7749",
  "Numeric literals should use consistent digit grouping with separators",
  (context, ruleKey) => {
    let usesSeparator = false;
    return {
      "Program:exit"(node) {
        const walk = createAstWalker(context.sourceCode);
        walk(node, (child) => {
          if (
            child.type === "Literal" &&
            typeof child.value === "number" &&
            typeof child.raw === "string" &&
            child.raw.includes("_")
          ) {
            usesSeparator = true;
          }
          return false;
        });
        if (!usesSeparator) {
          return;
        }
        walk(node, (child) => {
          if (
            child.type === "Literal" &&
            typeof child.value === "number" &&
            typeof child.raw === "string" &&
            /^\d{5,}$/.test(child.raw)
          ) {
            context.report({
              node: child,
              message: `Use digit separators consistently (e.g. ${Number(child.raw).toLocaleString("en-US").replaceAll(",", "_")}). [typescript:${ruleKey}]`,
            });
          }
          return false;
        });
      },
    };
  },
);

// S7776: Arrays used only for existence checks should be Sets
const S7776 = createSonarRule(
  "S7776",
  "Arrays used only for existence checks should be Sets",
  (context, ruleKey) => {
    const candidates = new Map();
    return {
      VariableDeclarator(node) {
        if (
          node.id.type === "Identifier" &&
          node.init &&
          node.init.type === "ArrayExpression" &&
          (node.init.elements?.length || 0) >= 3
        ) {
          candidates.set(node.id.name, {
            node: node.id,
            includesUsages: 0,
            otherUsages: 0,
          });
        }
      },
      Identifier(node) {
        const entry = candidates.get(node.name);
        if (!entry || entry.node === node) {
          return;
        }
        const parent = node.parent;
        if (
          parent &&
          parent.type === "VariableDeclarator" &&
          parent.id === node
        ) {
          return;
        }
        const isIncludesCall =
          parent &&
          parent.type === "MemberExpression" &&
          parent.object === node &&
          !parent.computed &&
          parent.property?.type === "Identifier" &&
          parent.property.name === "includes";
        if (isIncludesCall) {
          entry.includesUsages += 1;
        } else {
          entry.otherUsages += 1;
        }
      },
      "Program:exit"() {
        for (const entry of candidates.values()) {
          if (entry.includesUsages === 0 || entry.otherUsages > 0) {
            continue;
          }
          context.report({
            node: entry.node,
            message:
              'Use a Set and ".has()" for existence checks on "' +
              entry.node.name +
              '". [typescript:' +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

// S7777: Set size should be accessed directly
const S7777 = createSonarRule(
  "S7777",
  "Set size should be accessed directly instead of converting to array first",
  (context, ruleKey) => ({
    MemberExpression(node) {
      if (
        node.computed ||
        node.property.type !== "Identifier" ||
        node.property.name !== "length"
      ) {
        return;
      }
      const object = node.object;
      const isArrayFromSet =
        (object.type === "CallExpression" &&
          getMethodName(object) === "from" &&
          object.callee.type === "MemberExpression" &&
          object.callee.object.type === "Identifier" &&
          object.callee.object.name === "Array") ||
        (object.type === "ArrayExpression" &&
          object.elements.length === 1 &&
          object.elements[0]?.type === "SpreadElement");
      if (isArrayFromSet) {
        context.report({
          node,
          message:
            'Use ".size" instead of converting the Set to an array. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7778: Consecutive method calls should be combined
const S7778 = createSonarRule(
  "S7778",
  "Multiple consecutive calls to methods that accept multiple arguments should be combined",
  (context, ruleKey) => ({
    ExpressionStatement(node) {
      const expression = node.expression;
      if (
        expression.type !== "CallExpression" ||
        expression.callee.type !== "MemberExpression" ||
        expression.callee.computed
      ) {
        return;
      }
      const methodName = getMethodName(expression);
      if (!new Set(["push", "unshift", "add"]).has(methodName)) {
        return;
      }
      const parent = node.parent;
      if (!parent || !Array.isArray(parent.body)) {
        return;
      }
      const index = parent.body.indexOf(node);
      const previous = index > 0 ? parent.body[index - 1] : null;
      if (
        previous &&
        previous.type === "ExpressionStatement" &&
        previous.expression.type === "CallExpression" &&
        previous.expression.callee.type === "MemberExpression" &&
        !previous.expression.callee.computed &&
        previous.expression.callee.property.type === "Identifier" &&
        previous.expression.callee.property.name === methodName &&
        context.sourceCode.getText(previous.expression.callee.object) ===
          context.sourceCode.getText(expression.callee.object)
      ) {
        context.report({
          node,
          message: `Combine consecutive "${methodName}()" calls into one. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7770: Wrapper functions around conversion functions
const S7770 = createSonarRule(
  "S7770",
  "Wrapper functions around built-in type conversion functions should be avoided",
  (context, ruleKey) => {
    const CONVERSIONS = {
      toNumber: "Number",
      toString: "String",
      toBoolean: "Boolean",
    };
    return {
      FunctionDeclaration(node) {
        const name = node.id?.name;
        const expected = name && CONVERSIONS[name];
        if (!expected || !node.body || node.body.body.length !== 1) {
          return;
        }
        const statement = node.body.body[0];
        if (
          statement.type === "ReturnStatement" &&
          statement.argument?.type === "CallExpression" &&
          statement.argument.callee.type === "Identifier" &&
          statement.argument.callee.name === expected
        ) {
          context.report({
            node: node.id,
            message: `Call "${expected}()" directly instead of wrapping it. [typescript:${ruleKey}]`,
          });
        }
      },
    };
  },
);

// S7771: Negative indices should be used instead of length calculations
const S7771 = createSonarRule(
  "S7771",
  "Negative indices should be used instead of length calculations",
  (context, ruleKey) => ({
    MemberExpression(node) {
      if (
        !node.computed ||
        node.property.type !== "BinaryExpression" ||
        node.property.operator !== "-"
      ) {
        return;
      }
      const { left, right } = node.property;
      if (
        left.type === "MemberExpression" &&
        !left.computed &&
        left.property.type === "Identifier" &&
        left.property.name === "length" &&
        right.type === "Literal"
      ) {
        context.report({
          node,
          message: `Use a negative index instead of "length - ${right.value}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7772: Node.js built-in modules should use the "node:" protocol
const S7772 = createSonarRule(
  "S7772",
  'Node.js built-in modules should be imported using the "node:" protocol',
  (context, ruleKey) => ({
    ImportDeclaration(node) {
      const source = node.source.value;
      if (typeof source === "string" && BUILTIN_MODULES.has(source)) {
        context.report({
          node: node.source,
          message: `Import "${source}" as "node:${source}". [typescript:${ruleKey}]`,
        });
      }
    },
    CallExpression(node) {
      if (
        node.callee.type === "Identifier" &&
        node.callee.name === "require" &&
        node.arguments[0] &&
        node.arguments[0].type === "Literal" &&
        typeof node.arguments[0].value === "string" &&
        BUILTIN_MODULES.has(node.arguments[0].value)
      ) {
        context.report({
          node: node.arguments[0],
          message: `Require "node:${node.arguments[0].value}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7773: Number static methods should be preferred
const S7773 = createSonarRule(
  "S7773",
  "Number static methods and properties should be preferred over global equivalents",
  (context, ruleKey) => ({
    CallExpression(node) {
      const name = getMethodName(node);
      if (
        node.callee.type === "Identifier" &&
        name &&
        new Set(["parseInt", "parseFloat", "isNaN", "isFinite"]).has(name)
      ) {
        context.report({
          node,
          message: `Use Number.${name}() instead of the global ${name}(). [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7784: structuredClone should be used instead of other deep cloning methods
const S7784 = createSonarRule(
  "S7784",
  '"structuredClone()" should be used instead of other deep cloning methods',
  (context, ruleKey) => ({
    CallExpression(node) {
      if (
        getMethodName(node) === "parse" &&
        node.callee.type === "MemberExpression" &&
        node.callee.object.type === "Identifier" &&
        node.callee.object.name === "JSON" &&
        node.arguments[0]?.type === "CallExpression" &&
        getMethodName(node.arguments[0]) === "stringify" &&
        node.arguments[0].callee.type === "MemberExpression" &&
        node.arguments[0].callee.object.type === "Identifier" &&
        node.arguments[0].callee.object.name === "JSON"
      ) {
        context.report({
          node,
          message:
            "Use structuredClone() instead of JSON.parse(JSON.stringify()). [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7786: Generic Error should be TypeError after type checking
const S7786 = createSonarRule(
  "S7786",
  'Generic "Error" should be "TypeError" when thrown after type checking',
  (context, ruleKey) => ({
    ThrowStatement(node) {
      const argument = node.argument;
      if (
        !argument ||
        argument.type !== "NewExpression" ||
        argument.callee.type !== "Identifier" ||
        argument.callee.name !== "Error"
      ) {
        return;
      }
      const parent = node.parent;
      if (!parent || parent.type !== "BlockStatement") {
        return;
      }
      const index = parent.body.indexOf(node);
      const previous = index > 0 ? parent.body[index - 1] : null;
      const isTypeCheck =
        previous &&
        previous.type === "IfStatement" &&
        previous.test.type === "BinaryExpression" &&
        previous.test.left.type === "UnaryExpression" &&
        previous.test.left.operator === "typeof";
      if (isTypeCheck) {
        context.report({
          node: argument,
          message:
            "Throw a TypeError after a type check. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7787: Empty import/export specifier lists
const S7787 = createSonarRule(
  "S7787",
  "Import and export statements should not have empty specifier lists",
  (context, ruleKey) => {
    function hasEmptyBraces(node) {
      const text = context.sourceCode.getText(node);
      return /^(?:import|export)\s*\{\s*\}/.test(text);
    }

    return {
      ImportDeclaration(node) {
        if (node.specifiers.length === 0 && hasEmptyBraces(node)) {
          context.report({
            node,
            message:
              "Remove the empty import specifier list. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
      ExportNamedDeclaration(node) {
        if (
          !node.declaration &&
          node.specifiers.length === 0 &&
          hasEmptyBraces(node)
        ) {
          context.report({
            node,
            message:
              "Remove the empty export specifier list. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

// S7780: String.raw should be used for escaped backslashes
const S7780 = createSonarRule(
  "S7780",
  "String literals with escaped backslashes should use `String.raw` template literals",
  (context, ruleKey) => ({
    Literal(node) {
      if (
        typeof node.raw === "string" &&
        /^['"]/.test(node.raw) &&
        node.raw.includes(String.fromCharCode(92).repeat(2))
      ) {
        context.report({
          node,
          message:
            "Use a String.raw template literal instead of escaped backslashes. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6827: Anchors should contain accessible content
const S6827 = createSonarRule(
  "S6827",
  "Anchors should contain accessible content",
  (context, ruleKey) => ({
    JSXElement(node) {
      const opening = node.openingElement;
      const name =
        opening.name && opening.name.type === "JSXIdentifier"
          ? opening.name.name
          : null;
      if (name !== "a") {
        return;
      }
      const hasContent = (node.children || []).some(
        (child) =>
          (child.type === "JSXText" && child.value.trim().length > 0) ||
          child.type === "JSXExpressionContainer" ||
          (child.type === "JSXElement" &&
            child.openingElement.name?.type === "JSXIdentifier" &&
            child.openingElement.name.name === "img"),
      );
      if (!hasContent) {
        context.report({
          node: opening,
          message:
            "Anchors must contain accessible content. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6957: Deprecated React APIs
const S6957 = createSonarRule(
  "S6957",
  "Deprecated React APIs should not be used",
  (context, ruleKey) => ({
    CallExpression(node) {
      if (
        node.callee.type === "MemberExpression" &&
        !node.callee.computed &&
        node.callee.object.type === "Identifier" &&
        node.callee.object.name === "React" &&
        node.callee.property.type === "Identifier" &&
        ["createClass", "createFactory"].includes(node.callee.property.name)
      ) {
        context.report({
          node,
          message: `React.${node.callee.property.name} is deprecated. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S1472: Function call arguments should not start on new lines
const S1472 = createSonarRule(
  "S1472",
  "Function call arguments should not start on new lines",
  (context, ruleKey) => ({
    CallExpression(node) {
      if (node.arguments.length === 0) {
        return;
      }
      // Only the ASI hazard matters: the opening parenthesis itself starting
      // on a new line relative to the callee, e.g. "foo\n(1, 2)".
      const between = context.sourceCode.text.slice(
        node.callee.range[1],
        node.arguments[0].range[0],
      );
      const parenIndex = between.indexOf("(");
      if (parenIndex !== -1 && between.slice(0, parenIndex).includes("\n")) {
        context.report({
          node: node.arguments[0],
          message:
            "Move the opening parenthesis onto the same line as the call. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S3330: Cookies without HttpOnly flag
const S3330 = createSonarRule(
  "S3330",
  'Creating cookies without the "HttpOnly" flag is security-sensitive',
  (context, ruleKey) => ({
    CallExpression(node) {
      if (
        getMethodName(node) !== "cookie" ||
        node.callee.type !== "MemberExpression" ||
        node.callee.object.type !== "Identifier" ||
        !COOKIE_RESPONSE_ROOTS.has(node.callee.object.name)
      ) {
        return;
      }
      const options = node.arguments[2];
      const hasHttpOnly =
        options &&
        options.type === "ObjectExpression" &&
        getPropertyNameValue(options, "httpOnly") === true;
      if (!hasHttpOnly) {
        context.report({
          node,
          message:
            'Set "httpOnly: true" on session cookies. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6606: Nullish coalescing should be preferred
const S6606 = createSonarRule(
  "S6606",
  "Nullish coalescing should be preferred",
  (context, ruleKey) => ({
    LogicalExpression(node) {
      if (node.operator !== "&&") {
        return;
      }
      const isNotNullCheck = (operand) =>
        operand.type === "BinaryExpression" &&
        (operand.operator === "!==" || operand.operator === "!=") &&
        operand.right.type === "Literal" &&
        operand.right.value === null;
      if (isNotNullCheck(node.left)) {
        context.report({
          node,
          message:
            "Use the nullish coalescing operator (??) instead. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S1516: Multiline string literals should not be used
const S1516 = createSonarRule(
  "S1516",
  "Multiline string literals should not be used",
  (context, ruleKey) => ({
    Literal(node) {
      if (
        typeof node.raw === "string" &&
        /^['"]/.test(node.raw) &&
        node.raw.includes(String.fromCharCode(92) + "\n")
      ) {
        context.report({
          node,
          message:
            "Use a template literal instead of a multiline string. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S1444: Public static fields should be read-only
const S1444 = createSonarRule(
  "S1444",
  'Public "static" fields should be read-only',
  (context, ruleKey) => ({
    PropertyDefinition(node) {
      if (
        node.static &&
        !node.readonly &&
        node.accessibility !== "private" &&
        node.accessibility !== "protected"
      ) {
        context.report({
          node: node.key,
          message:
            'Make this public static field "readonly". [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S3863: Imports from the same module should be merged
const S3863 = createSonarRule(
  "S3863",
  "Imports from the same module should be merged",
  (context, ruleKey) => {
    const seen = new Map();
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== "string") {
          return;
        }
        if (seen.has(source)) {
          context.report({
            node: node.source,
            message: `Merge this import with the earlier import from "${source}". [typescript:${ruleKey}]`,
          });
        }
        seen.set(source, node);
      },
    };
  },
);

// S4084: Media elements should have captions
const S4084 = createSonarRule(
  "S4084",
  "Media elements should have captions",
  (context, ruleKey) => ({
    JSXElement(node) {
      const opening = node.openingElement;
      if (
        opening.name?.type !== "JSXIdentifier" ||
        opening.name.name !== "video"
      ) {
        return;
      }
      const hasCaptions = (node.children || []).some(
        (child) =>
          child.type === "JSXElement" &&
          child.openingElement.name?.type === "JSXIdentifier" &&
          child.openingElement.name.name === "track",
      );
      if (!hasCaptions) {
        context.report({
          node: opening,
          message:
            'Add a <track kind="captions"> to this video. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S1090: iFrames must have a title
const S1090 = createSonarRule(
  "S1090",
  "iFrames must have a title",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      if (node.name?.type !== "JSXIdentifier" || node.name.name !== "iframe") {
        return;
      }
      const hasTitle = (node.attributes || []).some(
        (attribute) =>
          attribute.type === "JSXAttribute" && attribute.name?.name === "title",
      );
      if (!hasTitle) {
        context.report({
          node,
          message:
            "Add a title attribute to this iframe. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S4138: "for of" should be used with Iterables
const S4138 = createSonarRule(
  "S4138",
  '"for of" should be used with Iterables',
  (context, ruleKey) => ({
    ForOfStatement(node) {
      const right = node.right;
      const isNonIterable =
        (right.type === "Literal" && typeof right.value !== "string") ||
        right.type === "ObjectExpression" ||
        (right.type === "UnaryExpression" && right.operator === "-");
      if (isNonIterable) {
        context.report({
          node: right,
          message:
            '"for...of" requires an iterable value. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6551: Objects coerced to strings should define toString()
const S6551 = createSonarRule(
  "S6551",
  'Objects and classes converted or coerced to strings should define a "toString()" method',
  (context, ruleKey) => ({
    TemplateLiteral(node) {
      for (const expression of node.expressions) {
        if (expression.type === "ObjectExpression") {
          context.report({
            node: expression,
            message:
              'Define a "toString()" method on objects interpolated into strings. [typescript:' +
              ruleKey +
              "]",
          });
        }
      }
    },
  }),
);

// S6647: Unnecessary constructors should be removed
const S6647 = createSonarRule(
  "S6647",
  "Unnecessary constructors should be removed",
  (context, ruleKey) => ({
    MethodDefinition(node) {
      if (node.kind !== "constructor" || !node.value?.body) {
        return;
      }
      const statements = node.value.body.body;
      if (statements.length !== 1) {
        return;
      }
      const statement = statements[0];
      if (
        statement.type === "ExpressionStatement" &&
        statement.expression.type === "CallExpression" &&
        statement.expression.callee.type === "Super" &&
        statement.expression.arguments.every(
          (argument) => argument.type === "SpreadElement",
        )
      ) {
        context.report({
          node: node.key,
          message:
            "Remove this unnecessary constructor. [typescript:" + ruleKey + "]",
        });
      }
    },
  }),
);

// S6767: Unused React typed props should be removed
const S6767 = createSonarRule(
  "S6767",
  "Unused React typed props should be removed",
  (context, ruleKey) => {
    const services = getTypeServices(context);
    if (!services) {
      // Type-aware rule: no-op without projectService (see eslint.config.js).
      return {};
    }
    const { checker, toTsNode, toEsNode } = services;
    const ts = getTypescript();

    function referenceMembers(typeNode) {
      const tsNode = toTsNode(typeNode.typeName);
      const symbol = checker.getSymbolAtLocation(tsNode);
      const resolved =
        symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0
          ? checker.getAliasedSymbol(symbol)
          : symbol;
      const declarations = resolved?.declarations || [];
      const declaration = declarations.find(
        (entry) => !entry.getSourceFile().fileName.includes("node_modules"),
      );
      if (!declaration) {
        return [];
      }
      const esDeclaration = toEsNode(declaration);
      if (!esDeclaration) {
        return [];
      }
      if (esDeclaration.type === "TSInterfaceDeclaration") {
        return esDeclaration.body?.body || [];
      }
      if (
        esDeclaration.type === "TSTypeAliasDeclaration" &&
        esDeclaration.typeAnnotation?.type === "TSTypeLiteral"
      ) {
        return esDeclaration.typeAnnotation.members;
      }
      return [];
    }

    function membersOfTypeNode(typeNode) {
      if (!typeNode) {
        return [];
      }
      if (typeNode.type === "TSTypeLiteral") {
        return typeNode.members;
      }
      if (typeNode.type === "TSIntersectionType") {
        return typeNode.types.flatMap((type) => membersOfTypeNode(type));
      }
      if (
        typeNode.type === "TSTypeReference" &&
        typeNode.typeName?.type === "Identifier"
      ) {
        return referenceMembers(typeNode);
      }
      return [];
    }

    function bodyHasJsx(body) {
      let found = false;
      const walk = createAstWalker(context.sourceCode);
      walk(body, (child) => {
        if (found) {
          return true;
        }
        if (child.type === "JSXElement" || child.type === "JSXFragment") {
          found = true;
          return true;
        }
        return false;
      });
      return found;
    }

    function collectUsedNames(body, propsName) {
      const used = new Set();
      const walk = createAstWalker(context.sourceCode);
      walk(body, (child) => {
        if (child.type === "Identifier") {
          const parent = child.parent;
          const isMemberAccess =
            parent &&
            parent.type === "MemberExpression" &&
            parent.property === child &&
            !parent.computed;
          if (isMemberAccess) {
            if (
              parent.object.type === "Identifier" &&
              parent.object.name === propsName
            ) {
              used.add(child.name);
            }
          } else {
            used.add(child.name);
          }
        }
        return false;
      });
      return used;
    }

    function typeNodeFromWrapper(node) {
      const parent = node.parent;
      if (!parent || parent.type !== "CallExpression") {
        return null;
      }
      const callee = parent.callee;
      let name = null;
      if (callee?.type === "Identifier") {
        name = callee.name;
      } else if (callee?.property?.type === "Identifier") {
        name = callee.property.name;
      }
      const typeArguments = parent.typeArguments || parent.typeParameters;
      const params = typeArguments?.params || [];
      if (name === "forwardRef" && params[1]) {
        return params[1];
      }
      if (name === "memo" && params[0]) {
        return params[0];
      }
      return null;
    }

    function checkFunction(node) {
      const first = (node.params || [])[0];
      if (
        !first ||
        first.type !== "ObjectPattern" ||
        !node.body ||
        node.body.type !== "BlockStatement"
      ) {
        return;
      }
      const typeNode =
        first.typeAnnotation?.typeAnnotation || typeNodeFromWrapper(node);
      const members = membersOfTypeNode(typeNode);
      if (members.length === 0) {
        return;
      }
      if (!bodyHasJsx(node.body)) {
        return;
      }
      const propsName = first.type === "Identifier" ? first.name : null;
      const used = collectUsedNames(node.body, propsName);
      for (const member of members) {
        if (
          member.type !== "TSPropertySignature" ||
          member.key?.type !== "Identifier" ||
          used.has(member.key.name)
        ) {
          continue;
        }
        context.report({
          node: member.key,
          message: `'${member.key.name}' PropType is defined but prop is never used [typescript:${ruleKey}]`,
        });
      }
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    };
  },
);

// S1077: Images should have alternative text
const S1077 = createSonarRule(
  "S1077",
  "Image, area, button with image and object elements should have an alternative text",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const name = node.name?.type === "JSXIdentifier" ? node.name.name : null;
      if (name !== "img" && name !== "area") {
        return;
      }
      const hasAlt = (node.attributes || []).some(
        (attribute) =>
          attribute.type === "JSXAttribute" && attribute.name?.name === "alt",
      );
      if (!hasAlt) {
        context.report({
          node,
          message: `Add an "alt" attribute to this <${name}>. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6644: Ternary operator should not be used instead of simpler alternatives
const S6644 = createSonarRule(
  "S6644",
  "Ternary operator should not be used instead of simpler alternatives",
  (context, ruleKey) => ({
    ConditionalExpression(node) {
      const testText = context.sourceCode.getText(node.test);
      if (
        testText === context.sourceCode.getText(node.consequent) ||
        testText === context.sourceCode.getText(node.alternate)
      ) {
        context.report({
          node,
          message:
            "Simplify this ternary expression. [typescript:" + ruleKey + "]",
        });
      }
    },
  }),
);

// S1082: Mouse events should have corresponding keyboard events
const S1082 = createSonarRule(
  "S1082",
  "Mouse events should have corresponding keyboard events",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      const attributeNames = (node.attributes || [])
        .filter((attribute) => attribute.type === "JSXAttribute")
        .map((attribute) => attribute.name?.name);
      const hasMouse = attributeNames.includes("onMouseOver");
      const hasKeyboard = attributeNames.includes("onFocus");
      if (hasMouse && !hasKeyboard) {
        context.report({
          node,
          message:
            "Add an onFocus handler alongside onMouseOver. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6650: Renaming to the same name
const S6650 = createSonarRule(
  "S6650",
  "Renaming import, export, and destructuring assignments should not be to the same name",
  (context, ruleKey) => ({
    ImportSpecifier(node) {
      if (
        node.imported.type !== "Identifier" ||
        node.local.type !== "Identifier" ||
        node.imported.name !== node.local.name
      ) {
        return;
      }
      const between = context.sourceCode.text.slice(
        node.imported.range[1],
        node.local.range[0],
      );
      if (/\bas\b/.test(between)) {
        context.report({
          node,
          message: `Remove the redundant rename "${node.imported.name} as ${node.local.name}". [typescript:${ruleKey}]`,
        });
      }
    },
    Property(node) {
      if (
        node.parent?.type === "ObjectPattern" &&
        !node.shorthand &&
        node.key.type === "Identifier" &&
        node.value.type === "Identifier" &&
        node.key.name === node.value.name
      ) {
        context.report({
          node,
          message: `Remove the redundant rename "${node.key.name}: ${node.value.name}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6653: Use Object.hasOwn
const S6653 = createSonarRule(
  "S6653",
  "Use Object.hasOwn static method instead of hasOwnProperty",
  (context, ruleKey) => ({
    CallExpression(node) {
      if (
        getMethodName(node) === "hasOwnProperty" &&
        node.callee.type === "MemberExpression"
      ) {
        context.report({
          node,
          message:
            "Use Object.hasOwn(obj, key) instead of obj.hasOwnProperty(key). [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6654: __proto__ property should not be used
const S6654 = createSonarRule(
  "S6654",
  "__proto__ property should not be used",
  (context, ruleKey) => ({
    MemberExpression(node) {
      if (
        !node.computed &&
        node.property.type === "Identifier" &&
        node.property.name === "__proto__"
      ) {
        context.report({
          node,
          message:
            'Do not use the "__proto__" property; use Object.getPrototypeOf(). [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
    Property(node) {
      if (getPropertyName(node) === "__proto__") {
        context.report({
          node: node.key,
          message:
            'Do not use the "__proto__" property. [typescript:' + ruleKey + "]",
        });
      }
    },
  }),
);

// S6775: defaultProps should have non-required PropTypes
const S6775 = createSonarRule(
  "S6775",
  'All "defaultProps" should have non-required PropTypes',
  (context, ruleKey) => {
    function check(node) {
      const defaultProps = (node.body.body || []).find(
        (member) => getPropertyName(member) === "defaultProps",
      );
      if (!defaultProps) {
        return;
      }
      const walk = createAstWalker(context.sourceCode);
      let hasRequiredProp = false;
      walk(node, (child) => {
        if (
          child.type === "MemberExpression" &&
          !child.computed &&
          child.property.type === "Identifier" &&
          child.property.name === "isRequired"
        ) {
          hasRequiredProp = true;
          return true;
        }
        return false;
      });
      if (hasRequiredProp) {
        context.report({
          node: defaultProps.key,
          message:
            "Props with defaultProps must not be marked as isRequired. [typescript:" +
            ruleKey +
            "]",
        });
      }
    }
    return { ClassDeclaration: check, ClassExpression: check };
  },
);

// S5148: window.opener access
const S5148 = createSonarRule(
  "S5148",
  "Authorizing an opened window to access back to the originating window is security-sensitive",
  (context, ruleKey) => ({
    MemberExpression(node) {
      if (
        !node.computed &&
        node.property.type === "Identifier" &&
        node.property.name === "opener" &&
        node.object.type === "Identifier" &&
        node.object.name === "window"
      ) {
        context.report({
          node,
          message:
            "Do not expose window.opener to opened windows. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S5264: <object> tags should provide alternative content
const S5264 = createSonarRule(
  "S5264",
  '"<object>" tags should provide an alternative content',
  (context, ruleKey) => ({
    JSXElement(node) {
      if (
        node.openingElement.name?.type !== "JSXIdentifier" ||
        node.openingElement.name.name !== "object"
      ) {
        return;
      }
      const hasContent = (node.children || []).some(
        (child) =>
          (child.type === "JSXText" && child.value.trim().length > 0) ||
          child.type === "JSXElement",
      );
      if (!hasContent) {
        context.report({
          node: node.openingElement,
          message:
            "Provide alternative content inside <object>. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6598: Function types should be preferred
const S6598 = createSonarRule(
  "S6598",
  "Function types should be preferred",
  (context, ruleKey) => ({
    TSInterfaceDeclaration(node) {
      const members = node.body?.body || [];
      if (
        members.length === 1 &&
        members[0].type === "TSCallSignatureDeclaration"
      ) {
        context.report({
          node: node.id,
          message: `Replace interface "${node.id.name}" with a function type. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6565: Prefer the return type "this" in fluent interfaces
const S6565 = createSonarRule(
  "S6565",
  'Prefer the return type "this" in fluent interfaces',
  (context, ruleKey) => ({
    MethodDefinition(node) {
      if (!node.value) {
        return;
      }
      const returnType = node.value.returnType?.typeAnnotation;
      const className = node.parent?.parent?.id?.name;
      if (
        returnType?.type === "TSTypeReference" &&
        returnType.typeName?.type === "Identifier" &&
        returnType.typeName.name === className
      ) {
        context.report({
          node: node.value.returnType,
          message: `Use the return type "this" instead of "${className}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6568: Non-null assertions should not be used misleadingly
const S6568 = createSonarRule(
  "S6568",
  "Non-null assertions should not be used misleadingly",
  (context, ruleKey) => ({
    TSNonNullExpression(node) {
      if (
        node.expression.type === "MemberExpression" &&
        node.expression.optional
      ) {
        context.report({
          node,
          message:
            "Do not combine optional chaining with a non-null assertion. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S2094: Classes should not be empty
const S2094 = createSonarRule(
  "S2094",
  "Classes should not be empty",
  (context, ruleKey) => ({
    ClassBody(node) {
      if (node.body.length === 0) {
        context.report({
          node: node.parent?.id || node,
          message: "Remove this empty class. [typescript:" + ruleKey + "]",
        });
      }
    },
  }),
);

// S4036: Searching OS commands in PATH is security-sensitive
const S4036 = createSonarRule(
  "S4036",
  "Searching OS commands in PATH is security-sensitive",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (
        !methodName ||
        !new Set(["spawn", "spawnSync", "execFile", "execFileSync"]).has(
          methodName,
        )
      ) {
        return;
      }
      const command = getStringValue(node.arguments[0]);
      if (command && !command.startsWith("/")) {
        context.report({
          node: node.arguments[0],
          message: `Use an absolute path for "${command}" instead of relying on PATH. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S4156: "module" should not be used
const S4156 = createSonarRule(
  "S4156",
  '"module" should not be used',
  (context, ruleKey) => ({
    MemberExpression(node) {
      if (
        node.object.type === "Identifier" &&
        node.object.name === "module" &&
        !node.computed &&
        node.property.type === "Identifier" &&
        new Set(["parent", "filename", "paths"]).has(node.property.name)
      ) {
        context.report({
          node,
          message: `Do not use "module.${node.property.name}" in ES modules. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6571: Type constituents should not be redundant
const S6571 = createSonarRule(
  "S6571",
  "Type constituents of unions and intersections should not be redundant",
  (context, ruleKey) => ({
    TSUnionType(node) {
      const hasStringKeyword = node.types.some(
        (type) => type.type === "TSStringKeyword",
      );
      if (!hasStringKeyword) {
        return;
      }
      for (const type of node.types) {
        if (type.type === "TSLiteralType" && type.literal.type === "Literal") {
          context.report({
            node: type,
            message:
              'This literal type is already covered by "string". [typescript:' +
              ruleKey +
              "]",
          });
        }
      }
    },
  }),
);

// S2092: Cookies without the secure flag
const S2092 = createSonarRule(
  "S2092",
  'Creating cookies without the "secure" flag is security-sensitive',
  (context, ruleKey) => ({
    CallExpression(node) {
      if (
        getMethodName(node) !== "cookie" ||
        node.callee.type !== "MemberExpression" ||
        node.callee.object.type !== "Identifier" ||
        !COOKIE_RESPONSE_ROOTS.has(node.callee.object.name)
      ) {
        return;
      }
      const options = node.arguments[2];
      const hasSecure =
        options &&
        options.type === "ObjectExpression" &&
        getPropertyNameValue(options, "secure") === true;
      if (!hasSecure) {
        context.report({
          node,
          message:
            'Set "secure: true" on cookies. [typescript:' + ruleKey + "]",
        });
      }
    },
  }),
);

// S1135: Track uses of "TO-DO" tags
const S1135 = createSonarRule(
  "S1135",
  'Track uses of "TODO" tags',
  (context, ruleKey) => ({
    "Program:exit"(node) {
      for (const comment of context.sourceCode.getAllComments()) {
        if (/\bTODO\b/.test(comment.value)) {
          context.report({
            node,
            loc: comment.loc,
            message:
              "Complete this TODO or track it in the issue tracker. [typescript:" +
              ruleKey +
              "]",
          });
        }
      }
    },
  }),
);

// S5732: frame-ancestors directive
const S5732 = createSonarRule(
  "S5732",
  "Disabling content security policy frame-ancestors directive is security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      if (getPropertyName(node) !== "frameAncestors") {
        return;
      }
      const value = node.value;
      if (
        (value.type === "Literal" && value.value === false) ||
        (value.type === "Literal" && value.value === "*")
      ) {
        context.report({
          node: value,
          message:
            "Do not disable the frame-ancestors directive. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S1264: A while loop should be used instead of a for loop
const S1264 = createSonarRule(
  "S1264",
  'A "while" loop should be used instead of a "for" loop',
  (context, ruleKey) => ({
    ForStatement(node) {
      if (!node.init && !node.update && node.test) {
        context.report({
          node,
          message:
            'Use a "while" loop instead of this "for" loop. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S5736: Strict no-referrer policy
const S5736 = createSonarRule(
  "S5736",
  "Disabling strict HTTP no-referrer policy is security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      if (getPropertyName(node) !== "referrerPolicy") {
        return;
      }
      const value = getStringValue(node.value);
      if (
        value &&
        ["unsafe-url", "no-referrer-when-downgrade"].includes(value)
      ) {
        context.report({
          node: node.value,
          message: `"${value}" is a lax referrer policy. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S5842: Repeated patterns should not match the empty string
const S5842 = createSonarRule(
  "S5842",
  "Repeated patterns in regular expressions should not match the empty string",
  (context, ruleKey) => ({
    Literal(node) {
      if (!node.regex) {
        return;
      }
      const pattern = node.regex.pattern;
      const matchesEmptyRepeat =
        /\((?:[^()\\]|\\.)*[*?](?:[^()\\]|\\.)*\)[*+]/.test(pattern);
      if (matchesEmptyRepeat) {
        context.report({
          node,
          message:
            "This repeated group can match the empty string and may loop forever. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S1128: Unnecessary imports should be removed
const S1128 = createSonarRule(
  "S1128",
  "Unnecessary imports should be removed",
  (context, ruleKey) => {
    const imported = [];
    const usedNames = new Set();
    let hasJsx = false;
    return {
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          imported.push({ name: specifier.local.name, node: specifier });
        }
      },
      Identifier(node) {
        const parent = node.parent;
        const isImportSpecifier =
          parent &&
          (parent.type === "ImportSpecifier" ||
            parent.type === "ImportDefaultSpecifier" ||
            parent.type === "ImportNamespaceSpecifier");
        if (!isImportSpecifier) {
          usedNames.add(node.name);
        }
      },
      JSXIdentifier(node) {
        usedNames.add(node.name);
      },
      JSXElement() {
        hasJsx = true;
      },
      JSXFragment() {
        hasJsx = true;
      },
      "Program:exit"() {
        // Sonar treats React as used by JSX in files that render JSX.
        if (hasJsx) {
          usedNames.add("React");
        }
        for (const item of imported) {
          if (!usedNames.has(item.name)) {
            context.report({
              node: item.node,
              message: `Remove the unused import "${item.name}". [typescript:${ruleKey}]`,
            });
          }
        }
      },
    };
  },
);

// S5725: Remote artifacts without integrity checks
const S5725 = createSonarRule(
  "S5725",
  "Using remote artifacts without integrity checks is security-sensitive",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      if (node.name?.type !== "JSXIdentifier" || node.name.name !== "script") {
        return;
      }
      const attributes = node.attributes || [];
      const src = attributes.find(
        (attribute) =>
          attribute.type === "JSXAttribute" && attribute.name?.name === "src",
      );
      const hasIntegrity = attributes.some(
        (attribute) =>
          attribute.type === "JSXAttribute" &&
          attribute.name?.name === "integrity",
      );
      const srcValue = src && getStringValue(src.value);
      if (srcValue && /^https?:\/\//.test(srcValue) && !hasIntegrity) {
        context.report({
          node: src,
          message:
            'Add an "integrity" attribute when loading remote scripts. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S4322: Type predicates should be used
const S4322 = createSonarRule(
  "S4322",
  "Type predicates should be used",
  (context, ruleKey) => ({
    FunctionDeclaration(node) {
      const returnType = node.returnType?.typeAnnotation;
      if (returnType?.type !== "TSBooleanKeyword" || !node.body) {
        return;
      }
      const walk = createAstWalker(context.sourceCode, {
        skipNestedFunctions: true,
      });
      let returnsTypeof = false;
      walk(node.body, (child) => {
        if (
          child.type === "ReturnStatement" &&
          child.argument?.type === "BinaryExpression" &&
          child.argument.left.type === "UnaryExpression" &&
          child.argument.left.operator === "typeof"
        ) {
          returnsTypeof = true;
          return true;
        }
        return false;
      });
      if (returnsTypeof) {
        context.report({
          node: node.returnType,
          message:
            "Use a type predicate instead of returning boolean. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S5757: Confidential information should not be logged
const S5757 = createSonarRule(
  "S5757",
  "Allowing confidential information to be logged is security-sensitive",
  (context, ruleKey) => ({
    CallExpression(node) {
      const callee = node.callee;
      const isConsole =
        callee.type === "MemberExpression" &&
        !callee.computed &&
        callee.object.type === "Identifier" &&
        callee.object.name === "console";
      if (!isConsole) {
        return;
      }
      for (const argument of node.arguments) {
        if (
          argument.type === "Identifier" &&
          /(password|secret|token|credential)/i.test(argument.name)
        ) {
          context.report({
            node: argument,
            message: `Do not log confidential information ("${argument.name}"). [typescript:${ruleKey}]`,
          });
        }
      }
    },
  }),
);

// S1533: Wrapper objects should not be used for primitive types
const S1533 = createSonarRule(
  "S1533",
  "Wrapper objects should not be used for primitive types",
  (context, ruleKey) => ({
    NewExpression(node) {
      if (
        node.callee.type === "Identifier" &&
        new Set(["String", "Number", "Boolean"]).has(node.callee.name)
      ) {
        context.report({
          node,
          message: `Do not use the ${node.callee.name} wrapper object. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S1301: "if" statements should be preferred over "switch" when simpler
const S1301 = createSonarRule(
  "S1301",
  '"if" statements should be preferred over "switch" when simpler',
  (context, ruleKey) => ({
    SwitchStatement(node) {
      if ((node.cases || []).length <= 2) {
        context.report({
          node,
          message:
            "Replace this switch with if/else statements. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S2990: The global "this" object should not be used
const S2990 = createSonarRule(
  "S2990",
  'The global "this" object should not be used',
  (context, ruleKey) => ({
    ThisExpression(node) {
      let parent = node.parent;
      while (parent) {
        if (isFunction(parent) || parent.type === "ClassBody") {
          return;
        }
        parent = parent.parent;
      }
      context.report({
        node,
        message: 'Do not use the global "this". [typescript:' + ruleKey + "]",
      });
    },
  }),
);

// S1874: Deprecated APIs should not be used
function hasDeprecatedTag(symbol) {
  if (!symbol || typeof symbol.getJsDocTags !== "function") {
    return false;
  }
  return symbol.getJsDocTags().some((tag) => tag.name === "deprecated");
}

const S1874 = createSonarRule(
  "S1874",
  "Deprecated APIs should not be used",
  (context, ruleKey) => {
    const services = getTypeServices(context);
    if (!services) {
      // Type-aware rule: no-op without projectService (see eslint.config.js).
      return {};
    }
    const { checker, toTsNode } = services;
    const ts = getTypescript();
    const reported = new Set();

    function resolveSymbol(symbol) {
      if (!symbol) {
        return null;
      }
      if ((symbol.flags & ts.SymbolFlags.Alias) !== 0) {
        return checker.getAliasedSymbol(symbol);
      }
      return symbol;
    }

    function reportOnce(node, name) {
      if (!name || !node.range) {
        return;
      }
      const key = node.range[0] + ":" + name;
      if (reported.has(key)) {
        return;
      }
      reported.add(key);
      context.report({
        node,
        message: `'${name}' is deprecated. [typescript:${ruleKey}]`,
      });
    }

    function checkSymbol(node, symbol, checkDeclaredType) {
      const resolved = resolveSymbol(symbol);
      if (hasDeprecatedTag(resolved)) {
        reportOnce(node, resolved.getName());
        return true;
      }
      if (
        checkDeclaredType &&
        resolved &&
        (resolved.flags & ts.SymbolFlags.Variable) !== 0
      ) {
        const declaration =
          resolved.valueDeclaration || (resolved.declarations || [])[0];
        if (!declaration) {
          return false;
        }
        const type = checker.getTypeOfSymbolAtLocation(resolved, declaration);
        const typeSymbol = type && (type.symbol || type.aliasSymbol);
        const resolvedType = resolveSymbol(typeSymbol);
        if (hasDeprecatedTag(resolvedType)) {
          reportOnce(node, resolvedType.getName());
          return true;
        }
      }
      return false;
    }

    function checkSignature(node) {
      const signature = checker.getResolvedSignature(toTsNode(node));
      if (
        signature &&
        typeof signature.getJsDocTags === "function" &&
        signature.getJsDocTags().some((tag) => tag.name === "deprecated")
      ) {
        const callee =
          node.callee?.type === "Identifier"
            ? node.callee.name
            : node.callee?.property?.name || "function";
        reportOnce(node, callee);
      }
    }

    function isImportName(node) {
      const parent = node.parent;
      return Boolean(
        parent &&
        (parent.type === "ImportSpecifier" ||
          parent.type === "ImportDefaultSpecifier" ||
          parent.type === "ImportNamespaceSpecifier"),
      );
    }

    function isDeclarationName(node) {
      const parent = node.parent;
      if (!parent) {
        return false;
      }
      return (
        (parent.type === "VariableDeclarator" && parent.id === node) ||
        ((parent.type === "FunctionDeclaration" ||
          parent.type === "FunctionExpression" ||
          parent.type === "ClassDeclaration" ||
          parent.type === "ClassExpression") &&
          parent.id === node) ||
        (parent.type === "Property" &&
          parent.key === node &&
          !parent.computed &&
          !parent.shorthand)
      );
    }

    function checkIdentifier(node) {
      if (isImportName(node) || isDeclarationName(node)) {
        return;
      }
      const parent = node.parent;
      if (
        parent &&
        ((parent.type === "TSTypeReference" && parent.typeName === node) ||
          (parent.type === "TSQualifiedName" && parent.right === node))
      ) {
        return;
      }
      if (
        parent &&
        (parent.type === "JSXOpeningElement" ||
          parent.type === "JSXClosingElement") &&
        parent.name === node
      ) {
        return;
      }
      checkSymbol(node, checker.getSymbolAtLocation(toTsNode(node)));
    }

    return {
      ImportSpecifier(node) {
        checkSymbol(
          node,
          checker.getSymbolAtLocation(toTsNode(node.imported)),
          true,
        );
      },
      TSTypeReference(node) {
        const target =
          node.typeName?.type === "TSQualifiedName"
            ? node.typeName.right
            : node.typeName;
        if (target?.type === "Identifier") {
          checkSymbol(target, checker.getSymbolAtLocation(toTsNode(target)));
        }
      },
      JSXIdentifier(node) {
        const parent = node.parent;
        if (
          parent &&
          (parent.type === "JSXOpeningElement" ||
            parent.type === "JSXClosingElement") &&
          parent.name === node
        ) {
          checkSymbol(node, checker.getSymbolAtLocation(toTsNode(node)));
        }
      },
      JSXAttribute(node) {
        if (node.name?.type === "JSXIdentifier") {
          checkSymbol(
            node.name,
            checker.getSymbolAtLocation(toTsNode(node.name)),
          );
        }
      },
      CallExpression(node) {
        checkSignature(node);
      },
      NewExpression(node) {
        checkSignature(node);
      },
      Identifier(node) {
        checkIdentifier(node);
      },
    };
  },
);

// S2737: "catch" clauses should do more than rethrow
const S2737 = createSonarRule(
  "S2737",
  '"catch" clauses should do more than rethrow',
  (context, ruleKey) => ({
    CatchClause(node) {
      const body = node.body.body || [];
      if (
        body.length === 1 &&
        body[0].type === "ThrowStatement" &&
        body[0].argument?.type === "Identifier" &&
        node.param?.type === "Identifier" &&
        body[0].argument.name === node.param.name
      ) {
        context.report({
          node: node.param,
          message:
            "Remove this catch clause that only rethrows. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S1226: Initial values of parameters and caught exceptions should not be ignored
const S1226 = createSonarRule(
  "S1226",
  "Initial values of parameters, caught exceptions, and loop variables should not be ignored",
  (context, ruleKey) => {
    const stack = [];

    function collectParamNames(fn) {
      const names = new Set();
      for (const param of fn.params || []) {
        if (param.type === "Identifier") {
          names.add(param.name);
        }
      }
      return names;
    }

    function enter(names) {
      stack.push({ names, read: new Set(), reported: new Set() });
    }

    function exit() {
      stack.pop();
    }

    return {
      FunctionDeclaration(node) {
        enter(collectParamNames(node));
      },
      FunctionExpression(node) {
        enter(collectParamNames(node));
      },
      ArrowFunctionExpression(node) {
        enter(collectParamNames(node));
      },
      "FunctionDeclaration:exit": exit,
      "FunctionExpression:exit": exit,
      "ArrowFunctionExpression:exit": exit,
      CatchClause(node) {
        enter(
          node.param && node.param.type === "Identifier"
            ? new Set([node.param.name])
            : new Set(),
        );
      },
      "CatchClause:exit": exit,
      AssignmentExpression(node) {
        if (node.left.type !== "Identifier") {
          return;
        }
        const frame = stack.at(-1);
        if (!frame) {
          return;
        }
        const name = node.left.name;
        if (
          frame.names.has(name) &&
          !frame.read.has(name) &&
          !frame.reported.has(name)
        ) {
          frame.reported.add(name);
          context.report({
            node,
            message: `The initial value of "${name}" is never read before it is overwritten. [typescript:${ruleKey}]`,
          });
        }
      },
      Identifier(node) {
        const parent = node.parent;
        if (!parent) {
          return;
        }
        const isWrite =
          (parent.type === "AssignmentExpression" && parent.left === node) ||
          (parent.type === "VariableDeclarator" && parent.id === node) ||
          (parent.type === "Property" &&
            parent.key === node &&
            !parent.computed) ||
          (parent.type === "MemberExpression" &&
            parent.property === node &&
            !parent.computed) ||
          ((parent.type === "FunctionDeclaration" ||
            parent.type === "FunctionExpression" ||
            parent.type === "ArrowFunctionExpression") &&
            parent.params.includes(node)) ||
          (parent.type === "CatchClause" && parent.param === node);
        if (isWrite) {
          return;
        }
        for (const frame of stack) {
          if (frame.names.has(node.name)) {
            frame.read.add(node.name);
          }
        }
      },
    };
  },
);

// S1940: Boolean checks should not be inverted
const S1940 = createSonarRule(
  "S1940",
  "Boolean checks should not be inverted",
  (context, ruleKey) => ({
    BinaryExpression(node) {
      if (
        (node.operator === "===" || node.operator === "==") &&
        node.right.type === "Literal" &&
        node.right.value === true &&
        node.left.type === "UnaryExpression" &&
        node.left.operator === "!"
      ) {
        context.report({
          node,
          message:
            'Use "!== false" or compare the value directly. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S101: Class names should comply with a naming convention
const S101 = createSonarRule(
  "S101",
  "Class names should comply with a naming convention",
  (context, ruleKey) => {
    function check(node) {
      const name = node.id?.name;
      if (name && !/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
        context.report({
          node: node.id,
          message: `Rename the class "${name}" to PascalCase. [typescript:${ruleKey}]`,
        });
      }
    }
    return { ClassDeclaration: check, ClassExpression: check };
  },
);

// S6353: Regular expression quantifiers and character classes should be concise
const S6353 = createSonarRule(
  "S6353",
  "Regular expression quantifiers and character classes should be used concisely",
  (context, ruleKey) => ({
    Literal(node) {
      if (!node.regex) {
        return;
      }
      const pattern = node.regex.pattern;
      const concise = pattern
        .replaceAll(String.raw`[0-9]`, String.raw`\d`)
        .replaceAll(String.raw`[a-zA-Z0-9_]`, String.raw`\w`)
        .replaceAll(String.raw`[ \t\r\n\f]`, String.raw`\s`)
        .replaceAll(String.raw`[^0-9]`, String.raw`\D`)
        .replaceAll(String.raw`[^a-zA-Z0-9_]`, String.raw`\W`)
        .replaceAll(String.raw`[^ \t\r\n\f]`, String.raw`\S`);
      if (concise !== pattern) {
        context.report({
          node,
          message: String.raw`Use concise character classes (\d, \w, \s). [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S4158: Empty collections should not be accessed or iterated
const S4158 = createSonarRule(
  "S4158",
  "Empty collections should not be accessed or iterated",
  (context, ruleKey) => ({
    MemberExpression(node) {
      if (
        node.object.type === "ArrayExpression" &&
        node.object.elements.length === 0 &&
        !node.computed &&
        node.property.type === "Identifier" &&
        new Set(["length", "forEach", "map", "filter", "reduce"]).has(
          node.property.name,
        )
      ) {
        context.report({
          node,
          message:
            "This operation on an empty array has no effect. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6321: Administration services access should be restricted to specific IP addresses
const S6321 = createSonarRule(
  "S6321",
  "Administration services access should be restricted to specific IP addresses",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (name !== "fromPort" && name !== "toPort") {
        return;
      }
      if (
        node.value.type === "Literal" &&
        new Set([22, 3389, 3306, 5432]).has(node.value.value)
      ) {
        context.report({
          node: node.value,
          message: `Administration port ${node.value.value} should not be publicly reachable. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S5883: OS commands should not be vulnerable to argument injection
const S5883 = createSonarRule(
  "S5883",
  "OS commands should not be vulnerable to argument injection attacks",
  (context, ruleKey) => {
    const tracker = createTaintTracker();
    return tracker.makeVisitors({
      CallExpression(node) {
        const methodName = getMethodName(node);
        if (
          !methodName ||
          !new Set(["execFile", "execFileSync", "spawn", "spawnSync"]).has(
            methodName,
          )
        ) {
          return;
        }
        for (const argument of node.arguments) {
          if (tracker.isTainted(argument)) {
            context.report({
              node: argument,
              message: `Command arguments should not be built from untrusted data. [typescript:${ruleKey}]`,
            });
          }
        }
      },
    });
  },
);

// S8348: CORS policies should not be vulnerable to injections
const S8348 = createSonarRule(
  "S8348",
  "CORS policies should not be vulnerable to injections",
  (context, ruleKey) => {
    const tracker = createTaintTracker();
    return tracker.makeVisitors({
      CallExpression(node) {
        if (getMethodName(node) !== "cors") {
          return;
        }
        const options = node.arguments[0];
        if (options?.type !== "ObjectExpression") {
          return;
        }
        const origin = getPropertyNameValue(options, "origin");
        if (
          hasPropertyName(options, "origin") &&
          tracker.isTainted(
            options.properties.find(
              (property) =>
                property.type === "Property" &&
                getPropertyName(property) === "origin",
            ).value,
          )
        ) {
          context.report({
            node: options,
            message: `CORS origin should not be built from untrusted data (${origin ?? "dynamic"}). [typescript:${ruleKey}]`,
          });
        }
      },
    });
  },
);

// S8349: Content-Security policies should not be vulnerable to injections
const S8349 = createSonarRule(
  "S8349",
  "Content-Security policies should not be vulnerable to injections",
  (context, ruleKey) => {
    const tracker = createTaintTracker();
    return tracker.makeVisitors({
      CallExpression(node) {
        const methodName = getMethodName(node);
        if (!methodName || !["setHeader", "header"].includes(methodName)) {
          return;
        }
        const headerName = getStringValue(node.arguments[0]);
        if (
          headerName &&
          headerName.toLowerCase() === "content-security-policy" &&
          node.arguments[1] &&
          tracker.isTainted(node.arguments[1])
        ) {
          context.report({
            node: node.arguments[1],
            message:
              "Content-Security-Policy headers should not be built from untrusted data. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    });
  },
);

// S6252: Disabling versioning of S3 buckets is security-sensitive
const S6252 = createSonarRule(
  "S6252",
  "Disabling versioning of S3 buckets is security-sensitive",
  (context, ruleKey) => ({
    Property(node) {
      const name = getPropertyName(node);
      if (name !== "versioned" && name !== "versioning") {
        return;
      }
      const value = node.value;
      if (value.type === "Literal" && value.value === false) {
        context.report({
          node: value,
          message: `S3 bucket versioning must not be disabled ("${name}: false"). [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S5759: Forwarding client IP address is security-sensitive
const S5759 = createSonarRule(
  "S5759",
  "Forwarding client IP address is security-sensitive",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (!methodName || !["setHeader", "header"].includes(methodName)) {
        return;
      }
      const headerName = getStringValue(node.arguments[0]);
      if (headerName && headerName.toLowerCase() === "x-forwarded-for") {
        context.report({
          node: node.arguments[0],
          message:
            "Forwarding the client IP (X-Forwarded-For) should be reviewed. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

module.exports = {
  S7722,
  S7723,
  S7726,
  S7729,
  S7752,
  S7753,
  S7754,
  S7756,
  S7757,
  S7758,
  S7759,
  S7750,
  S7751,
  S7755,
  S7763,
  S7764,
  S7765,
  S7766,
  S7769,
  S7732,
  S7733,
  S7734,
  S7736,
  S7737,
  S7738,
  S7741,
  S7742,
  S7743,
  S7745,
  S7747,
  S7748,
  S7744,
  S7749,
  S7776,
  S7777,
  S7778,
  S7770,
  S7771,
  S7772,
  S7773,
  S7784,
  S7786,
  S7787,
  S7780,
  S6827,
  S6957,
  S1472,
  S3330,
  S6606,
  S1516,
  S1444,
  S3863,
  S4084,
  S1090,
  S4138,
  S6551,
  S6647,
  S6767,
  S1077,
  S6644,
  S1082,
  S6650,
  S6653,
  S6654,
  S6775,
  S5148,
  S5264,
  S6598,
  S6565,
  S6568,
  S2094,
  S4036,
  S4156,
  S6571,
  S2092,
  S1135,
  S5732,
  S1264,
  S5736,
  S5842,
  S1128,
  S5725,
  S4322,
  S5757,
  S1533,
  S1301,
  S2990,
  S1874,
  S2737,
  S1226,
  S1940,
  S101,
  S6353,
  S4158,
  S6321,
  S5883,
  S8348,
  S8349,
  S6252,
  S5759,
};
