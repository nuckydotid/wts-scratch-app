"use strict";

/**
 * Async, Promises & Error Handling Engine
 * Covers: S1143, S2486, S4123, S4645, S6544, S6545, S1751, S1763, etc.
 */

const TERMINATING_STATEMENTS = new Set([
  "ReturnStatement",
  "ThrowStatement",
  "BreakStatement",
  "ContinueStatement",
]);

function createAsyncErrorRule(ruleKey, ruleName, checkFn) {
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

// S1143: Jump statements (return, throw, break, continue) should not occur in "finally" blocks
const S1143 = createAsyncErrorRule(
  "S1143",
  'Control flow statements should not be used in "finally" blocks',
  (context) => ({
    TryStatement(node) {
      if (node.finalizer?.type === "BlockStatement") {
        for (const stmt of node.finalizer.body) {
          if (
            stmt.type === "ReturnStatement" ||
            stmt.type === "ThrowStatement" ||
            stmt.type === "BreakStatement" ||
            stmt.type === "ContinueStatement"
          ) {
            context.report({
              node: stmt,
              message:
                'Do not use jump statements in "finally" blocks as they swallow errors. [typescript:S1143]',
            });
          }
        }
      }
    },
  }),
);

// S2486: Exceptions should not be ignored (unused catch parameter)
const { createAstWalker } = require("../utils/ast-walk");

function isReferenceIdentifier(node) {
  const parent = node.parent;
  if (!parent) {
    return false;
  }
  if (
    parent.type === "MemberExpression" &&
    parent.property === node &&
    !parent.computed
  ) {
    return false;
  }
  if (
    parent.type === "Property" &&
    parent.key === node &&
    !parent.computed &&
    !parent.shorthand
  ) {
    return false;
  }
  if (parent.type === "VariableDeclarator" && parent.id === node) {
    return false;
  }
  if (
    (parent.type === "FunctionDeclaration" ||
      parent.type === "FunctionExpression" ||
      parent.type === "ArrowFunctionExpression") &&
    parent.params.includes(node)
  ) {
    return false;
  }
  if (parent.type === "RestElement" || parent.type === "AssignmentPattern") {
    return false;
  }
  return true;
}

const S2486 = createAsyncErrorRule(
  "S2486",
  "Exceptions should not be ignored",
  (context, ruleKey) => ({
    CatchClause(node) {
      const body = node.body;
      if (!body || body.type !== "BlockStatement") {
        return;
      }
      const param = node.param;
      if (!param || param.type !== "Identifier") {
        return;
      }
      let used = false;
      const walk = createAstWalker(context.sourceCode);
      walk(body, (child) => {
        if (used) {
          return true;
        }
        if (
          child.type === "Identifier" &&
          child.name === param.name &&
          isReferenceIdentifier(child)
        ) {
          used = true;
        }
        return false;
      });
      if (!used) {
        context.report({
          node: param,
          message: `Handle this exception or don't catch it at all. [typescript:${ruleKey}]`,
        });
      }
    },
  }),
);

// S6544: Promises should not be misused
const {
  getTypeServices,
  returnsVoid,
  returnsPromise,
  isPromiseLikeType,
} = require("../utils/type-helpers");

function isPromiseExpression(checker, toTsNode, node) {
  if (!node) {
    return false;
  }
  return isPromiseLikeType(checker.getTypeAtLocation(toTsNode(node)));
}

const S6544 = createAsyncErrorRule(
  "S6544",
  "Promises should not be misused",
  (context, ruleKey) => {
    const services = getTypeServices(context);
    if (!services) {
      // Type-aware rule: no-op without projectService (see eslint.config.js).
      return {};
    }
    const { checker, toTsNode } = services;

    function report(node, message) {
      context.report({ node, message: `${message} [typescript:${ruleKey}]` });
    }

    function checkProvidedFunction(node) {
      const tsNode = toTsNode(node);
      const contextual = checker.getContextualType(tsNode);
      if (!contextual || !returnsVoid(checker, contextual)) {
        return;
      }
      if (returnsPromise(checker, checker.getTypeAtLocation(tsNode))) {
        report(
          node,
          "Promise-returning function provided to property where a void return was expected.",
        );
      }
    }

    function checkCondition(test) {
      if (test && isPromiseExpression(checker, toTsNode, test)) {
        report(test, "Promise used in a boolean context; it is always truthy.");
      }
    }

    return {
      Property(node) {
        if (!node.computed && node.value) {
          checkProvidedFunction(node.value);
        }
      },
      IfStatement(node) {
        checkCondition(node.test);
      },
      WhileStatement(node) {
        checkCondition(node.test);
      },
      DoWhileStatement(node) {
        checkCondition(node.test);
      },
      ForStatement(node) {
        checkCondition(node.test);
      },
      ConditionalExpression(node) {
        checkCondition(node.test);
      },
      SpreadElement(node) {
        if (isPromiseExpression(checker, toTsNode, node.argument)) {
          report(
            node.argument,
            "Promise used in a spread operator; spread the resolved value instead.",
          );
        }
      },
      NewExpression(node) {
        const executor = node.arguments[0];
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "Promise" &&
          executor &&
          (executor.type === "ArrowFunctionExpression" ||
            executor.type === "FunctionExpression") &&
          executor.async
        ) {
          report(executor, "Promise executor should not be an async function.");
        }
      },
    };
  },
);

// S1751: Loops should not terminate unconditionally on first iteration
const S1751 = createAsyncErrorRule(
  "S1751",
  "Loops should not terminate unconditionally on first iteration",
  (context) => ({
    WhileStatement(node) {
      if (
        node.body?.type === "BlockStatement" &&
        node.body.body?.length > 0 &&
        new Set(["BreakStatement", "ReturnStatement", "ThrowStatement"]).has(
          node.body.body[0]?.type,
        )
      ) {
        context.report({
          node,
          message:
            "Loop should not terminate unconditionally on first iteration. [typescript:S1751]",
        });
      }
    },
    ForStatement(node) {
      if (
        node.body?.type === "BlockStatement" &&
        node.body.body?.length > 0 &&
        new Set(["BreakStatement", "ReturnStatement", "ThrowStatement"]).has(
          node.body.body[0]?.type,
        )
      ) {
        context.report({
          node,
          message:
            "Loop should not terminate unconditionally on first iteration. [typescript:S1751]",
        });
      }
    },
  }),
);

// S1763: Unreachable code after jump statement
const S1763 = createAsyncErrorRule(
  "S1763",
  "Unreachable code after jump statement should be removed",
  (context) => ({
    BlockStatement(node) {
      let returned = false;
      for (const stmt of node.body || []) {
        if (returned) {
          context.report({
            node: stmt,
            message:
              "Unreachable code after jump statement. [typescript:S1763]",
          });
          break;
        }
        if (TERMINATING_STATEMENTS.has(stmt.type)) {
          returned = true;
        }
      }
    },
  }),
);

module.exports = {
  S1143,
  S2486,
  S6544,
  S1751,
  S1763,
};
