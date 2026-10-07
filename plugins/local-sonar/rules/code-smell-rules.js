"use strict";

const {
  createSonarRule,
  getMethodName,
  isFunction,
} = require("../utils/rule-helpers");
const { createAstWalker } = require("../utils/ast-walk");
const { getTypeServices, isPromiseLikeType } = require("../utils/type-helpers");

/**
 * General JavaScript/TypeScript code-smell rules (Sonar way).
 */

const OCTAL_REGEX = /^0[0-7]+$/;
const ABSOLUTE_PATH_REGEX = /^(\/|[A-Za-z]:[\\/]|\\\\)/;
const ASSERTION_NAME_REGEX = /(expect|assert|assure|should|assertThat|verify)/i;
const TEST_CALLEE_NAMES = new Set(["it", "test", "fit", "xit", "xtest"]);
function getLiteralKey(node) {
  if (node.type === "Literal") {
    return `${typeof node.value}:${String(node.value)}`;
  }
  if (node.type === "Identifier") {
    return `id:${node.name}`;
  }
  return null;
}

function isObviouslyNotPromise(node) {
  return (
    node.type === "Literal" ||
    node.type === "ArrayExpression" ||
    node.type === "ObjectExpression" ||
    node.type === "TemplateLiteral" ||
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionExpression"
  );
}

const LIFECYCLE_NAMES = new Set([
  "ngOnChanges",
  "ngOnInit",
  "ngDoCheck",
  "ngAfterContentInit",
  "ngAfterContentChecked",
  "ngAfterViewInit",
  "ngAfterViewChecked",
  "ngOnDestroy",
]);

// S7783: "trimLeft()" and "trimRight()" should be replaced with "trimStart()"/"trimEnd()"
const S7783 = createSonarRule(
  "S7783",
  '"trimLeft()" and "trimRight()" should be replaced with "trimStart()" and "trimEnd()"',
  (context, ruleKey) => ({
    CallExpression(node) {
      const methodName = getMethodName(node);
      if (methodName === "trimLeft" || methodName === "trimRight") {
        const replacement = methodName === "trimLeft" ? "trimStart" : "trimEnd";
        context.report({
          node,
          message: `Replace "${methodName}()" with "${replacement}()". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6861: Mutable variables should not be exported
const S6861 = createSonarRule(
  "S6861",
  "Mutable variables should not be exported",
  (context, ruleKey) => ({
    ExportNamedDeclaration(node) {
      const declaration = node.declaration;
      if (
        !declaration ||
        declaration.type !== "VariableDeclaration" ||
        declaration.kind === "const"
      ) {
        return;
      }
      for (const declarator of declaration.declarations) {
        context.report({
          node: declarator.id,
          message:
            'Exported variables should be immutable ("const") or wrapped in a getter. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S1186: Functions should not be empty
function hasOnlyComments(context, body) {
  if (!body || body.type !== "BlockStatement") {
    return false;
  }
  if (body.body.length > 0) {
    return false;
  }
  return context.sourceCode.getCommentsInside(body).length > 0;
}

const S1186 = createSonarRule(
  "S1186",
  "Functions should not be empty",
  (context, ruleKey) => {
    function checkFunction(node) {
      const body = node.body;
      if (!body || body.type !== "BlockStatement" || body.body.length > 0) {
        return;
      }
      if (hasOnlyComments(context, body)) {
        return;
      }
      context.report({
        node,
        message:
          "Remove this empty function or document why it must stay empty. [typescript:" +
          ruleKey +
          "]",
      });
    }

    return {
      FunctionDeclaration: checkFunction,
      MethodDefinition(node) {
        if (node.value) {
          checkFunction(node.value);
        }
      },
    };
  },
);

// S6859: Imports should not use absolute paths
const S6859 = createSonarRule(
  "S6859",
  "Imports should not use absolute paths",
  (context, ruleKey) => ({
    ImportDeclaration(node) {
      const source = node.source && node.source.value;
      if (typeof source === "string" && ABSOLUTE_PATH_REGEX.test(source)) {
        context.report({
          node: node.source,
          message: `Use a relative or aliased import instead of the absolute path "${source}". [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S7059: Constructors should not contain asynchronous operations
const ASYNC_CALL_NAMES = new Set([
  "fetch",
  "readFile",
  "writeFile",
  "setTimeout",
  "setInterval",
  "request",
  "axios",
  "query",
  "exec",
  "connect",
  "open",
  "read",
  "write",
]);

const S7059 = createSonarRule(
  "S7059",
  "Constructors should not contain asynchronous operations",
  (context, ruleKey) => ({
    MethodDefinition(node) {
      if (node.kind !== "constructor" || !isFunction(node.value)) {
        return;
      }
      const walk = createAstWalker(context.sourceCode, {
        skipNestedFunctions: true,
      });
      walk(node.value.body, (child) => {
        let isAsyncOperation = false;
        if (child.type === "AwaitExpression") {
          isAsyncOperation = true;
        } else if (
          child.type === "NewExpression" &&
          child.callee.type === "Identifier" &&
          child.callee.name === "Promise"
        ) {
          isAsyncOperation = true;
        } else if (
          child.type === "CallExpression" &&
          ASYNC_CALL_NAMES.has(getMethodName(child))
        ) {
          isAsyncOperation = true;
        }
        if (isAsyncOperation) {
          context.report({
            node: child,
            message:
              "Constructors should not start asynchronous work; expose an init method instead. [typescript:" +
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

// S3516: Function returns should not be invariant
const S3516 = createSonarRule(
  "S3516",
  "Function returns should not be invariant",
  (context, ruleKey) => {
    function checkFunction(node) {
      const body = node.body;
      if (!body || body.type !== "BlockStatement") {
        return;
      }
      const returns = [];
      let hasUnknownReturn = false;
      const walk = createAstWalker(context.sourceCode, {
        skipNestedFunctions: "all",
      });
      walk(body, (child) => {
        if (child.type === "ReturnStatement" && child.argument) {
          const key = getLiteralKey(child.argument);
          if (key) {
            returns.push({ node: child, key });
          } else {
            hasUnknownReturn = true;
          }
        }
        return false;
      });
      if (hasUnknownReturn || returns.length < 2) {
        return;
      }
      const firstKey = returns[0].key;
      if (returns.every((item) => item.key === firstKey)) {
        context.report({
          node: returns[0].node,
          message:
            "This function always returns the same value; remove the redundant returns. [typescript:" +
            ruleKey +
            "]",
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

// S1314: Octal values should not be used
const S1314 = createSonarRule(
  "S1314",
  "Octal values should not be used",
  (context, ruleKey) => ({
    Literal(node) {
      if (
        typeof node.raw === "string" &&
        (OCTAL_REGEX.test(node.raw) || /^0[oO][0-7]+$/.test(node.raw))
      ) {
        context.report({
          node,
          message:
            "Do not use octal values; use a decimal or hexadecimal literal instead. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S2430: Constructor names should start with an upper case letter
const S2430 = createSonarRule(
  "S2430",
  "Constructor names should start with an upper case letter",
  (context, ruleKey) => ({
    NewExpression(node) {
      const callee = node.callee;
      if (
        callee.type === "Identifier" &&
        /^[a-z]/.test(callee.name) &&
        !callee.name.startsWith("_")
      ) {
        context.report({
          node: callee,
          message: `Constructor "${callee.name}" should start with an upper case letter. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S3504: Variables should be declared with "let" or "const"
const S3504 = createSonarRule(
  "S3504",
  'Variables should be declared with "let" or "const"',
  (context, ruleKey) => ({
    VariableDeclaration(node) {
      if (node.kind === "var") {
        context.report({
          node,
          message:
            'Replace "var" with "let" or "const". [typescript:' + ruleKey + "]",
        });
      }
    },
  }),
);

// S4123: "await" should only be used with promises
const S4123 = createSonarRule(
  "S4123",
  '"await" should only be used with promises',
  (context, ruleKey) => {
    return {
      AwaitExpression(node) {
        if (isObviouslyNotPromise(node.argument)) {
          context.report({
            node: node.argument,
            message:
              'Remove "await": the awaited value is not a promise. [typescript:' +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

// S4524: "default" clauses should be last
const S4524 = createSonarRule(
  "S4524",
  '"default" clauses should be last',
  (context, ruleKey) => ({
    SwitchStatement(node) {
      const cases = node.cases || [];
      const defaultIndex = cases.findIndex((item) => !item.test);
      if (defaultIndex !== -1 && defaultIndex !== cases.length - 1) {
        context.report({
          node: cases[defaultIndex],
          message:
            'Move the "default" clause to the end of the switch statement. [typescript:' +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S2699: Tests should include assertions
const S2699 = createSonarRule(
  "S2699",
  "Tests should include assertions",
  (context, ruleKey) => {
    function callbackHasAssertion(callback) {
      if (!isFunction(callback) || !callback.body) {
        return callback ? callback.type !== "ArrowFunctionExpression" : true;
      }
      let found = false;
      const walk = createAstWalker(context.sourceCode);
      walk(callback.body, (child) => {
        if (child.type === "CallExpression") {
          const name = getMethodName(child);
          if (name && ASSERTION_NAME_REGEX.test(name)) {
            found = true;
            return true;
          }
        }
        return false;
      });
      return found;
    }

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type !== "Identifier" ||
          !TEST_CALLEE_NAMES.has(callee.name)
        ) {
          return;
        }
        const callback = node.arguments.find((argument) =>
          isFunction(argument),
        );
        if (callback && !callbackHasAssertion(callback)) {
          context.report({
            node,
            message:
              "Add an assertion to this test case. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

// S1994: "for" loop increment clauses should modify the loops' counters
const S1994 = createSonarRule(
  "S1994",
  '"for" loop increment clauses should modify the loops\' counters',
  (context, ruleKey) => ({
    ForStatement(node) {
      if (!node.update || !node.test || !node.init) {
        return;
      }
      const initDeclarators =
        node.init.type === "VariableDeclaration"
          ? node.init.declarations.map((declaration) => declaration.id)
          : [node.init];
      const counters = initDeclarators
        .filter((target) => target && target.type === "Identifier")
        .map((target) => target.name);
      if (counters.length === 0) {
        return;
      }
      const updated = new Set();
      const walk = createAstWalker(context.sourceCode, {
        skipNestedFunctions: true,
      });
      walk(node.update, (child) => {
        if (child.type === "Identifier") {
          updated.add(child.name);
        }
        if (
          child.type === "AssignmentExpression" &&
          child.left.type === "Identifier"
        ) {
          updated.add(child.left.name);
        }
        return false;
      });
      if (!counters.some((counter) => updated.has(counter))) {
        context.report({
          node: node.update,
          message: `The loop counter "${counters[0]}" is not modified by the update clause. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S2970: Assertions should be complete
const S2970 = createSonarRule(
  "S2970",
  "Assertions should be complete",
  (context, ruleKey) => ({
    ExpressionStatement(node) {
      const expression = node.expression;
      if (expression.type !== "CallExpression") {
        return;
      }
      const callee = expression.callee;
      const isExpectCall =
        (callee.type === "Identifier" && callee.name === "expect") ||
        (callee.type === "MemberExpression" &&
          !callee.computed &&
          callee.property.type === "Identifier" &&
          callee.property.name === "expect");
      if (isExpectCall) {
        context.report({
          node: expression,
          message:
            "Complete this assertion with a matcher call (e.g. toBe, toEqual). [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S1219: "switch" statements should not contain non-case labels
const S1219 = createSonarRule(
  "S1219",
  '"switch" statements should not contain non-case labels',
  (context, ruleKey) => ({
    LabeledStatement(node) {
      let parent = node.parent;
      while (parent) {
        if (parent.type === "SwitchStatement") {
          context.report({
            node,
            message: `Remove this label from the switch statement. [typescript:${ruleKey}]`,
          });
          return;
        }
        if (
          parent.type === "FunctionDeclaration" ||
          parent.type === "FunctionExpression" ||
          parent.type === "ArrowFunctionExpression"
        ) {
          return;
        }
        parent = parent.parent;
      }
    },
  }),
);

// S3735: "void" should not be used
const S3735 = createSonarRule(
  "S3735",
  '"void" should not be used',
  (context, ruleKey) => {
    const services = getTypeServices(context);

    function isFloatingPromiseIgnore(node) {
      if (!services) {
        return false;
      }
      const type = services.checker.getTypeAtLocation(
        services.toTsNode(node.argument),
      );
      return isPromiseLikeType(type);
    }

    return {
      UnaryExpression(node) {
        if (node.operator !== "void") {
          return;
        }
        // Sonar allows `void somePromise` as the explicit floating-promise
        // ignore idiom; only other uses are reported.
        if (isFloatingPromiseIgnore(node)) {
          return;
        }
        context.report({
          node,
          message:
            'Do not use the "void" operator. [typescript:' + ruleKey + "]",
        });
      },
    };
  },
);

// S3972: Conditionals should start on new lines
const S3972 = createSonarRule(
  "S3972",
  "Conditionals should start on new lines",
  (context, ruleKey) => ({
    IfStatement(node) {
      const parent = node.parent;
      if (!parent || parent.type !== "BlockStatement") {
        return;
      }
      const index = parent.body.indexOf(node);
      if (index <= 0) {
        return;
      }
      const previous = parent.body[index - 1];
      if (
        previous.type === "IfStatement" &&
        previous.loc &&
        node.loc &&
        previous.loc.end.line === node.loc.start.line
      ) {
        context.report({
          node,
          message:
            "Start this conditional on a new line to avoid confusion with the previous block. [typescript:" +
            ruleKey +
            "]",
        });
      }
    },
  }),
);

// S6079: Tests should not execute any code after "done()" is called
const S6079 = createSonarRule(
  "S6079",
  'Tests should not execute any code after "done()" is called',
  (context, ruleKey) => ({
    BlockStatement(node) {
      const statements = node.body || [];
      const doneIndex = statements.findIndex(
        (statement) =>
          statement.type === "ExpressionStatement" &&
          statement.expression.type === "CallExpression" &&
          statement.expression.callee.type === "Identifier" &&
          statement.expression.callee.name === "done",
      );
      if (doneIndex === -1 || doneIndex === statements.length - 1) {
        return;
      }
      context.report({
        node: statements[doneIndex + 1],
        message:
          'Remove the code after "done()"; the test has already finished. [typescript:' +
          ruleKey +
          "]",
      });
    },
  }),
);

// S2004: Functions should not be nested too deeply
const MAX_FUNCTION_DEPTH = 4;

const S2004 = createSonarRule(
  "S2004",
  "Functions should not be nested too deeply",
  (context, ruleKey) => {
    let depth = 0;
    const reported = new Set();

    function enter(node) {
      if (!isFunction(node)) {
        return;
      }
      depth += 1;
      if (depth > MAX_FUNCTION_DEPTH && !reported.has(node)) {
        reported.add(node);
        context.report({
          node,
          message: `Refactor this function: nesting depth ${depth} exceeds the allowed ${MAX_FUNCTION_DEPTH}. [typescript:${ruleKey}]`,
        });
      }
    }

    function exit(node) {
      if (isFunction(node)) {
        depth -= 1;
      }
    }

    return {
      FunctionDeclaration: enter,
      FunctionExpression: enter,
      ArrowFunctionExpression: enter,
      "FunctionDeclaration:exit": exit,
      "FunctionExpression:exit": exit,
      "ArrowFunctionExpression:exit": exit,
    };
  },
);

// S2187: Test files should contain at least one test case
const S2187 = createSonarRule(
  "S2187",
  "Test files should contain at least one test case",
  (context, ruleKey) => {
    const filename = context.filename || "";
    if (!/\.(test|spec)\.[cm]?[jt]sx?$/.test(filename)) {
      return {};
    }
    let hasTest = false;
    return {
      CallExpression(node) {
        const name = getMethodName(node);
        if (name && (TEST_CALLEE_NAMES.has(name) || name === "run")) {
          hasTest = true;
        }
      },
      "Program:exit"(node) {
        if (!hasTest) {
          context.report({
            node,
            message:
              "Add at least one test case to this test file. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

module.exports = {
  S7783,
  S6861,
  S1186,
  S6859,
  S7059,
  S3516,
  S1314,
  S2430,
  S3504,
  S4123,
  S4524,
  S2699,
  S1994,
  S2970,
  S1219,
  S3735,
  S3972,
  S6079,
  S2004,
  S2187,
  LIFECYCLE_NAMES,
};
