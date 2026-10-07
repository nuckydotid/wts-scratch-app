"use strict";

const BACKSLASH = String.fromCharCode(92);

const {
  createSonarRule,
  getPropertyName,
  getMethodName,
  getStringValue,
  isFunction,
} = require("../utils/rule-helpers");
const { createAstWalker } = require("../utils/ast-walk");

/**
 * MAJOR CODE_SMELL rules (Sonar way, TypeScript).
 */

const ASSERTION_METHODS = new Set([
  "equal",
  "strictEqual",
  "deepEqual",
  "deepStrictEqual",
  "notEqual",
]);

const LIFECYCLE_NAMES = new Set([
  "componentDidMount",
  "componentDidUpdate",
  "componentWillUnmount",
  "shouldComponentUpdate",
  "render",
]);

const LEGACY_LIFECYCLE_NAMES = new Set([
  "componentWillMount",
  "componentWillReceiveProps",
  "componentWillUpdate",
]);

const ARRAY_MUTATING_METHODS = new Set([
  "reverse",
  "sort",
  "splice",
  "push",
  "pop",
  "shift",
  "unshift",
  "fill",
  "copyWithin",
]);

function isUndefinedIdentifier(node) {
  return node && node.type === "Identifier" && node.name === "undefined";
}

// S7721: Functions should be moved to the highest possible scope
const S7721 = createSonarRule(
  "S7721",
  "Functions should be moved to the highest possible scope",
  (context, ruleKey) => {
    function collectDeclaredNames(node, names) {
      const walk = createAstWalker(context.sourceCode);
      walk(node, (child) => {
        if (
          child.type === "VariableDeclarator" &&
          child.id.type === "Identifier"
        ) {
          names.add(child.id.name);
        } else if (
          (child.type === "FunctionDeclaration" ||
            child.type === "FunctionExpression") &&
          child.id
        ) {
          names.add(child.id.name);
        }
        return false;
      });
      if (isFunction(node)) {
        for (const param of node.params || []) {
          if (param.type === "Identifier") {
            names.add(param.name);
          }
        }
      }
      return names;
    }

    function findEnclosingFunction(node) {
      let current = node.parent;
      while (current) {
        if (isFunction(current)) {
          return current;
        }
        if (current.type === "Program") {
          return null;
        }
        current = current.parent;
      }
      return null;
    }

    function collectUsedNames(node) {
      const used = new Set();
      const walk = createAstWalker(context.sourceCode, {
        skipNestedFunctions: true,
      });
      walk(node.body, (child) => {
        if (child.type === "Identifier") {
          used.add(child.name);
        }
        return false;
      });
      return used;
    }

    return {
      FunctionDeclaration(node) {
        if (!node.id) {
          return;
        }
        const parent = node.parent;
        if (
          !parent ||
          parent.type === "Program" ||
          parent.type === "ExportNamedDeclaration"
        ) {
          return;
        }
        const enclosing = findEnclosingFunction(node);
        if (!enclosing) {
          return;
        }
        const outerNames = collectDeclaredNames(enclosing, new Set());
        const usedNames = collectUsedNames(node);
        const captured = [...usedNames].some(
          (name) => outerNames.has(name) && name !== node.id.name,
        );
        if (!captured) {
          context.report({
            node: node.id,
            message: `Move "${node.id.name}" to the highest scope where it is used. [typescript:${ruleKey}]`,
          });
        }
      },
    };
  },
);

// S7724: ESLint disable comments should specify which rules to disable
const S7724 = createSonarRule(
  "S7724",
  "ESLint disable comments should specify which rules to disable",
  (context, ruleKey) => ({
    "Program:exit"(node) {
      for (const comment of context.sourceCode.getAllComments()) {
        const match = /eslint-disable(?:-next-line|-line)?\s*$/m.test(
          comment.value.trim(),
        );
        if (match) {
          context.report({
            node,
            loc: comment.loc,
            message:
              "Specify which ESLint rule this comment disables. [typescript:" +
              ruleKey +
              "]",
          });
        }
      }
    },
  }),
);

// S7767: Bitwise operators should not be used to truncate numbers
const S7767 = createSonarRule(
  "S7767",
  "Bitwise operators should not be used to truncate numbers",
  (context, ruleKey) => ({
    BinaryExpression(node) {
      const truncatingOperators = new Set(["|", "&", "^", "<<", ">>", ">>>"]);
      if (!truncatingOperators.has(node.operator)) {
        return;
      }
      const hasZeroLiteral =
        (node.left.type === "Literal" && node.left.value === 0) ||
        (node.right.type === "Literal" && node.right.value === 0);
      if (hasZeroLiteral) {
        context.report({
          node,
          message:
            "Use Math.trunc() instead of a bitwise operator to truncate a number. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
    UnaryExpression(node) {
      if (
        node.operator === "~" &&
        node.argument.type === "UnaryExpression" &&
        node.argument.operator === "~"
      ) {
        context.report({
          node,
          message:
            'Use Math.trunc() instead of "~~" to truncate a number. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7768: Modern DOM manipulation methods should be used
const S7768 = createSonarRule(
  "S7768",
  "Modern DOM manipulation methods should be used instead of legacy alternatives",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      const replacements = {
        appendChild: "append",
        insertBefore: "prepend",
        replaceChild: "replaceWith",
      };
      const replacement =
        methodName &&
        Object.prototype.hasOwnProperty.call(replacements, methodName)
          ? replacements[methodName]
          : null;
      if (replacement) {
        context.report({
          node,
          message: `Use "${replacement}()" instead of "${methodName}()". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7746: Promise.resolve()/reject() should not be used in async functions or callbacks
const S7746 = createSonarRule(
  "S7746",
  "Promise.resolve() and Promise.reject() should not be used in async functions or promise callbacks",
  (context, ruleKey) => ({
    CallExpression(node) {
      const callee = node.callee;
      if (
        callee.type !== "MemberExpression" ||
        callee.object.type !== "Identifier" ||
        callee.object.name !== "Promise" ||
        callee.computed ||
        callee.property.type !== "Identifier" ||
        (callee.property.name !== "resolve" &&
          callee.property.name !== "reject")
      ) {
        return;
      }
      let parent = node.parent;
      while (parent) {
        if (
          parent.type === "FunctionDeclaration" ||
          parent.type === "FunctionExpression" ||
          parent.type === "ArrowFunctionExpression"
        ) {
          if (parent.async) {
            context.report({
              node,
              message: `Return the value directly instead of using Promise.${callee.property.name}() in an async function. [typescript:${ruleKey}]`,
            });
          }
          return;
        }
        parent = parent.parent;
      }
    },
  }),
);

// S7760: Default parameters instead of reassigning parameters
const S7760 = createSonarRule(
  "S7760",
  "Default parameters should be used instead of reassigning parameters with literal fallback values",
  (context, ruleKey) => {
    const parameterStack = [];

    function collectParams(fn) {
      const names = new Set();
      for (const param of fn.params || []) {
        if (param.type === "Identifier") {
          names.add(param.name);
        }
      }
      return names;
    }

    function enter(fn) {
      parameterStack.push(collectParams(fn));
    }

    function exit() {
      parameterStack.pop();
    }

    return {
      FunctionDeclaration: enter,
      FunctionExpression: enter,
      ArrowFunctionExpression: enter,
      "FunctionDeclaration:exit": exit,
      "FunctionExpression:exit": exit,
      "ArrowFunctionExpression:exit": exit,
      AssignmentExpression(node) {
        if (node.left.type !== "Identifier" || node.right.type !== "Literal") {
          return;
        }
        const current = parameterStack.at(-1);
        if (current && current.has(node.left.name)) {
          context.report({
            node,
            message: `Use a default parameter value instead of reassigning "${node.left.name}". [typescript:${ruleKey}]`,
          });
        }
      },
    };
  },
);

// S7761: Data attributes should be accessed using ".dataset"
const S7761 = createSonarRule(
  "S7761",
  'Data attributes should be accessed using ".dataset"',
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (methodName !== "getAttribute" && methodName !== "setAttribute") {
        return;
      }
      const name = getStringValue(node.arguments[0]);
      if (name && name.startsWith("data-")) {
        context.report({
          node,
          message: `Use "dataset" to access the data attribute "${name}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7762: DOM nodes should be removed using "remove()"
const S7762 = createSonarRule(
  "S7762",
  'DOM nodes should be removed using "remove()" instead of "removeChild()"',
  (context, ruleKey) => ({
    CallExpression(node) {
      if (getMethodName(node) === "removeChild") {
        context.report({
          node,
          message:
            'Use "remove()" instead of "removeChild()". [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7740: Variables should not be assigned the value of "this"
const S7740 = createSonarRule(
  "S7740",
  'Variables should not be assigned the value of "this"',
  (context, ruleKey) => ({
    VariableDeclarator(node) {
      if (node.init && node.init.type === "ThisExpression") {
        context.report({
          node,
          message:
            'Use arrow functions instead of capturing "this" in a variable. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7774: Methods should be accessed from prototypes, not instances
const S7774 = createSonarRule(
  "S7774",
  "Methods should be accessed from prototypes, not instances",
  (context, ruleKey) => ({
    MemberExpression(node) {
      if (node.computed) {
        return;
      }
      if (
        node.property.type === "Identifier" &&
        node.property.name === "__proto__"
      ) {
        context.report({
          node,
          message:
            'Access the prototype through the constructor instead of the instance ("__proto__"). [typescript:' +
            ruleKey +
            "]",
        });
        return;
      }
      if (
        node.object.type === "MemberExpression" &&
        !node.object.computed &&
        node.object.property.type === "Identifier" &&
        node.object.property.name === "constructor"
      ) {
        context.report({
          node,
          message:
            "Access methods from the prototype instead of through an instance. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S7785: Top-level await should be preferred over wrapped async operations
const S7785 = createSonarRule(
  "S7785",
  "Top-level await should be preferred over wrapped async operations",
  (context, ruleKey) => ({
    CallExpression(node) {
      const callee = node.callee;
      if (
        !callee ||
        callee.type !== "MemberExpression" ||
        callee.computed ||
        callee.property?.type !== "Identifier"
      ) {
        return;
      }
      const name = callee.property.name;
      if (name !== "then" && name !== "catch") {
        return;
      }
      let parent = node.parent;
      while (parent) {
        if (
          parent.type === "FunctionDeclaration" ||
          parent.type === "FunctionExpression" ||
          parent.type === "ArrowFunctionExpression" ||
          parent.type === "ClassBody"
        ) {
          return;
        }
        parent = parent.parent;
      }
      context.report({
        node,
        message:
          "Prefer top-level await over using a promise chain. [typescript:" +
          ruleKey +
          "]",
      });
    },
  }),
);

// S6627: Users should not use internal APIs
const S6627 = createSonarRule(
  "S6627",
  "Users should not use internal APIs",
  (context, ruleKey) => {
    function findInternalNames(programNode) {
      const names = new Set();
      for (const comment of context.sourceCode.getAllComments()) {
        if (comment.type !== "Block" || !/@internal\b/.test(comment.value)) {
          continue;
        }
        const following = programNode.body.find(
          (statement) =>
            statement.range && statement.range[0] > comment.range[1],
        );
        if (!following || following.type !== "ExportNamedDeclaration") {
          continue;
        }
        const declaration = following.declaration;
        const name = declaration?.id?.name;
        if (name) {
          names.add(name);
        }
      }
      return names;
    }

    function isUsagePosition(child) {
      const parent = child.parent;
      return Boolean(
        parent &&
        ((parent.type === "CallExpression" && parent.callee === child) ||
          (parent.type === "NewExpression" && parent.callee === child) ||
          (parent.type === "MemberExpression" && parent.object === child)),
      );
    }

    return {
      "Program:exit"(programNode) {
        const internalNames = findInternalNames(programNode);
        if (internalNames.size === 0) {
          return;
        }
        const walk = createAstWalker(context.sourceCode);
        walk(programNode, (child) => {
          if (
            child.type === "Identifier" &&
            internalNames.has(child.name) &&
            isUsagePosition(child)
          ) {
            context.report({
              node: child,
              message: `"${child.name}" is an internal API and should not be used outside its module. [typescript:${ruleKey}]`,
            });
            return true;
          }
          return false;
        });
      },
    };
  },
);

// S6746: React "this.state" should not be mutated directly
const S6746 = createSonarRule(
  "S6746",
  'In React "this.state" should not be mutated directly',
  (context, ruleKey) => ({
    AssignmentExpression(node) {
      const left = node.left;
      if (
        left.type === "MemberExpression" &&
        left.object.type === "MemberExpression" &&
        !left.object.computed &&
        left.object.object.type === "ThisExpression" &&
        left.object.property.type === "Identifier" &&
        left.object.property.name === "state"
      ) {
        context.report({
          node: left,
          message:
            "Use setState() instead of mutating this.state directly. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S1068: Unused private class members should be removed
const S1068 = createSonarRule(
  "S1068",
  "Unused private class members should be removed",
  (context, ruleKey) => ({
    ClassBody(node) {
      for (const member of node.body) {
        const key = member.key;
        const isPrivate =
          (key && key.type === "PrivateIdentifier") ||
          member.accessibility === "private";
        if (!isPrivate || !key) {
          continue;
        }
        const name = key.name;
        let references = 0;
        const walk = createAstWalker(context.sourceCode);
        walk(node, (child) => {
          if (
            child.type === "MemberExpression" &&
            !child.computed &&
            (child.property.type === "PrivateIdentifier" ||
              child.property.type === "Identifier") &&
            child.property.name === name &&
            child.property !== key
          ) {
            references += 1;
          }
          return false;
        });
        if (references === 0) {
          context.report({
            node: key,
            message: `Remove the unused private member "${name}". [typescript:${ruleKey}]`,
          });
        }
      }
    },
  }),
);

// S6750: The return value of "ReactDOM.render" should not be used
const S6750 = createSonarRule(
  "S6750",
  'The return value of "ReactDOM.render" should not be used',
  (context, ruleKey) => ({
    VariableDeclarator(node) {
      if (
        node.init &&
        node.init.type === "CallExpression" &&
        node.init.callee.type === "MemberExpression" &&
        !node.init.callee.computed &&
        node.init.callee.property.type === "Identifier" &&
        node.init.callee.property.name === "render"
      ) {
        const objectName =
          node.init.callee.object.type === "Identifier"
            ? node.init.callee.object.name
            : null;
        if (objectName && /ReactDOM|ReactDom/.test(objectName)) {
          context.report({
            node: node.init,
            message:
              "The return value of ReactDOM.render() should not be used. [typescript:" +
              ruleKey +
              "]",
          });
        }
      }
    },
  }),
);

// S1788: Function parameters with default values should be last
const S1788 = createSonarRule(
  "S1788",
  "Function parameters with default values should be last",
  (context, ruleKey) => {
    function check(fn) {
      const params = fn.params || [];
      let firstDefault = -1;
      for (let index = 0; index < params.length; index += 1) {
        if (params[index].type === "AssignmentPattern") {
          firstDefault = index;
          break;
        }
      }
      if (firstDefault === -1) {
        return;
      }
      for (let index = firstDefault + 1; index < params.length; index += 1) {
        if (params[index].type === "Identifier") {
          context.report({
            node: params[index],
            message:
              "Move parameters with default values to the end of the parameter list. [typescript:" +
              ruleKey +
              "]",
          });
          return;
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

// S2301: Methods should not contain selector parameters
const S2301 = createSonarRule(
  "S2301",
  "Methods should not contain selector parameters",
  (context, ruleKey) => {
    function check(fn) {
      const booleanParams = new Set();
      for (const param of fn.params || []) {
        if (
          param.type === "Identifier" &&
          param.typeAnnotation &&
          param.typeAnnotation.typeAnnotation &&
          param.typeAnnotation.typeAnnotation.type === "TSBooleanKeyword"
        ) {
          booleanParams.add(param.name);
        }
      }
      if (booleanParams.size === 0 || !fn.body) {
        return;
      }
      const walk = createAstWalker(context.sourceCode, {
        skipNestedFunctions: true,
      });
      walk(fn.body, (child) => {
        if (
          child.type === "IfStatement" &&
          child.alternate &&
          child.test.type === "Identifier" &&
          booleanParams.has(child.test.name)
        ) {
          context.report({
            node: child.test,
            message: `Avoid using the boolean parameter "${child.test.name}" to select behaviour; split the method instead. [typescript:${ruleKey}]`,
          });
          return true;
        }
        return false;
      });
    }
    return {
      FunctionDeclaration: check,
      FunctionExpression: check,
      ArrowFunctionExpression: check,
    };
  },
);

// S7060: Module should not import itself
const S7060 = createSonarRule(
  "S7060",
  "Module should not import itself",
  (context, ruleKey) => ({
    ImportDeclaration(node) {
      const source = node.source.value;
      if (typeof source !== "string" || !source.startsWith(".")) {
        return;
      }
      const path = require("node:path");
      const filename = context.filename || "";
      if (!filename) {
        return;
      }
      const resolvedImport = path.resolve(path.dirname(filename), source);
      const normalize = (value) =>
        value.replace(/\.[cm]?[jt]sx?$/, "").replace(/\/index$/, "");
      if (normalize(resolvedImport) === normalize(path.resolve(filename))) {
        context.report({
          node: node.source,
          message: `This module imports itself ("${source}"). [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6481: React Context Provider values should have stable identities
const S6481 = createSonarRule(
  "S6481",
  "React Context Provider values should have stable identities",
  (context, ruleKey) => {
    function getJsxElementName(openingElement) {
      const name = openingElement?.name;
      if (!name) {
        return null;
      }
      if (name.type === "JSXIdentifier") {
        return name.name;
      }
      if (name.type === "JSXMemberExpression") {
        return name.property?.name || null;
      }
      return null;
    }

    return {
      JSXAttribute(node) {
        if (node.name?.name !== "value") {
          return;
        }
        if (getJsxElementName(node.parent) !== "Provider") {
          return;
        }
        const value = node.value;
        if (
          value?.type === "JSXExpressionContainer" &&
          (value.expression.type === "ObjectExpression" ||
            value.expression.type === "ArrayExpression" ||
            value.expression.type === "ArrowFunctionExpression")
        ) {
          context.report({
            node: value.expression,
            message:
              "Memoize this Provider value (useMemo) to keep a stable identity. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

// S1854: Unused assignments should be removed
const S1854 = createSonarRule(
  "S1854",
  "Unused assignments should be removed",
  (context, ruleKey) => {
    function findVariable(node, name) {
      let scope = context.sourceCode.getScope(node);
      while (scope) {
        const variable = scope.set.get(name);
        if (variable) {
          return variable;
        }
        scope = scope.upper;
      }
      return null;
    }

    function containsName(node, name) {
      let found = false;
      const walk = createAstWalker(context.sourceCode);
      walk(node, (child) => {
        if (child.type === "Identifier" && child.name === name) {
          found = true;
          return true;
        }
        return false;
      });
      return found;
    }

    function isLoopCarried(node, name) {
      let current = node;
      while (current) {
        if (
          current.type === "ForStatement" ||
          current.type === "WhileStatement" ||
          current.type === "DoWhileStatement"
        ) {
          if (
            current.type === "ForStatement" &&
            current.update &&
            node.range[0] >= current.update.range[0] &&
            node.range[1] <= current.update.range[1]
          ) {
            return true;
          }
          if (current.test && containsName(current.test, name)) {
            return true;
          }
        }
        if (isFunction(current)) {
          return false;
        }
        current = current.parent;
      }
      return false;
    }

    function isExported(node) {
      let current = node;
      while (current) {
        if (
          current.type === "ExportNamedDeclaration" ||
          current.type === "ExportDefaultDeclaration"
        ) {
          return true;
        }
        if (current.type === "Program") {
          return false;
        }
        current = current.parent;
      }
      return false;
    }

    function checkAssignment(targetNode, name) {
      if (isExported(targetNode) || isLoopCarried(targetNode, name)) {
        return;
      }
      const variable = findVariable(targetNode, name);
      if (!variable) {
        return;
      }
      const hasAnyRead = variable.references.some((reference) =>
        reference.isRead(),
      );
      if (!hasAnyRead) {
        context.report({
          node: targetNode,
          message: `The value assigned to "${name}" is never used. [typescript:${ruleKey}]`,
        });
      }
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type === "Identifier" && node.init) {
          checkAssignment(node.id, node.id.name);
        }
      },
      AssignmentExpression(node) {
        if (node.left.type === "Identifier") {
          checkAssignment(node.left, node.left.name);
        }
      },
    };
  },
);

// S2933: Fields only assigned in the constructor should be readonly
const S2933 = createSonarRule(
  "S2933",
  'Fields that are only assigned in the constructor should be "readonly"',
  (context, ruleKey) => {
    function collectFieldNames(classBody) {
      const names = new Set();
      for (const member of classBody.body) {
        if (
          member.type === "PropertyDefinition" &&
          !member.readonly &&
          member.value === null &&
          member.accessibility !== "protected" &&
          member.key?.type === "Identifier"
        ) {
          names.add(member.key.name);
        }
      }
      return names;
    }

    function collectAssignedOutsideConstructor(classBody) {
      const assigned = new Set();
      for (const member of classBody.body) {
        const isMethod =
          member.type === "MethodDefinition" &&
          member.kind !== "constructor" &&
          member.value?.body;
        if (!isMethod) {
          continue;
        }
        const walk = createAstWalker(context.sourceCode);
        walk(member.value.body, (child) => {
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
      }
      return assigned;
    }

    return {
      ClassBody(node) {
        const fieldNames = collectFieldNames(node);
        if (fieldNames.size === 0) {
          return;
        }
        const assignedOutside = collectAssignedOutsideConstructor(node);
        for (const name of fieldNames) {
          if (!assignedOutside.has(name)) {
            context.report({
              node: node.parent?.id || node,
              message: `Mark the field "${name}" as "readonly" since it is only assigned in the constructor. [typescript:${ruleKey}]`,
            });
            return;
          }
        }
      },
    };
  },
);

// S6666: Spread syntax should be used instead of "apply()"
const S6666 = createSonarRule(
  "S6666",
  'Spread syntax should be used instead of "apply()"',
  (context, ruleKey) => ({
    CallExpression(node) {
      if (getMethodName(node) !== "apply" || node.arguments.length < 2) {
        return;
      }
      const callee = node.callee;
      const isReflectApply =
        callee.type === "MemberExpression" &&
        !callee.computed &&
        callee.object.type === "Identifier" &&
        callee.object.name === "Reflect";
      if (isReflectApply) {
        return;
      }
      context.report({
        node,
        message:
          'Use spread syntax (...) instead of "apply()". [typescript:' +
          ruleKey +
          "]",
      });
    },
  }),
);

// S6788: React's "findDOMNode" should not be used
const S6788 = createSonarRule(
  "S6788",
  'React\'s "findDOMNode" should not be used',
  (context, ruleKey) => ({
    CallExpression(node) {
      if (getMethodName(node) === "findDOMNode") {
        context.report({
          node,
          message:
            "Do not use findDOMNode(); use refs instead. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6789: React's "isMounted" should not be used
const S6789 = createSonarRule(
  "S6789",
  'React\'s "isMounted" should not be used',
  (context, ruleKey) => ({
    CallExpression(node) {
      if (getMethodName(node) === "isMounted") {
        context.report({
          node,
          message:
            "Do not use isMounted(); track mounted state in a field instead. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6660: If statements should not be the only statement in else blocks
const S6660 = createSonarRule(
  "S6660",
  "If statements should not be the only statement in else blocks",
  (context, ruleKey) => ({
    IfStatement(node) {
      const alternate = node.alternate;
      if (
        alternate &&
        alternate.type === "BlockStatement" &&
        alternate.body.length === 1 &&
        alternate.body[0].type === "IfStatement"
      ) {
        context.report({
          node: alternate.body[0],
          message:
            'Use "else if" instead of nesting an if statement inside else. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6661: Object spread syntax should be used instead of "Object.assign"
const S6661 = createSonarRule(
  "S6661",
  'Object spread syntax should be used instead of "Object.assign"',
  (context, ruleKey) => ({
    CallExpression(node) {
      const callee = node.callee;
      if (
        callee.type === "MemberExpression" &&
        !callee.computed &&
        callee.object.type === "Identifier" &&
        callee.object.name === "Object" &&
        callee.property.type === "Identifier" &&
        callee.property.name === "assign" &&
        node.arguments.length > 0 &&
        node.arguments[0].type === "ObjectExpression" &&
        node.arguments[0].properties.length === 0
      ) {
        context.report({
          node,
          message:
            "Use object spread syntax instead of Object.assign({}, ...). [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6679: "Number.isNaN()" should be used to check for "NaN"
const S6679 = createSonarRule(
  "S6679",
  '"Number.isNaN()" should be used to check for "NaN" value',
  (context, ruleKey) => ({
    BinaryExpression(node) {
      if (
        node.operator !== "!==" &&
        node.operator !== "!=" &&
        node.operator !== "===" &&
        node.operator !== "=="
      ) {
        return;
      }
      if (
        node.left.type === "Identifier" &&
        node.right.type === "Identifier" &&
        node.left.name === node.right.name
      ) {
        context.report({
          node,
          message: `Use Number.isNaN() to check for NaN instead of comparing "${node.left.name}" with itself. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6550: All enum members should be literals
const S6550 = createSonarRule(
  "S6550",
  "All enum members should be literals",
  (context, ruleKey) => ({
    TSEnumMember(node) {
      const initializer = node.initializer;
      if (!initializer) {
        return;
      }
      const isLiteral =
        initializer.type === "Literal" ||
        (initializer.type === "UnaryExpression" &&
          initializer.argument.type === "Literal");
      if (!isLiteral) {
        context.report({
          node: initializer,
          message:
            "Use a literal value for this enum member. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6671: Literals should not be used for promise rejection
const S6671 = createSonarRule(
  "S6671",
  "Literals should not be used for promise rejection",
  (context, ruleKey) => ({
    CallExpression(node) {
      const callee = node.callee;
      const isReject =
        (callee.type === "MemberExpression" &&
          !callee.computed &&
          callee.object.type === "Identifier" &&
          callee.object.name === "Promise" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "reject") ||
        (callee.type === "Identifier" && callee.name === "reject");
      if (!isReject || node.arguments.length === 0) {
        return;
      }
      const reason = node.arguments[0];
      if (reason.type === "Literal" || reason.type === "TemplateLiteral") {
        context.report({
          node: reason,
          message:
            "Reject with an Error instance instead of a literal value. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6676: Calls to ".call()" and ".apply()" methods should not be redundant
const S6676 = createSonarRule(
  "S6676",
  'Calls to ".call()" and ".apply()" methods should not be redundant',
  (context, ruleKey) => ({
    CallExpression(node) {
      if (
        getMethodName(node) === "call" &&
        node.arguments.length === 1 &&
        node.arguments[0].type === "ThisExpression"
      ) {
        context.report({
          node,
          message:
            'This ".call(this)" is redundant; invoke the function directly. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6766: JSX special characters should be escaped
const S6766 = createSonarRule(
  "S6766",
  "JSX special characters should be escaped",
  (context, ruleKey) => ({
    JSXText(node) {
      if (node.value.includes(">")) {
        context.report({
          node,
          message: 'Escape ">" in JSX text. [typescript:' + ruleKey + "]",
        });
      }
    },
  }),
);

// S6791: React legacy lifecycle methods should not be used
const S6791 = createSonarRule(
  "S6791",
  "React legacy lifecycle methods should not be used",
  (context, ruleKey) => ({
    MethodDefinition(node) {
      const name = getPropertyName(node);
      if (name && LEGACY_LIFECYCLE_NAMES.has(name)) {
        context.report({
          node: node.key,
          message: `The legacy lifecycle method "${name}" should not be used. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6763: "shouldComponentUpdate" should not be defined when extending PureComponent
const S6763 = createSonarRule(
  "S6763",
  '"shouldComponentUpdate" should not be defined when extending "React.PureComponent"',
  (context, ruleKey) => {
    function check(node) {
      const superClass = node.superClass;
      const isPureComponent =
        superClass &&
        ((superClass.type === "Identifier" &&
          superClass.name === "PureComponent") ||
          (superClass.type === "MemberExpression" &&
            !superClass.computed &&
            superClass.property.type === "Identifier" &&
            superClass.property.name === "PureComponent"));
      if (!isPureComponent) {
        return;
      }
      for (const member of node.body.body || []) {
        if (getPropertyName(member) === "shouldComponentUpdate") {
          context.report({
            node: member.key,
            message:
              "Do not define shouldComponentUpdate() when extending PureComponent. [typescript:" +
              ruleKey +
              "]",
          });
        }
      }
    }
    return { ClassDeclaration: check, ClassExpression: check };
  },
);

// S6522: Import variables should not be reassigned
const S6522 = createSonarRule(
  "S6522",
  "Import variables should not be reassigned",
  (context, ruleKey) => {
    const importedNames = new Set();
    return {
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          importedNames.add(specifier.local.name);
        }
      },
      AssignmentExpression(node) {
        if (
          node.left.type === "Identifier" &&
          importedNames.has(node.left.name)
        ) {
          context.report({
            node: node.left,
            message: `Do not reassign the imported binding "${node.left.name}". [typescript:${ruleKey}]`,
          });
        }
      },
    };
  },
);

// S6535: Unnecessary character escapes should be removed
const S6535 = createSonarRule(
  "S6535",
  "Unnecessary character escapes should be removed",
  (context, ruleKey) => {
    const VALID_ESCAPES = new Set([
      "b",
      "f",
      "n",
      "r",
      "t",
      "v",
      "0",
      "'",
      '"',
      BACKSLASH,
      "x",
      "u",
      "\n",
      "\r",
    ]);
    return {
      Literal(node) {
        if (typeof node.value !== "string" || typeof node.raw !== "string") {
          return;
        }
        const raw = node.raw.slice(1, -1);
        let index = 0;
        while (index < raw.length) {
          if (raw[index] !== BACKSLASH) {
            index += 1;
            continue;
          }
          const next = raw[index + 1];
          if (next && !VALID_ESCAPES.has(next)) {
            context.report({
              node,
              message: `Remove the unnecessary escape "\\${next}". [typescript:${ruleKey}]`,
            });
            return;
          }
          index += 2;
        }
      },
    };
  },
);

// S6643: Prototypes of builtin objects should not be modified
const S6643 = createSonarRule(
  "S6643",
  "Prototypes of builtin objects should not be modified",
  (context, ruleKey) => {
    const BUILTINS = new Set([
      "Array",
      "Object",
      "String",
      "Number",
      "Boolean",
      "Function",
      "Date",
      "RegExp",
      "Promise",
      "Map",
      "Set",
      "Symbol",
      "Error",
      "JSON",
      "Math",
    ]);
    return {
      AssignmentExpression(node) {
        const left = node.left;
        if (
          left.type === "MemberExpression" &&
          left.object.type === "MemberExpression" &&
          !left.object.computed &&
          left.object.object.type === "Identifier" &&
          BUILTINS.has(left.object.object.name) &&
          left.object.property.type === "Identifier" &&
          left.object.property.name === "prototype"
        ) {
          context.report({
            node: left,
            message: `Do not modify the prototype of the builtin "${left.object.object.name}". [typescript:${ruleKey}]`,
          });
        }
      },
    };
  },
);

// S6657: Octal escape sequences should not be used
const S6657 = createSonarRule(
  "S6657",
  "Octal escape sequences should not be used",
  (context, ruleKey) => ({
    Literal(node) {
      if (typeof node.raw !== "string" || !/^['"`]/.test(node.raw)) {
        return;
      }
      const raw = node.raw;
      let index = 0;
      while (index < raw.length) {
        if (raw[index] !== BACKSLASH) {
          index += 1;
          continue;
        }
        const next = raw[index + 1];
        if (next === BACKSLASH) {
          index += 2;
          continue;
        }
        if (next && /[1-7]/.test(next)) {
          context.report({
            node,
            message:
              "Do not use octal escape sequences. [typescript:" + ruleKey + "]",
          });
          return;
        }
        index += 1;
      }
    },
  }),
);

// S6772: Spacing between inline elements should be explicit
const S6772 = createSonarRule(
  "S6772",
  "Spacing between inline elements should be explicit",
  (context, ruleKey) => {
    const INLINE_ELEMENTS = new Set([
      "a",
      "span",
      "b",
      "i",
      "em",
      "strong",
      "small",
    ]);
    return {
      JSXElement(node) {
        const children = node.children || [];
        for (let index = 0; index < children.length - 1; index += 1) {
          const current = children[index];
          const next = children[index + 1];
          const isInlineElement = (child) =>
            child.type === "JSXElement" &&
            child.openingElement.name.type === "JSXIdentifier" &&
            INLINE_ELEMENTS.has(child.openingElement.name.name);
          if (isInlineElement(current) && isInlineElement(next)) {
            context.report({
              node: current,
              message:
                'Add explicit spacing ({" "}) between adjacent inline elements. [typescript:' +
                ruleKey +
                "]",
            });
          }
        }
      },
    };
  },
);

// S6478: React components should not be nested
const S6478 = createSonarRule(
  "S6478",
  "React components should not be nested",
  (context, ruleKey) => {
    function isComponentFunction(node) {
      if (!isFunction(node) || !node.body) {
        return false;
      }
      if (node.body.type === "JSXElement" || node.body.type === "JSXFragment") {
        return true;
      }
      const walk = createAstWalker(context.sourceCode, {
        skipNestedFunctions: "all",
      });
      let returnsJsx = false;
      walk(node.body, (child) => {
        if (
          child.type === "ReturnStatement" &&
          child.argument &&
          (child.argument.type === "JSXElement" ||
            child.argument.type === "JSXFragment")
        ) {
          returnsJsx = true;
          return true;
        }
        return false;
      });
      return returnsJsx;
    }

    function hasComponentAncestor(node) {
      let parent = node.parent;
      while (parent) {
        if (isFunction(parent) && isComponentFunction(parent)) {
          return true;
        }
        parent = parent.parent;
      }
      return false;
    }

    function containsJsx(node) {
      if (!node) {
        return false;
      }
      if (node.type === "JSXElement" || node.type === "JSXFragment") {
        return true;
      }
      const walk = createAstWalker(context.sourceCode, {
        skipNestedFunctions: "all",
      });
      let found = false;
      walk(node, (child) => {
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

    function isNestedComponentCandidate(node) {
      return (
        isFunction(node) &&
        node.body &&
        containsJsx(node.body) &&
        hasComponentAncestor(node)
      );
    }

    function reportIfNested(node, nameNode) {
      if (isNestedComponentCandidate(node)) {
        const name =
          nameNode.type === "Identifier" ? nameNode.name : "component";
        context.report({
          node: nameNode,
          message: `Move the nested component "${name}" out of its parent component. [typescript:${ruleKey}]`,
        });
      }
    }

    return {
      FunctionDeclaration(node) {
        if (!node.id || !/^[A-Z]/.test(node.id.name)) {
          return;
        }
        reportIfNested(node, node.id);
      },
      VariableDeclarator(node) {
        if (
          node.id.type === "Identifier" &&
          /^[A-Z]/.test(node.id.name) &&
          node.init &&
          isFunction(node.init)
        ) {
          reportIfNested(node.init, node.id);
        }
      },
      JSXAttribute(node) {
        const value = node.value;
        const expression =
          value?.type === "JSXExpressionContainer" ? value.expression : null;
        if (
          expression &&
          isFunction(expression) &&
          containsJsx(expression.body) &&
          hasComponentAncestor(expression) &&
          expression.body?.type === "JSXFragment"
        ) {
          context.report({
            node: node.name,
            message: `Move the nested component "fragment" out of its parent component. [typescript:${ruleKey}]`,
          });
        }
      },
      Property(node) {
        if (!node.key || !node.value || !isFunction(node.value)) {
          return;
        }
        const object = node.parent;
        const container = object?.parent;
        if (container?.type === "JSXExpressionContainer") {
          reportIfNested(node.value, node.key);
        }
      },
    };
  },
);

// S6582: Optional chaining should be preferred
const S6582 = createSonarRule(
  "S6582",
  "Optional chaining should be preferred",
  (context, ruleKey) => ({
    LogicalExpression(node) {
      if (node.operator !== "&&") {
        return;
      }
      const right = node.right;
      if (
        right.type === "MemberExpression" &&
        !right.computed &&
        right.object.type === "Identifier" &&
        node.left.type === "Identifier" &&
        right.object.name === node.left.name
      ) {
        context.report({
          node,
          message: `Use optional chaining ("${node.left.name}?.${right.property.name}") instead. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6569: Unnecessary type constraints should be removed
const S6569 = createSonarRule(
  "S6569",
  "Unnecessary type constraints should be removed",
  (context, ruleKey) => ({
    TSTypeParameter(node) {
      const constraint = node.constraint;
      if (
        constraint &&
        (constraint.type === "TSAnyKeyword" ||
          constraint.type === "TSUnknownKeyword")
      ) {
        context.report({
          node: constraint,
          message:
            "Remove this unnecessary type constraint. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6590: "as const" assertions should be preferred
const S6590 = createSonarRule(
  "S6590",
  '"as const" assertions should be preferred',
  (context, ruleKey) => ({
    TSAsExpression(node) {
      const typeAnnotation = node.typeAnnotation;
      const isAsConst =
        typeAnnotation &&
        typeAnnotation.type === "TSTypeReference" &&
        typeAnnotation.typeName &&
        typeAnnotation.typeName.type === "Identifier" &&
        typeAnnotation.typeName.name === "const";
      if (isAsConst) {
        return;
      }
      const expression = node.expression;
      const isLiteralCollection =
        expression.type === "ArrayExpression" &&
        expression.elements.every(
          (element) =>
            !element ||
            element.type === "Literal" ||
            element.type === "TemplateLiteral",
        );
      if (isLiteralCollection && expression.elements.length > 0) {
        context.report({
          node,
          message:
            'Prefer "as const" for this literal array. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S4140: Sparse arrays should not be created with extra commas
const S4140 = createSonarRule(
  "S4140",
  "Sparse arrays should not be created with extra commas",
  (context, ruleKey) => ({
    ArrayExpression(node) {
      if (node.elements.some((element) => element === null)) {
        context.report({
          node,
          message:
            "Remove the extra comma creating a sparse array. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6441: Unused methods of React components should be removed
const S6441 = createSonarRule(
  "S6441",
  "Unused methods of React components should be removed",
  (context, ruleKey) => {
    function getSuperClassName(superClass) {
      if (superClass.type === "Identifier") {
        return superClass.name;
      }
      if (
        superClass.type === "MemberExpression" &&
        !superClass.computed &&
        superClass.property.type === "Identifier"
      ) {
        return superClass.property.name;
      }
      return null;
    }

    function isReactComponentClass(node) {
      const superClass = node.superClass;
      if (!superClass) {
        return false;
      }
      const name = getSuperClassName(superClass);
      return name === "Component" || name === "PureComponent";
    }

    function countReferences(classNode, name) {
      let references = 0;
      const walk = createAstWalker(context.sourceCode);
      walk(classNode, (child) => {
        if (
          child.type === "MemberExpression" &&
          !child.computed &&
          child.property.type === "Identifier" &&
          child.property.name === name
        ) {
          references += 1;
        }
        return false;
      });
      return references;
    }

    function check(node) {
      if (!isReactComponentClass(node)) {
        return;
      }
      for (const member of node.body.body || []) {
        if (member.type !== "MethodDefinition" || !member.key) {
          continue;
        }
        const name = getPropertyName(member);
        if (!name || LIFECYCLE_NAMES.has(name) || name.startsWith("render")) {
          continue;
        }
        if (countReferences(node, name) === 0) {
          context.report({
            node: member.key,
            message: `Remove the unused component method "${name}". [typescript:${ruleKey}]`,
          });
        }
      }
    }

    return { ClassDeclaration: check, ClassExpression: check };
  },
);

// S6572: Enum member values should be either all initialized or none
const S6572 = createSonarRule(
  "S6572",
  "Enum member values should be either all initialized or none",
  (context, ruleKey) => ({
    TSEnumDeclaration(node) {
      const members = node.body?.members || node.members || [];
      const initialized = members.reduce(
        (count, member) => count + (member.initializer ? 1 : 0),
        0,
      );
      if (initialized > 0 && initialized < members.length) {
        context.report({
          node: node.id,
          message:
            "Initialize either all enum members or none of them. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6578: Enum values should be unique
const S6578 = createSonarRule(
  "S6578",
  "Enum values should be unique",
  (context, ruleKey) => ({
    TSEnumDeclaration(node) {
      const seen = new Set();
      for (const member of node.body?.members || node.members || []) {
        if (!member.initializer || member.initializer.type !== "Literal") {
          continue;
        }
        const value = String(member.initializer.value);
        if (seen.has(value)) {
          context.report({
            node: member.initializer,
            message: `The enum value "${value}" is already used by another member. [typescript:${ruleKey}]`,
          });
        }
        seen.add(value);
      }
    },
  }),
);

// S1134: Track uses of "FIX-ME" tags
const S1134 = createSonarRule(
  "S1134",
  'Track uses of "FIXME" tags',
  (context, ruleKey) => ({
    "Program:exit"(node) {
      for (const comment of context.sourceCode.getAllComments()) {
        if (/\bFIXME\b/.test(comment.value)) {
          context.report({
            node,
            loc: comment.loc,
            message:
              "Resolve this FIXME or track it in the issue tracker. [typescript:" +
              ruleKey +
              "]",
          });
        }
      }
    },
  }),
);

// S2589: Boolean expressions should not be gratuitous
const S2589 = createSonarRule(
  "S2589",
  "Boolean expressions should not be gratuitous",
  (context, ruleKey) => ({
    IfStatement(node) {
      if (
        node.test.type === "Literal" &&
        typeof node.test.value === "boolean"
      ) {
        context.report({
          node: node.test,
          message:
            "This boolean condition is always the same. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S2234: Parameters should be passed in the correct order
const S2234 = createSonarRule(
  "S2234",
  "Parameters should be passed in the correct order",
  (context, ruleKey) => {
    const functions = new Map();
    return {
      FunctionDeclaration(node) {
        if (node.id) {
          functions.set(node.id.name, node.params || []);
        }
      },
      VariableDeclarator(node) {
        if (
          node.id.type === "Identifier" &&
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression")
        ) {
          functions.set(node.id.name, node.init.params || []);
        }
      },
      CallExpression(node) {
        if (node.callee.type !== "Identifier") {
          return;
        }
        const params = functions.get(node.callee.name);
        if (!params || params.length !== node.arguments.length) {
          return;
        }
        const names = params.map((param) =>
          param.type === "Identifier" ? param.name : null,
        );
        const args = node.arguments.map((argument) =>
          argument.type === "Identifier" ? argument.name : null,
        );
        for (let index = 0; index < names.length; index += 1) {
          if (
            names[index] &&
            args[index] &&
            names[index] !== args[index] &&
            names.includes(args[index])
          ) {
            context.report({
              node,
              message: `Argument "${args[index]}" is passed to parameter "${names[index]}"; check the parameter order. [typescript:${ruleKey}]`,
            });
            return;
          }
        }
      },
    };
  },
);

// S5860: Names of regular expressions named groups should be used
const S5860 = createSonarRule(
  "S5860",
  "Names of regular expressions named groups should be used",
  (context, ruleKey) => ({
    CallExpression(node) {
      if (getMethodName(node) !== "replace" || node.arguments.length < 2) {
        return;
      }
      const pattern = node.arguments[0];
      const replacement = getStringValue(node.arguments[1]);
      if (
        pattern.type !== "Literal" ||
        !pattern.regex ||
        !replacement ||
        !/\(\?<[A-Za-z]/.test(pattern.regex.pattern)
      ) {
        return;
      }
      if (/\$\d/.test(replacement)) {
        context.report({
          node: node.arguments[1],
          message:
            "Reference named capture groups by name instead of by number. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S5869: Character classes should not contain the same character twice
const S5869 = createSonarRule(
  "S5869",
  "Character classes in regular expressions should not contain the same character twice",
  (context, ruleKey) => {
    function hasDuplicateCharacter(content) {
      const seen = new Set();
      let cursor = 0;
      while (cursor < content.length) {
        const char = content[cursor];
        if (char === BACKSLASH) {
          cursor += 2;
          continue;
        }
        if (char === "-") {
          cursor += 1;
          continue;
        }
        if (seen.has(char)) {
          return char;
        }
        seen.add(char);
        cursor += 1;
      }
      return null;
    }

    function findDuplicateClass(pattern) {
      let index = 0;
      while (index < pattern.length) {
        if (pattern[index] === BACKSLASH) {
          index += 2;
          continue;
        }
        if (pattern[index] === "[") {
          const end = pattern.indexOf("]", index + 1);
          if (end === -1) {
            return null;
          }
          const content = pattern.slice(index + 1, end).replace(/^\^/, "");
          const duplicate = hasDuplicateCharacter(content);
          if (duplicate) {
            return duplicate;
          }
          index = end + 1;
          continue;
        }
        index += 1;
      }
      return null;
    }

    return {
      Literal(node) {
        if (!node.regex) {
          return;
        }
        const duplicate = findDuplicateClass(node.regex.pattern);
        if (duplicate) {
          context.report({
            node,
            message: `The character "${duplicate}" appears twice in this character class. [typescript:${ruleKey}]`,
          });
        }
      },
    };
  },
);

// S1119: Labels should not be used
const S1119 = createSonarRule(
  "S1119",
  "Labels should not be used",
  (context, ruleKey) => ({
    LabeledStatement(node) {
      context.report({
        node,
        message: `Remove the label "${node.label.name}". [typescript:${ruleKey}]`,
      });
    },
  }),
);

// S1439: Only loops and switches should be labelled
const S1439 = createSonarRule(
  "S1439",
  'Only "while", "do", "for" and "switch" statements should be labelled',
  (context, ruleKey) => ({
    LabeledStatement(node) {
      const allowed = new Set([
        "WhileStatement",
        "DoWhileStatement",
        "ForStatement",
        "ForInStatement",
        "ForOfStatement",
        "SwitchStatement",
      ]);
      if (!allowed.has(node.body.type)) {
        context.report({
          node,
          message: `The label "${node.label.name}" is attached to a statement that cannot be targeted by break/continue. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S1479: "switch" statements should not have too many "case" clauses
const MAX_SWITCH_CASES = 30;

const S1479 = createSonarRule(
  "S1479",
  '"switch" statements should not have too many "case" clauses',
  (context, ruleKey) => ({
    SwitchStatement(node) {
      if ((node.cases || []).length > MAX_SWITCH_CASES) {
        context.report({
          node,
          message: `This switch has more than ${MAX_SWITCH_CASES} cases; refactor it. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S3415: Assertion arguments should be passed in the correct order
const S3415 = createSonarRule(
  "S3415",
  "Assertion arguments should be passed in the correct order",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (
        !methodName ||
        !ASSERTION_METHODS.has(methodName) ||
        node.arguments.length < 2
      ) {
        return;
      }
      const [first, second] = node.arguments;
      const firstIsLiteral = first.type === "Literal";
      const secondIsLiteral = second.type === "Literal";
      if (firstIsLiteral && !secondIsLiteral) {
        context.report({
          node: first,
          message:
            "Pass the actual value first and the expected value second. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S4623: "undefined" should not be passed as the value of optional parameters
const S4623 = createSonarRule(
  "S4623",
  '"undefined" should not be passed as the value of optional parameters',
  (context, ruleKey) => {
    const localFunctions = new Map();

    function registerFunction(name, params) {
      localFunctions.set(name, params || []);
    }

    function isOptionalParameter(param) {
      return (
        param.type === "AssignmentPattern" ||
        param.optional === true ||
        param.type === "RestElement"
      );
    }

    function checkCall(node, params) {
      for (let index = 0; index < node.arguments.length; index += 1) {
        const argument = node.arguments[index];
        if (!isUndefinedIdentifier(argument)) {
          continue;
        }
        const param = params[index];
        if (param && isOptionalParameter(param)) {
          context.report({
            node: argument,
            message:
              'Omit this argument instead of passing "undefined". [typescript:' +
              ruleKey +
              "]",
          });
        }
      }
    }

    return {
      FunctionDeclaration(node) {
        if (node.id) {
          registerFunction(node.id.name, node.params);
        }
      },
      VariableDeclarator(node) {
        if (
          node.id.type === "Identifier" &&
          node.init &&
          isFunction(node.init)
        ) {
          registerFunction(node.id.name, node.init.params);
        }
      },
      CallExpression(node) {
        if (node.callee.type !== "Identifier") {
          return;
        }
        const params = localFunctions.get(node.callee.name);
        if (params) {
          checkCall(node, params);
        }
      },
    };
  },
);

// S5843: Regular expressions should not be too complicated
const MAX_REGEX_COMPLEXITY = 20;

const S5843 = createSonarRule(
  "S5843",
  "Regular expressions should not be too complicated",
  (context, ruleKey) => {
    function complexity(pattern) {
      let score = 0;
      let index = 0;
      while (index < pattern.length) {
        const char = pattern[index];
        if (char === BACKSLASH) {
          index += 2;
          continue;
        }
        if (char === "|") {
          score += 2;
        } else if (char === "*" || char === "+" || char === "?") {
          score += 1;
        } else if (char === "(") {
          score += 1;
        } else if (char === "[") {
          const end = pattern.indexOf("]", index + 1);
          if (end !== -1) {
            index = end;
          }
        }
        index += 1;
      }
      return score;
    }

    return {
      Literal(node) {
        if (
          node.regex &&
          complexity(node.regex.pattern) > MAX_REGEX_COMPLEXITY
        ) {
          context.report({
            node,
            message:
              "Simplify this regular expression; it is too complex. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

// S5958: Tests should check which exception is thrown
const S5958 = createSonarRule(
  "S5958",
  "Tests should check which exception is thrown",
  (context, ruleKey) => {
    function isNegated(callNode) {
      const callee = callNode.callee;
      return (
        callee.type === "MemberExpression" &&
        !callee.computed &&
        callee.object.type === "MemberExpression" &&
        !callee.object.computed &&
        callee.object.property.type === "Identifier" &&
        callee.object.property.name === "not"
      );
    }

    return {
      CallExpression(node) {
        const methodName = getMethodName(node);
        if (
          (methodName === "toThrow" ||
            methodName === "toThrowError" ||
            methodName === "throws") &&
          node.arguments.length === 0 &&
          !isNegated(node)
        ) {
          context.report({
            node,
            message:
              "Assert the thrown error type or message. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

// S4634: Shorthand promises should be used
const S4634 = createSonarRule(
  "S4634",
  "Shorthand promises should be used",
  (context, ruleKey) => ({
    NewExpression(node) {
      if (
        node.callee.type !== "Identifier" ||
        node.callee.name !== "Promise" ||
        node.arguments.length !== 1
      ) {
        return;
      }
      const executor = node.arguments[0];
      if (
        (executor.type === "ArrowFunctionExpression" ||
          executor.type === "FunctionExpression") &&
        executor.params.length >= 1 &&
        executor.params[0].type === "Identifier" &&
        executor.body.type === "CallExpression" &&
        executor.body.callee.type === "Identifier" &&
        executor.body.callee.name === executor.params[0].name &&
        executor.body.arguments.length === 1
      ) {
        context.report({
          node,
          message:
            "Use Promise.resolve()/Promise.reject() instead of wrapping a value. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S1121: Assignments should not be made from within sub-expressions
const S1121 = createSonarRule(
  "S1121",
  "Assignments should not be made from within sub-expressions",
  (context, ruleKey) => ({
    AssignmentExpression(node) {
      const parent = node.parent;
      if (!parent) {
        return;
      }
      const isStatementLevel =
        parent.type === "ExpressionStatement" ||
        (parent.type === "ForStatement" &&
          (parent.init === node || parent.update === node)) ||
        (parent.type === "SequenceExpression" &&
          parent.parent &&
          parent.parent.type === "ForStatement");
      if (!isStatementLevel) {
        context.report({
          node,
          message:
            "Move this assignment out of the sub-expression. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S2692: "indexOf" checks should not be for positive numbers
const S2692 = createSonarRule(
  "S2692",
  '"indexOf" checks should not be for positive numbers',
  (context, ruleKey) => ({
    BinaryExpression(node) {
      if (!new Set([">", ">=", "!=", "!=="]).has(node.operator)) {
        return;
      }
      const isIndexOfCall = (operand) =>
        operand.type === "CallExpression" &&
        (getMethodName(operand) === "indexOf" ||
          getMethodName(operand) === "lastIndexOf");
      if (
        isIndexOfCall(node.left) &&
        node.right.type === "Literal" &&
        node.right.value === 0 &&
        node.operator === ">"
      ) {
        context.report({
          node,
          message:
            "indexOf() returns -1 when not found; compare against -1 instead of 0. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

function isArrayLike(node) {
  if (node.type === "ArrayExpression") {
    return true;
  }
  if (
    node.type === "NewExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === "Array"
  ) {
    return true;
  }
  return (
    node.type === "Identifier" &&
    /(array|list|items|rows|columns)$/i.test(node.name)
  );
}

// S3579: Array indexes should be numeric
const S3579 = createSonarRule(
  "S3579",
  "Array indexes should be numeric",
  (context, ruleKey) => {
    return {
      MemberExpression(node) {
        if (!node.computed || !isArrayLike(node.object)) {
          return;
        }
        const property = node.property;
        if (
          property.type === "Literal" &&
          typeof property.value === "string" &&
          !/^\d+$/.test(property.value)
        ) {
          context.report({
            node: property,
            message: `Array indexes should be numeric, not "${property.value}". [typescript:${ruleKey}]`,
          });
        }
      },
    };
  },
);

// S1515: Functions should not be defined inside loops
const S1515 = createSonarRule(
  "S1515",
  "Functions should not be defined inside loops",
  (context, ruleKey) => {
    const loopNodes = [];

    function check(node) {
      if (loopNodes.length > 0) {
        context.report({
          node,
          message:
            "Move this function out of the loop body. [typescript:" +
            ruleKey +
            "]",
        });
      }
    }

    return {
      ForStatement: (node) => loopNodes.push(node),
      ForInStatement: (node) => loopNodes.push(node),
      ForOfStatement: (node) => loopNodes.push(node),
      WhileStatement: (node) => loopNodes.push(node),
      DoWhileStatement: (node) => loopNodes.push(node),
      "ForStatement:exit": () => loopNodes.pop(),
      "ForInStatement:exit": () => loopNodes.pop(),
      "ForOfStatement:exit": () => loopNodes.pop(),
      "WhileStatement:exit": () => loopNodes.pop(),
      "DoWhileStatement:exit": () => loopNodes.pop(),
      FunctionDeclaration: check,
    };
  },
);

// S6092: Chai assertions should have only one reason to succeed
const S6092 = createSonarRule(
  "S6092",
  "Chai assertions should have only one reason to succeed",
  (context, ruleKey) => ({
    MemberExpression(node) {
      if (
        !node.computed &&
        node.property.type === "Identifier" &&
        node.property.name === "ok" &&
        node.object.type === "MemberExpression"
      ) {
        context.report({
          node,
          message:
            'Chai "ok" assertions have more than one reason to succeed; assert the exact value. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S2310: Loop counters should not be assigned within the loop body
const S2310 = createSonarRule(
  "S2310",
  "Loop counters should not be assigned within the loop body",
  (context, ruleKey) => {
    const counters = [];

    function pushCounter(node) {
      const counter =
        node.init &&
        node.init.type === "VariableDeclaration" &&
        node.init.declarations[0] &&
        node.init.declarations[0].id.type === "Identifier"
          ? node.init.declarations[0].id.name
          : null;
      counters.push(counter);
    }

    function check(node) {
      const counter = counters.at(-1);
      if (!counter) {
        return;
      }
      if (
        node.parent &&
        node.parent.type === "ForStatement" &&
        node.parent.update === node
      ) {
        return;
      }
      if (node.left.type === "Identifier" && node.left.name === counter) {
        context.report({
          node: node.left,
          message: `Do not assign the loop counter "${counter}" inside the loop body. [typescript:${ruleKey}]`,
        });
      }
    }

    return {
      ForStatement: pushCounter,
      "ForStatement:exit": () => counters.pop(),
      AssignmentExpression: check,
    };
  },
);

// S4619: "in" should not be used on arrays
const S4619 = createSonarRule(
  "S4619",
  '"in" should not be used on arrays',
  (context, ruleKey) => ({
    BinaryExpression(node) {
      if (node.operator !== "in") {
        return;
      }
      if (node.right.type === "ArrayExpression") {
        context.report({
          node,
          message:
            'Do not use "in" on arrays; use includes() instead. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6019: Reluctant quantifiers should be followed by a non-empty expression
const S6019 = createSonarRule(
  "S6019",
  "Reluctant quantifiers in regular expressions should be followed by an expression that can't match the empty string",
  (context, ruleKey) => ({
    Literal(node) {
      if (!node.regex) {
        return;
      }
      const pattern = node.regex.pattern;
      const reluctantAtEnd =
        /\.[*+]\?$/.test(pattern) ||
        /[*+]\?\)$/.test(pattern) ||
        /[*+]\?$/.test(pattern);
      if (reluctantAtEnd) {
        context.report({
          node,
          message:
            "This reluctant quantifier is followed by nothing that can match; it is useless. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S125: Sections of code should not be commented out
const S125 = createSonarRule(
  "S125",
  "Sections of code should not be commented out",
  (context, ruleKey) => {
    const CODE_KEYWORDS = [
      "if",
      "for",
      "while",
      "switch",
      "return",
      "const",
      "let",
      "var",
      "function",
      "class",
      "import",
      "export",
      "throw",
      "await",
      "try",
    ];
    const CODE_END = /[;{)}]\s*$/;

    function looksLikeCode(line) {
      const trimmed = line.trim().replace(/^(\/\/|\*)\s*/, "");
      const hasKeyword = CODE_KEYWORDS.some(
        (keyword) =>
          trimmed.startsWith(`${keyword} `) ||
          trimmed.startsWith(`${keyword}(`),
      );
      return hasKeyword && CODE_END.test(trimmed);
    }
    return {
      "Program:exit"(node) {
        for (const comment of context.sourceCode.getAllComments()) {
          const lines = comment.value.split("\n");
          if (lines.some((line) => looksLikeCode(line))) {
            context.report({
              node,
              loc: comment.loc,
              message:
                "Remove this commented-out code. [typescript:" + ruleKey + "]",
            });
          }
        }
      },
    };
  },
);

// S4043: Array-mutating methods should not be used misleadingly
const S4043 = createSonarRule(
  "S4043",
  "Array-mutating methods should not be used misleadingly",
  (context, ruleKey) => ({
    AssignmentExpression(node) {
      if (
        node.operator === "=" &&
        node.left.type === "Identifier" &&
        node.right.type === "CallExpression" &&
        node.right.callee.type === "MemberExpression" &&
        !node.right.callee.computed &&
        node.right.callee.object.type === "Identifier" &&
        node.right.callee.object.name === node.left.name &&
        node.right.callee.property.type === "Identifier" &&
        ARRAY_MUTATING_METHODS.has(node.right.callee.property.name)
      ) {
        context.report({
          node,
          message: `"${node.right.callee.property.name}()" mutates the array in place; do not reassign it to the same variable. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S4030: Collection contents should be used
const S4030 = createSonarRule(
  "S4030",
  "Collection contents should be used",
  (context, ruleKey) => ({
    ExpressionStatement(node) {
      const expression = node.expression;
      if (
        expression.type === "CallExpression" &&
        expression.callee.type === "MemberExpression" &&
        !expression.callee.computed &&
        expression.callee.object.type === "NewExpression" &&
        expression.callee.property.type === "Identifier" &&
        ["add", "set"].includes(expression.callee.property.name)
      ) {
        context.report({
          node,
          message:
            "This collection is created and immediately discarded; store or use it. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S5973: Tests should be stable
const S5973 = createSonarRule(
  "S5973",
  "Tests should be stable",
  (context, ruleKey) => {
    const filename = context.filename || "";
    if (!/\.(test|spec)\.[cm]?[jt]sx?$/.test(filename)) {
      return {};
    }
    return {
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
          context.report({
            node,
            message:
              "Tests must be deterministic; avoid Math.random(). [typescript:" +
              ruleKey +
              "]",
          });
        }
        if (
          callee.type === "MemberExpression" &&
          !callee.computed &&
          callee.object.type === "Identifier" &&
          callee.object.name === "Date" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "now"
        ) {
          context.report({
            node,
            message:
              "Tests must be deterministic; avoid Date.now(). [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
      NewExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "Date" &&
          node.arguments.length === 0
        ) {
          context.report({
            node,
            message:
              "Tests must be deterministic; avoid new Date() without arguments. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

// S7788 / S7789 / S8134: Architecture rules
function loadArchitecture() {
  const fs = require("node:fs");
  const path = require("node:path");
  const architecturePath = path.resolve(__dirname, "..", "architecture.json");
  if (!fs.existsSync(architecturePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(architecturePath, "utf8"));
  } catch {
    return null;
  }
}

function createArchitectureRule(ruleKey, ruleName, check) {
  return createSonarRule(ruleKey, ruleName, (context, key) => {
    const architecture = loadArchitecture();
    if (!architecture) {
      return {};
    }
    return check(context, key, architecture);
  });
}

const S7788 = createArchitectureRule(
  "S7788",
  "Relationships should align with the intended architecture",
  (context, ruleKey, architecture) => ({
    ImportDeclaration(node) {
      const source = node.source.value;
      const filename = context.filename || "";
      for (const rule of architecture.forbiddenImports || []) {
        if (
          rule.from &&
          filename.includes(rule.from) &&
          typeof source === "string" &&
          source.includes(rule.to)
        ) {
          context.report({
            node: node.source,
            message: `This relationship is forbidden by the architecture: ${rule.from} -> ${rule.to}. [typescript:${ruleKey}]`,
          });
        }
      }
    },
  }),
);

const S7789 = createArchitectureRule(
  "S7789",
  "Files should be located according to the intended architecture",
  (context, ruleKey, architecture) => ({
    Program(node) {
      const filename = context.filename || "";
      for (const rule of architecture.forbiddenLocations || []) {
        if (rule.pattern && filename.includes(rule.pattern)) {
          context.report({
            node,
            message: `Move this file: ${rule.message || "location is forbidden by the architecture"}. [typescript:${ruleKey}]`,
          });
        }
      }
    },
  }),
);

const S8134 = createArchitectureRule(
  "S8134",
  "Forbidden relationships should be removed to solve tangles as directed by the project's architect",
  (context, ruleKey, architecture) => ({
    ImportDeclaration(node) {
      const source = node.source.value;
      for (const rule of architecture.forbiddenTangles || []) {
        if (
          typeof source === "string" &&
          rule.importIncludes &&
          source.includes(rule.importIncludes) &&
          rule.fileIncludes &&
          (context.filename || "").includes(rule.fileIncludes)
        ) {
          context.report({
            node: node.source,
            message: `Remove this tangled dependency as directed by the architect. [typescript:${ruleKey}]`,
          });
        }
      }
    },
  }),
);

module.exports = {
  S7721,
  S7724,
  S7767,
  S7768,
  S7746,
  S7760,
  S7761,
  S7762,
  S7740,
  S7774,
  S7785,
  S6627,
  S6746,
  S1068,
  S6750,
  S1788,
  S2301,
  S7060,
  S6481,
  S1854,
  S2933,
  S6666,
  S6788,
  S6789,
  S6660,
  S6661,
  S6679,
  S6550,
  S6671,
  S6676,
  S6766,
  S6791,
  S6763,
  S6522,
  S6535,
  S6643,
  S6657,
  S6772,
  S6478,
  S6582,
  S6569,
  S6590,
  S4140,
  S6441,
  S6572,
  S6578,
  S1134,
  S2589,
  S2234,
  S5860,
  S5869,
  S1119,
  S1439,
  S1479,
  S3415,
  S4623,
  S5843,
  S5958,
  S4634,
  S1121,
  S2692,
  S3579,
  S1515,
  S6092,
  S2310,
  S4619,
  S6019,
  S125,
  S4043,
  S4030,
  S5973,
  S7788,
  S7789,
  S8134,
};
