"use strict";

const BACKSLASH = String.fromCharCode(92);

const {
  createSonarRule,
  getPropertyName,
  getMethodName,
  isFunction,
} = require("../utils/rule-helpers");
const { createAstWalker } = require("../utils/ast-walk");

/**
 * MAJOR BUG rules (Sonar way, TypeScript).
 */

function isLiteral(node, value) {
  return node.type === "Literal" && node.value === value;
}

function isGuarded(node) {
  return (
    node.type === "LogicalExpression" || node.type === "ConditionalExpression"
  );
}

const ITERATOR_METHODS = new Set([
  "map",
  "forEach",
  "filter",
  "some",
  "every",
  "find",
  "findIndex",
  "findLast",
  "findLastIndex",
  "flatMap",
  "reduce",
  "reduceRight",
]);

const VOID_METHODS = new Set([
  "log",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "forEach",
]);

const SPECIAL_IDENTIFIERS = new Set(["undefined", "NaN", "Infinity"]);

const S7727 = createSonarRule(
  "S7727",
  "Function references should not be passed directly to iterator methods",
  (context, ruleKey) => {
    const IDIOMATIC_REFERENCES = new Set(["Boolean", "Number", "String"]);
    return {
      CallExpression(node) {
        const methodName = getMethodName(node);
        if (!methodName || !ITERATOR_METHODS.has(methodName)) {
          return;
        }
        const receiver =
          node.callee?.type === "MemberExpression" ? node.callee.object : null;
        if (
          receiver &&
          ((receiver.type === "Identifier" && receiver.name === "Children") ||
            (receiver.type === "MemberExpression" &&
              receiver.property?.type === "Identifier" &&
              receiver.property.name === "Children"))
        ) {
          return;
        }
        const callback = node.arguments[0];
        if (
          callback &&
          (callback.type === "Identifier" ||
            (callback.type === "MemberExpression" && !callback.computed)) &&
          !(
            callback.type === "Identifier" &&
            IDIOMATIC_REFERENCES.has(callback.name)
          )
        ) {
          context.report({
            node: callback,
            message: `Pass an arrow function wrapping "${context.sourceCode.getText(callback)}" so extra arguments are not forwarded. [typescript:${ruleKey}]`,
          });
        }
      },
    };
  },
);

const S7739 = createSonarRule(
  "S7739",
  'Objects should not have a "then" property',
  (context, ruleKey) => {
    function report(node, name) {
      context.report({
        node,
        message: `Object with a "${name}" property is treated as a thenable; rename it. [typescript:${ruleKey}]`,
      });
    }
    return {
      Property(node) {
        if (getPropertyName(node) === "then") {
          report(node.key, "then");
        }
      },
      MethodDefinition(node) {
        if (getPropertyName(node) === "then") {
          report(node.key, "then");
        }
      },
      PropertyDefinition(node) {
        if (getPropertyName(node) === "then") {
          report(node.key, "then");
        }
      },
    };
  },
);

const S6638 = createSonarRule(
  "S6638",
  "Binary expressions should not always return the same value",
  (context, ruleKey) => {
    return {
      BinaryExpression(node) {
        const operator = node.operator;
        const alwaysConstant =
          (operator === "*" &&
            (isLiteral(node.left, 0) || isLiteral(node.right, 0))) ||
          (operator === "%" && isLiteral(node.right, 1)) ||
          (operator === "**" && isLiteral(node.right, 0)) ||
          (operator === "/" && isLiteral(node.right, 0));
        if (alwaysConstant) {
          context.report({
            node,
            message: `This "${operator}" expression always returns the same value. [typescript:${ruleKey}]`,
          });
        }
      },
    };
  },
);

const S1534 = createSonarRule(
  "S1534",
  "Member names should not be duplicated within a class or object literal",
  (context, ruleKey) => {
    function checkMembers(members, keyOf) {
      const seen = new Set();
      for (const member of members) {
        const name = keyOf(member);
        if (!name) {
          continue;
        }
        if (seen.has(name)) {
          context.report({
            node: member.key || member,
            message: `Member "${name}" is declared more than once. [typescript:${ruleKey}]`,
          });
        }
        seen.add(name);
      }
    }
    return {
      ObjectExpression(node) {
        checkMembers(node.properties, getPropertyName);
      },
      ClassBody(node) {
        checkMembers(node.body, (member) =>
          member.kind === "constructor" ? null : getPropertyName(member),
        );
      },
    };
  },
);

const S1656 = createSonarRule(
  "S1656",
  "Variables should not be self-assigned",
  (context, ruleKey) => ({
    AssignmentExpression(node) {
      if (node.operator !== "=") {
        return;
      }
      const left = context.sourceCode.getText(node.left);
      const right = context.sourceCode.getText(node.right);
      if (left === right) {
        context.report({
          node,
          message: `Remove this self-assignment of "${left}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

const S905 = createSonarRule(
  "S905",
  "Non-empty statements should change control flow or have at least one side-effect",
  (context, ruleKey) => ({
    ExpressionStatement(node) {
      if (node.directive) {
        return;
      }
      const expression = node.expression;
      const noEffect =
        expression.type === "Identifier" ||
        expression.type === "MemberExpression" ||
        (expression.type === "ChainExpression" &&
          expression.expression.type === "MemberExpression");
      if (noEffect) {
        context.report({
          node,
          message: `This statement has no effect; remove it or make the intent explicit. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

const S6426 = createSonarRule(
  "S6426",
  "Exclusive tests should not be committed to version control",
  (context, ruleKey) => ({
    CallExpression(node) {
      const callee = node.callee;
      const name = getMethodName(node);
      const isOnlyCall =
        name === "only" &&
        callee.type === "MemberExpression" &&
        callee.object.type === "Identifier" &&
        new Set(["it", "test", "describe", "context"]).has(callee.object.name);
      const isFocusedCall =
        callee.type === "Identifier" &&
        new Set(["fit", "ftest", "fdescribe"]).has(callee.name);
      if (isOnlyCall || isFocusedCall) {
        context.report({
          node,
          message:
            "Remove the exclusive test marker (.only / fit / fdescribe) before committing. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

const S4124 = createSonarRule(
  "S4124",
  "Constructors should not be declared inside interfaces",
  (context, ruleKey) => ({
    TSInterfaceBody(node) {
      for (const member of node.body || []) {
        const isConstructor =
          member.type === "TSConstructSignatureDeclaration" ||
          (member.key && getPropertyName(member) === "constructor");
        if (isConstructor) {
          context.report({
            node: member.key || member,
            message:
              "Interfaces cannot declare constructors; use a class or a factory signature. [typescript:" +
              ruleKey +
              "]",
          });
        }
      }
    },
  }),
);

const S6435 = createSonarRule(
  "S6435",
  'React "render" functions should return a value',
  (context, ruleKey) => {
    function hasReturnStatement(body) {
      let found = false;
      const walk = createAstWalker(context.sourceCode);
      walk(body, (child) => {
        if (child.type === "ReturnStatement") {
          found = true;
          return true;
        }
        return false;
      });
      return found;
    }

    function check(node, name) {
      if (name !== "render") {
        return;
      }
      const body = node.body;
      if (!body || body.type !== "BlockStatement") {
        return;
      }
      if (!hasReturnStatement(body)) {
        context.report({
          node,
          message:
            'React "render" must return a value. [typescript:' + ruleKey + "]",
        });
      }
    }

    return {
      FunctionDeclaration(node) {
        check(node, node.id && node.id.name);
      },
      FunctionExpression(node) {
        check(node, node.id && node.id.name);
      },
      MethodDefinition(node) {
        if (
          node.value &&
          node.value.type === "FunctionExpression" &&
          getPropertyName(node) === "render"
        ) {
          check(node.value, "render");
        }
      },
    };
  },
);

const S6523 = createSonarRule(
  "S6523",
  'Optional chaining should not be used if returning "undefined" throws an error',
  (context, ruleKey) => {
    function containsOptionalChain(node) {
      let current = node;
      while (current) {
        if (current.type === "ChainExpression") {
          return true;
        }
        if (current.type === "MemberExpression") {
          if (current.optional) {
            return true;
          }
          current = current.object;
          continue;
        }
        if (current.type === "CallExpression") {
          current = current.callee;
          continue;
        }
        return false;
      }
      return false;
    }

    function report(node, text) {
      context.report({
        node,
        message: `"${text}" may be undefined and is used where undefined throws an error. [typescript:${ruleKey}]`,
      });
    }

    function isInsideChain(node) {
      let current = node;
      while (current.parent) {
        const parent = current.parent;
        if (parent.type === "ChainExpression") {
          return true;
        }
        if (
          (parent.type === "MemberExpression" && parent.object === current) ||
          (parent.type === "CallExpression" && parent.callee === current)
        ) {
          current = parent;
          continue;
        }
        return false;
      }
      return false;
    }

    return {
      CallExpression(node) {
        // Calls that are part of the optional chain itself are safe:
        // "event?.callback()" short-circuits, "(event?.callback)()" throws.
        if (isInsideChain(node)) {
          return;
        }
        if (!isGuarded(node.callee) && containsOptionalChain(node.callee)) {
          report(node.callee, context.sourceCode.getText(node.callee));
        }
      },
      VariableDeclarator(node) {
        if (
          (node.id.type === "ObjectPattern" ||
            node.id.type === "ArrayPattern") &&
          node.init &&
          !isGuarded(node.init) &&
          containsOptionalChain(node.init)
        ) {
          report(node.init, context.sourceCode.getText(node.init));
        }
      },
      SpreadElement(node) {
        // Object spread ({...x}) is safe; iterable spread (f(...x)) throws.
        if (node.parent && node.parent.type === "ObjectExpression") {
          return;
        }
        if (containsOptionalChain(node.argument)) {
          report(node.argument, context.sourceCode.getText(node.argument));
        }
      },
    };
  },
);

const S6534 = createSonarRule(
  "S6534",
  "Numbers should not lose precision",
  (context, ruleKey) => ({
    Literal(node) {
      if (
        typeof node.value === "number" &&
        Number.isFinite(node.value) &&
        Math.abs(node.value) > Number.MAX_SAFE_INTEGER
      ) {
        context.report({
          node,
          message: `"${node.raw}" exceeds the maximum safe integer and may lose precision. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

const HOOK_NAME_REGEX = /^(use[A-Z0-9]|use$)/;

function isHookName(name) {
  return Boolean(name) && HOOK_NAME_REGEX.test(name);
}

function isBooleanContextParent(parent) {
  return (
    parent.type === "IfStatement" ||
    parent.type === "WhileStatement" ||
    parent.type === "DoWhileStatement" ||
    parent.type === "ForStatement" ||
    parent.type === "ConditionalExpression" ||
    (parent.type === "LogicalExpression" &&
      (parent.operator === "&&" || parent.operator === "||"))
  );
}

const S6440 = createSonarRule(
  "S6440",
  "React Hooks should be properly called",
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (!methodName || !isHookName(methodName)) {
        return;
      }
      let parent = node.parent;
      while (parent) {
        if (isBooleanContextParent(parent)) {
          context.report({
            node,
            message: `Hook "${methodName}" must be called unconditionally at the top level of a component or hook. [typescript:${ruleKey}]`,
          });
          return;
        }
        if (isFunction(parent)) {
          return;
        }
        parent = parent.parent;
      }
    },
  }),
);

function getEnclosingFunctionName(fn) {
  if (fn.id && fn.id.name) {
    return fn.id.name;
  }
  const parent = fn.parent;
  if (
    parent &&
    parent.type === "VariableDeclarator" &&
    parent.id.type === "Identifier"
  ) {
    return parent.id.name;
  }
  if (
    parent &&
    parent.type === "Property" &&
    parent.key &&
    parent.key.type === "Identifier"
  ) {
    return parent.key.name;
  }
  return null;
}

const S6442 = createSonarRule(
  "S6442",
  "React's useState hook should not be used directly in the render function or body of a component",
  (context, ruleKey) => ({
    CallExpression(node) {
      if (getMethodName(node) !== "useState") {
        return;
      }
      let parent = node.parent;
      while (parent && !isFunction(parent)) {
        parent = parent.parent;
      }
      if (!parent) {
        context.report({
          node,
          message:
            "useState must be called inside a React component or custom hook. [typescript:" +
            ruleKey +
            "]",
        });
        return;
      }
      const name = getEnclosingFunctionName(parent);
      if (name && !/^[A-Z]/.test(name) && !isHookName(name)) {
        context.report({
          node,
          message: `Move useState into a component or custom hook ("${name}" is neither). [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

const MATCHER_NAMES = new Set([
  "toBe",
  "toEqual",
  "toStrictEqual",
  "toMatch",
  "toContain",
  "toBeTruthy",
  "toBeFalsy",
]);

const S5863 = createSonarRule(
  "S5863",
  "Assertions should not be given twice the same argument",
  (context, ruleKey) => ({
    CallExpression(node) {
      const callee = node.callee;
      const matcher = getMethodName(node);
      if (
        callee.type !== "MemberExpression" ||
        !matcher ||
        !MATCHER_NAMES.has(matcher) ||
        node.arguments.length !== 1
      ) {
        return;
      }
      const actual =
        callee.object.type === "CallExpression" &&
        getMethodName(callee.object) === "expect" &&
        callee.object.arguments.length === 1
          ? context.sourceCode.getText(callee.object.arguments[0])
          : context.sourceCode.getText(callee.object);
      const expected = context.sourceCode.getText(node.arguments[0]);
      if (actual && actual === expected) {
        context.report({
          node,
          message: `The assertion "${actual}" is compared with itself. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

const S3531 = createSonarRule(
  "S3531",
  'Generators should explicitly "yield" a value',
  (context, ruleKey) => {
    function check(node) {
      if (
        !node.generator ||
        !node.body ||
        node.body.type !== "BlockStatement"
      ) {
        return;
      }
      let hasYield = false;
      const walk = createAstWalker(context.sourceCode);
      walk(node.body, (child) => {
        if (child.type === "YieldExpression") {
          hasYield = true;
          return true;
        }
        return false;
      });
      if (!hasYield) {
        context.report({
          node,
          message:
            "This generator never yields a value; remove the generator or add a yield. [typescript:" +
            ruleKey +
            "]",
        });
      }
    }
    return {
      FunctionDeclaration: check,
      FunctionExpression: check,
    };
  },
);

const S2123 = createSonarRule(
  "S2123",
  "Values should not be uselessly incremented",
  (context, ruleKey) => ({
    AssignmentExpression(node) {
      if (
        node.operator === "=" &&
        node.right.type === "UpdateExpression" &&
        node.left.type === "Identifier" &&
        node.right.argument.type === "Identifier" &&
        node.left.name === node.right.argument.name
      ) {
        context.report({
          node,
          message: `The increment of "${node.left.name}" is discarded by the assignment. [typescript:${ruleKey}]`,
        });
      }
    },
    ReturnStatement(node) {
      if (node.argument && node.argument.type === "UpdateExpression") {
        context.report({
          node: node.argument,
          message:
            "The incremented value is discarded; use the prefix form instead. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

const S3699 = createSonarRule(
  "S3699",
  "The return value of void functions should not be used",
  (context, ruleKey) => {
    function checkUsed(callNode, usageNode) {
      const methodName = getMethodName(callNode);
      if (!methodName || !VOID_METHODS.has(methodName)) {
        return;
      }
      const isConsoleCall =
        callNode.callee.type === "MemberExpression" &&
        callNode.callee.object.type === "Identifier" &&
        callNode.callee.object.name === "console";
      if (!isConsoleCall && methodName !== "forEach") {
        return;
      }
      context.report({
        node: usageNode,
        message: `The return value of void function "${methodName}()" should not be used. [typescript:${ruleKey}]`,
      });
    }

    return {
      VariableDeclarator(node) {
        if (node.init && node.init.type === "CallExpression") {
          checkUsed(node.init, node.init);
        }
      },
      ReturnStatement(node) {
        if (node.argument && node.argument.type === "CallExpression") {
          checkUsed(node.argument, node.argument);
        }
      },
    };
  },
);

const S2137 = createSonarRule(
  "S2137",
  "Special identifiers should not be bound or assigned",
  (context, ruleKey) => ({
    AssignmentExpression(node) {
      if (
        node.left.type === "Identifier" &&
        SPECIAL_IDENTIFIERS.has(node.left.name)
      ) {
        context.report({
          node: node.left,
          message: `Do not assign to the special identifier "${node.left.name}". [typescript:${ruleKey}]`,
        });
      }
    },
    VariableDeclarator(node) {
      if (
        node.id.type === "Identifier" &&
        SPECIAL_IDENTIFIERS.has(node.id.name)
      ) {
        context.report({
          node: node.id,
          message: `Do not bind the special identifier "${node.id.name}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

function getForLoopCounter(init) {
  if (init.type === "VariableDeclaration") {
    const first = init.declarations[0];
    return first && first.id.type === "Identifier" ? first.id.name : null;
  }
  return init.type === "Identifier" ? init.name : null;
}

function movesInWrongDirection(operator, updateText) {
  const ascending = operator === "<" || operator === "<=";
  const descending = operator === ">" || operator === ">=";
  if (!ascending && !descending) {
    return false;
  }
  const decrements = /--/.test(updateText) || /-=\s*/.test(updateText);
  const increments = /\+\+/.test(updateText) || /\+=/.test(updateText);
  return (ascending && decrements) || (descending && increments);
}

const S2251 = createSonarRule(
  "S2251",
  'A "for" loop update clause should move the counter in the right direction',
  (context, ruleKey) => ({
    ForStatement(node) {
      if (!node.init || !node.test || !node.update) {
        return;
      }
      const counter = getForLoopCounter(node.init);
      if (!counter || node.test.type !== "BinaryExpression") {
        return;
      }
      const testText = context.sourceCode.getText(node.test);
      if (!testText.includes(counter)) {
        return;
      }
      const updateText = context.sourceCode.getText(node.update);
      if (movesInWrongDirection(node.test.operator, updateText)) {
        context.report({
          node: node.update,
          message: `The loop counter "${counter}" moves in the wrong direction. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

const S2999 = createSonarRule(
  "S2999",
  '"new" should only be used with functions and classes',
  (context, ruleKey) => ({
    NewExpression(node) {
      const callee = node.callee;
      const isConstructible =
        callee.type === "Identifier" ||
        callee.type === "MemberExpression" ||
        callee.type === "CallExpression" ||
        callee.type === "NewExpression" ||
        callee.type === "FunctionExpression" ||
        callee.type === "ClassExpression" ||
        callee.type === "TaggedTemplateExpression";
      if (!isConstructible) {
        context.report({
          node: callee,
          message:
            '"new" can only be used with functions and classes. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

function isBooleanContext(node) {
  let current = node;
  let parent = current.parent;
  while (
    parent &&
    (parent.type === "LogicalExpression" ||
      (parent.type === "UnaryExpression" && parent.operator === "!"))
  ) {
    current = parent;
    parent = current.parent;
  }
  if (!parent) {
    return false;
  }
  const isConditionTest =
    (parent.type === "IfStatement" ||
      parent.type === "WhileStatement" ||
      parent.type === "DoWhileStatement" ||
      parent.type === "ForStatement") &&
    parent.test === current;
  const isTernaryTest =
    parent.type === "ConditionalExpression" && parent.test === current;
  return isConditionTest || isTernaryTest;
}

const S1529 = createSonarRule(
  "S1529",
  "Bitwise operators should not be used in boolean contexts",
  (context, ruleKey) => ({
    BinaryExpression(node) {
      if (
        node.operator === "&" ||
        node.operator === "|" ||
        node.operator === "^"
      ) {
        if (isBooleanContext(node)) {
          context.report({
            node,
            message: `The bitwise operator "${node.operator}" is used in a boolean context; did you mean the logical operator? [typescript:${ruleKey}]`,
          });
        }
      }
    },
  }),
);

const S6080 = createSonarRule(
  "S6080",
  "Disabling Mocha timeouts should be explicit",
  (context, ruleKey) => ({
    CallExpression(node) {
      const callee = node.callee;
      if (
        callee.type === "MemberExpression" &&
        !callee.computed &&
        callee.property.type === "Identifier" &&
        callee.property.name === "timeout" &&
        callee.object.type === "ThisExpression" &&
        node.arguments.length === 1
      ) {
        const value = node.arguments[0];
        const disablesTimeout =
          (value.type === "Literal" && value.value === 0) ||
          (value.type === "Identifier" && value.name === "Infinity");
        if (disablesTimeout) {
          context.report({
            node: value,
            message:
              "Disabling Mocha timeouts should be done explicitly and only when required. [typescript:" +
              ruleKey +
              "]",
          });
        }
      }
    },
  }),
);

const S4822 = createSonarRule(
  "S4822",
  'Promise rejections should not be caught by "try" blocks',
  (context, ruleKey) => ({
    TryStatement(node) {
      const walk = createAstWalker(context.sourceCode, {
        skipNestedFunctions: true,
      });
      walk(node.block, (child) => {
        if (
          child.type === "CallExpression" &&
          child.callee.type === "MemberExpression" &&
          !child.callee.computed &&
          child.callee.object.type === "Identifier" &&
          child.callee.object.name === "Promise" &&
          child.callee.property.type === "Identifier" &&
          child.callee.property.name === "reject"
        ) {
          context.report({
            node: child,
            message:
              "A promise rejection inside a try block is not caught by the catch clause. [typescript:" +
              ruleKey +
              "]",
          });
          return true;
        }
        return false;
      });
    },
  }),
);

const S3981 = createSonarRule(
  "S3981",
  "Collection size and array length comparisons should make sense",
  (context, ruleKey) => ({
    BinaryExpression(node) {
      const isLength = (operand) =>
        operand.type === "MemberExpression" &&
        !operand.computed &&
        operand.property.type === "Identifier" &&
        (operand.property.name === "length" ||
          operand.property.name === "size");
      const isZero = (operand) =>
        operand.type === "Literal" && operand.value === 0;
      const alwaysTrue =
        isLength(node.left) && isZero(node.right) && node.operator === ">=";
      const alwaysFalse =
        isLength(node.left) && isZero(node.right) && node.operator === "<";
      if (alwaysTrue || alwaysFalse) {
        context.report({
          node,
          message: `This comparison is always ${alwaysTrue ? "true" : "false"}; compare against a meaningful bound instead. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

const S3984 = createSonarRule(
  "S3984",
  "Errors should not be created without being thrown",
  (context, ruleKey) => {
    const ERROR_NAME_REGEX = /^(?:Error|[A-Z][A-Za-z]*Error)$/;
    return {
      ExpressionStatement(node) {
        const expression = node.expression;
        const isErrorCreation =
          expression.type === "NewExpression" &&
          ((expression.callee.type === "Identifier" &&
            ERROR_NAME_REGEX.test(expression.callee.name)) ||
            (expression.callee.type === "MemberExpression" &&
              !expression.callee.computed &&
              expression.callee.property.type === "Identifier" &&
              ERROR_NAME_REGEX.test(expression.callee.property.name)));
        const isErrorCall =
          expression.type === "CallExpression" &&
          expression.callee.type === "Identifier" &&
          ERROR_NAME_REGEX.test(expression.callee.name);
        if (isErrorCreation || isErrorCall) {
          context.report({
            node,
            message:
              "This error is created but never thrown; throw it or remove it. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

const S1848 = createSonarRule(
  "S1848",
  "Objects should not be created to be dropped immediately without being used",
  (context, ruleKey) => ({
    ExpressionStatement(node) {
      if (node.expression.type === "NewExpression") {
        context.report({
          node,
          message:
            "This created object is not used anywhere; assign it or remove the statement. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

const S6328 = createSonarRule(
  "S6328",
  "Replacement strings should reference existing regular expression groups",
  (context, ruleKey) => {
    function skipCharacterClass(pattern, index) {
      let cursor = index + 1;
      while (cursor < pattern.length && pattern[cursor] !== "]") {
        cursor += pattern[cursor] === BACKSLASH ? 2 : 1;
      }
      return cursor;
    }

    function countGroups(pattern) {
      let count = 0;
      let index = 0;
      while (index < pattern.length) {
        const char = pattern[index];
        if (char === BACKSLASH) {
          index += 2;
          continue;
        }
        if (char === "[") {
          index = skipCharacterClass(pattern, index) + 1;
          continue;
        }
        if (char === "(" && pattern[index + 1] !== "?") {
          count += 1;
        }
        index += 1;
      }
      return count;
    }

    return {
      CallExpression(node) {
        if (getMethodName(node) !== "replace" || node.arguments.length < 2) {
          return;
        }
        const patternArgument = node.arguments[0];
        const replacement = node.arguments[1];
        const pattern =
          patternArgument.type === "Literal" && patternArgument.regex
            ? patternArgument.regex.pattern
            : null;
        if (!pattern || replacement.type !== "Literal") {
          return;
        }
        const groups = countGroups(pattern);
        const replacementText = String(
          replacement.value === undefined ? "" : replacement.value,
        );
        for (const match of replacementText.matchAll(/\$(\d+)/g)) {
          if (Number(match[1]) > groups) {
            context.report({
              node: replacement,
              message: `Replacement references group $${match[1]} but the pattern only has ${groups}. [typescript:${ruleKey}]`,
            });
            return;
          }
        }
      },
    };
  },
);

const S6351 = createSonarRule(
  "S6351",
  "Regular expressions with the global flag should be used with caution",
  (context, ruleKey) => {
    const globalRegexVars = new Set();
    const lastIndexResetVars = new Set();

    function isGlobalRegex(node) {
      if (!node) {
        return false;
      }
      if (node.type === "Literal" && node.regex) {
        return node.regex.flags.includes("g");
      }
      if (node.type === "Identifier") {
        return globalRegexVars.has(node.name);
      }
      return false;
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type === "Identifier" && isGlobalRegex(node.init)) {
          globalRegexVars.add(node.id.name);
        }
      },
      AssignmentExpression(node) {
        if (
          node.left.type === "MemberExpression" &&
          !node.left.computed &&
          node.left.property.type === "Identifier" &&
          node.left.property.name === "lastIndex" &&
          node.left.object.type === "Identifier"
        ) {
          lastIndexResetVars.add(node.left.object.name);
        }
      },
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === "MemberExpression" &&
          !callee.computed &&
          callee.property.type === "Identifier" &&
          (callee.property.name === "test" ||
            callee.property.name === "exec") &&
          isGlobalRegex(callee.object)
        ) {
          const objectName =
            callee.object.type === "Identifier" ? callee.object.name : null;
          if (objectName && lastIndexResetVars.has(objectName)) {
            return;
          }
          context.report({
            node,
            message:
              "A global regular expression keeps state (lastIndex) between calls; use a non-global expression or reset lastIndex. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

const S4143 = createSonarRule(
  "S4143",
  "Collection elements should not be replaced unconditionally",
  (context, ruleKey) => ({
    ExpressionStatement(node) {
      const expression = node.expression;
      if (expression.type !== "AssignmentExpression") {
        return;
      }
      const left = expression.left;
      if (left.type !== "MemberExpression") {
        return;
      }
      const parent = node.parent;
      if (!parent || !Array.isArray(parent.body)) {
        return;
      }
      const index = parent.body.indexOf(node);
      if (index <= 0) {
        return;
      }
      const previous = parent.body[index - 1];
      if (
        previous.type !== "ExpressionStatement" ||
        previous.expression.type !== "AssignmentExpression" ||
        previous.expression.left.type !== "MemberExpression"
      ) {
        return;
      }
      const key = context.sourceCode.getText(left);
      if (context.sourceCode.getText(previous.expression.left) === key) {
        context.report({
          node: left,
          message: `"${key}" is overwritten without its value being read. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

const S6324 = createSonarRule(
  "S6324",
  "Regular expressions should not contain control characters",
  (context, ruleKey) => {
    const controlEscape =
      /\\(?:x(?:0[0-9a-f]|1[0-9a-f])|u00(?:0[0-9a-f]|1[0-9a-f]))/i;

    function hasControlCharacter(pattern) {
      for (const char of pattern) {
        const code = char.codePointAt(0);
        if (code <= 0x1f || code === 0x7f) {
          return true;
        }
      }
      return false;
    }

    return {
      Literal(node) {
        if (
          node.regex &&
          (hasControlCharacter(node.regex.pattern) ||
            controlEscape.test(node.regex.pattern))
        ) {
          context.report({
            node,
            message:
              "Remove control characters from this regular expression. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

const S5256 = createSonarRule(
  "S5256",
  "Tables should have headers",
  (context, ruleKey) => ({
    JSXOpeningElement(node) {
      if (
        !node.name ||
        node.name.type !== "JSXIdentifier" ||
        node.name.name !== "table"
      ) {
        return;
      }
      const element = node.parent;
      if (!element || element.type !== "JSXElement") {
        return;
      }
      const hasHeader = (element.children || []).some(
        (child) =>
          child.type === "JSXElement" &&
          child.openingElement &&
          child.openingElement.name &&
          child.openingElement.name.type === "JSXIdentifier" &&
          (child.openingElement.name.name === "thead" ||
            child.openingElement.name.name === "th"),
      );
      if (!hasHeader) {
        context.report({
          node,
          message:
            "Add a header row (<thead> or <th>) to this table. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

const S6756 = createSonarRule(
  "S6756",
  '"setState" should use a callback when referencing the previous state',
  (context, ruleKey) => ({
    CallExpression(node) {
      const callee = node.callee;
      if (
        !callee ||
        callee.type !== "MemberExpression" ||
        callee.computed ||
        callee.property?.name !== "setState" ||
        callee.object?.type !== "ThisExpression"
      ) {
        return;
      }
      const argument = node.arguments[0];
      if (!argument) {
        return;
      }
      if (
        argument.type === "FunctionExpression" ||
        argument.type === "ArrowFunctionExpression"
      ) {
        return;
      }
      if (/\bthis\.state\b/.test(context.sourceCode.getText(argument))) {
        context.report({
          node: argument,
          message: `Use the callback form of "setState" when referencing the previous state. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

module.exports = {
  S7727,
  S7739,
  S6638,
  S1534,
  S1656,
  S905,
  S6426,
  S4124,
  S6435,
  S6523,
  S6534,
  S6440,
  S6442,
  S5863,
  S3531,
  S2123,
  S3699,
  S2137,
  S2251,
  S2999,
  S1529,
  S6080,
  S4822,
  S3981,
  S3984,
  S1848,
  S6328,
  S6351,
  S4143,
  S6324,
  S5256,
  S6756,
};
