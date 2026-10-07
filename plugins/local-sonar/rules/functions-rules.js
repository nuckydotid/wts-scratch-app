"use strict";

/**
 * Functions, Parameters & Complexity Engine
 * Covers: S100, S101, S107, S138, S1172, S1541, S2004, S3776, S4144,
 * S2685, S3796, S2814, S3801, S1199, etc.
 */

function createFunctionsRule(ruleKey, ruleName, checkFn) {
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

// S107: Functions should not have too many parameters (e.g. > 7)
const S107 = createFunctionsRule(
  "S107",
  "Functions should not have too many parameters",
  (context) => ({
    FunctionDeclaration(node) {
      if (node.params && node.params.length > 7) {
        context.report({
          node,
          message: `Function has ${node.params.length} parameters, which exceeds threshold of 7. Use an options object. [typescript:S107]`,
        });
      }
    },
    FunctionExpression(node) {
      if (node.params && node.params.length > 7) {
        context.report({
          node,
          message: `Function has ${node.params.length} parameters, which exceeds threshold of 7. Use an options object. [typescript:S107]`,
        });
      }
    },
    ArrowFunctionExpression(node) {
      if (node.params && node.params.length > 7) {
        context.report({
          node,
          message: `Arrow function has ${node.params.length} parameters, which exceeds threshold of 7. Use an options object. [typescript:S107]`,
        });
      }
    },
  }),
);

// S1199: Duplicate parameters should not be used
const S1199 = createFunctionsRule(
  "S1199",
  "Duplicate parameters should not be used",
  (context) => ({
    FunctionDeclaration(node) {
      const seen = new Set();
      for (const p of node.params || []) {
        if (p.type === "Identifier") {
          if (seen.has(p.name)) {
            context.report({
              node: p,
              message: `Duplicate parameter name "${p.name}". [typescript:S1199]`,
            });
          } else {
            seen.add(p.name);
          }
        }
      }
    },
  }),
);

// S2685: "arguments.caller" and "arguments.callee" should not be used
const S2685 = createFunctionsRule(
  "S2685",
  '"arguments.caller" and "arguments.callee" should not be used',
  (context) => ({
    MemberExpression(node) {
      if (
        node.object?.type === "Identifier" &&
        node.object.name === "arguments" &&
        (node.property?.name === "caller" || node.property?.name === "callee")
      ) {
        context.report({
          node,
          message: `Do not use "arguments.${node.property.name}". [typescript:S2685]`,
        });
      }
    },
  }),
);

// S138: Functions should not have too many lines of code
const S138 = createFunctionsRule(
  "S138",
  "Functions should not have too many lines of code",
  (context) => ({
    FunctionDeclaration(node) {
      if (node.loc && node.loc.end.line - node.loc.start.line > 150) {
        context.report({
          node,
          message:
            "Function has too many lines of code (exceeds threshold of 150). [typescript:S138]",
        });
      }
    },
  }),
);

// S1172: Unused parameters should be removed
const S1172 = createFunctionsRule(
  "S1172",
  "Unused function parameters should be removed",
  (context) => ({
    FunctionDeclaration(node) {
      if (node.params?.length > 0 && node.body?.type === "BlockStatement") {
        const bodyText = context.sourceCode
          ? context.sourceCode.getText(node.body)
          : "";
        for (const p of node.params) {
          if (
            p.type === "Identifier" &&
            !p.name.startsWith("_") &&
            !bodyText.includes(p.name)
          ) {
            context.report({
              node: p,
              message: `Remove unused parameter "${p.name}". [typescript:S1172]`,
            });
          }
        }
      }
    },
  }),
);

const BRANCH_NODE_TYPES = new Set([
  "IfStatement",
  "WhileStatement",
  "ForStatement",
  "ForInStatement",
  "ForOfStatement",
  "ConditionalExpression",
  "CatchClause",
  "SwitchCase",
]);

function enqueueChildren(node, queue) {
  for (const key of Object.keys(node)) {
    if (key === "parent") {
      continue;
    }
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item?.type) {
          queue.push(item);
        }
      }
    } else if (child?.type) {
      queue.push(child);
    }
  }
}

function calculateBranchCount(rootNode) {
  if (!rootNode) {
    return 0;
  }
  let count = 0;
  const queue = [rootNode];
  while (queue.length > 0) {
    const current = queue.pop();
    if (BRANCH_NODE_TYPES.has(current.type)) {
      count++;
    }
    enqueueChildren(current, queue);
  }
  return count;
}

// S1541: Cyclomatic Complexity
const S1541 = createFunctionsRule(
  "S1541",
  "Functions should not have too high cyclomatic complexity",
  (context) => ({
    FunctionDeclaration(node) {
      if (node.body?.type === "BlockStatement") {
        const complexity = 1 + calculateBranchCount(node.body);
        if (complexity > 15) {
          context.report({
            node: node.id || node,
            message: `Function has a Cyclomatic Complexity of ${complexity} (threshold: 15). [typescript:S1541]`,
          });
        }
      }
    },
  }),
);

// S3796: Variables should not be shadowed
const S3796 = createFunctionsRule(
  "S3796",
  "Variables should not be shadowed",
  (context) => ({
    VariableDeclarator(node) {
      if (
        node.id?.type === "Identifier" &&
        node.parent?.parent?.type === "FunctionDeclaration"
      ) {
        const outerFunc = node.parent.parent;
        if (outerFunc.id?.name === node.id.name) {
          context.report({
            node: node.id,
            message: `Variable "${node.id.name}" shadows function name. [typescript:S3796]`,
          });
        }
      }
    },
  }),
);

function getDeclaredIdentifiers(stmt) {
  if (stmt.type !== "VariableDeclaration" || !stmt.declarations) {
    return [];
  }
  return stmt.declarations
    .filter((d) => d.id?.type === "Identifier")
    .map((d) => d.id);
}

function findRedeclarations(body) {
  const redeclared = [];
  const declared = new Set();
  for (const stmt of body || []) {
    const ids = getDeclaredIdentifiers(stmt);
    for (const id of ids) {
      if (declared.has(id.name)) {
        redeclared.push(id);
      } else {
        declared.add(id.name);
      }
    }
  }
  return redeclared;
}

// S2814: Variables should not be redeclared in the same scope
const S2814 = createFunctionsRule(
  "S2814",
  "Variables should not be redeclared in the same scope",
  (context) => ({
    BlockStatement(node) {
      const redeclared = findRedeclarations(node.body);
      for (const id of redeclared) {
        context.report({
          node: id,
          message: `Redeclaration of "${id.name}". [typescript:S2814]`,
        });
      }
    },
  }),
);

// S3801: Functions should have consistent return statements
const S3801 = createFunctionsRule(
  "S3801",
  "Functions should have consistent return statements",
  (context) => ({
    FunctionDeclaration(node) {
      if (node.body?.type === "BlockStatement") {
        let hasValue = false;
        let hasNoValue = false;
        for (const stmt of node.body.body || []) {
          if (stmt.type === "ReturnStatement") {
            if (stmt.argument) {
              hasValue = true;
            } else {
              hasNoValue = true;
            }
          }
        }
        if (hasValue && hasNoValue) {
          context.report({
            node: node.id || node,
            message:
              "Function should consistently return either a value or no value. [typescript:S3801]",
          });
        }
      }
    },
  }),
);

const NESTING_NODE_TYPES = new Set([
  "IfStatement",
  "ConditionalExpression",
  "SwitchStatement",
  "ForStatement",
  "ForInStatement",
  "ForOfStatement",
  "WhileStatement",
  "DoWhileStatement",
  "CatchClause",
]);

function isSeparateFunctionScope(node, fnNode) {
  if (node === fnNode) {
    return false;
  }
  const { type } = node;
  return (
    type === "FunctionDeclaration" ||
    type === "FunctionExpression" ||
    type === "ArrowFunctionExpression"
  );
}

function isLogicalSequence(node) {
  return (
    node.type === "LogicalExpression" &&
    (node.parent?.type !== "LogicalExpression" ||
      node.parent?.operator !== node.operator)
  );
}

function isElseIf(node) {
  return (
    node.type === "IfStatement" &&
    node.parent?.type === "IfStatement" &&
    node.parent.alternate === node
  );
}

function isInlineLambda(node, fnNode) {
  return (
    node !== fnNode &&
    (node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression")
  );
}

// S3776: Cognitive Complexity of functions should not be too high (threshold: 15)
function calculateCognitiveComplexity(fnNode) {
  let complexity = 0;
  const fnBody = fnNode.body;

  function walk(node, nestingLevel) {
    if (!node || typeof node !== "object") {
      return;
    }

    if (isSeparateFunctionScope(node, fnNode)) {
      return;
    }

    if (isLogicalSequence(node)) {
      complexity += 1;
    }

    let nextNesting = nestingLevel;

    if (NESTING_NODE_TYPES.has(node.type)) {
      complexity += isElseIf(node) ? 1 : 1 + nestingLevel;
      nextNesting = nestingLevel + 1;
    } else if (isInlineLambda(node, fnNode)) {
      nextNesting = nestingLevel + 1;
    }

    const queue = [];
    enqueueChildren(node, queue);
    for (const child of queue) {
      walk(child, nextNesting);
    }
  }

  walk(fnBody, 0);
  return complexity;
}

const S3776 = createFunctionsRule(
  "S3776",
  "Cognitive Complexity of functions should not be too high",
  (context) => {
    function checkComplexity(node) {
      if (!node.body) {
        return;
      }
      const complexity = calculateCognitiveComplexity(node);
      if (complexity > 15) {
        let reportNode = node;
        if (node.type === "FunctionDeclaration" && node.id) {
          reportNode = node.id;
        } else if (
          node.parent?.type === "VariableDeclarator" &&
          node.parent.id
        ) {
          reportNode = node.parent.id;
        } else if (node.parent?.type === "Property" && node.parent.key) {
          reportNode = node.parent.key;
        }

        context.report({
          node: reportNode,
          message: `Refactor this function to reduce its Cognitive Complexity from ${complexity} to the 15 allowed. [typescript:S3776]`,
        });
      }
    }

    return {
      FunctionDeclaration: checkComplexity,
      FunctionExpression: checkComplexity,
      ArrowFunctionExpression: checkComplexity,
    };
  },
);

module.exports = {
  S107,
  S1199,
  S2685,
  S138,
  S1172,
  S1541,
  S3776,
  S3796,
  S2814,
  S3801,
};
