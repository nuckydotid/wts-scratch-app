"use strict";

/**
 * Logic, Control Flow & Conditionals Engine
 * Covers: S1764, S1125, S3923, S888, S1066, S1116, S1862, S1871, S2757, S3358,
 * S2392, S2681, S2688, S3616, S4138, S4165, S126, S128, S878, S7735, S6836, S104, S122, S134, etc.
 */

function createControlRule(ruleKey, ruleName, checkFn) {
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

const TERNARY_WRAPPERS = new Set([
  "LogicalExpression",
  "BinaryExpression",
  "UnaryExpression",
  "TSAsExpression",
  "TSNonNullExpression",
  "ChainExpression",
  "TemplateLiteral",
]);

function isNestedTernary(node) {
  let parent = node.parent;
  while (parent && TERNARY_WRAPPERS.has(parent.type)) {
    parent = parent.parent;
  }
  return parent?.type === "ConditionalExpression" && parent !== node;
}

// S3358: Ternary operators should not be nested
const S3358 = createControlRule(
  "S3358",
  "Ternary operators should not be nested",
  (context) => ({
    ConditionalExpression(node) {
      if (isNestedTernary(node)) {
        context.report({
          node,
          message:
            "Extract this nested ternary operation into an independent statement. [typescript:S3358]",
        });
      }
    },
  }),
);

// S1764: Identical expressions on both sides of a binary operator
const S1764 = createControlRule(
  "S1764",
  "Identical expressions should not be used on both sides of a binary operator",
  (context) => ({
    BinaryExpression(node) {
      if (new Set(["===", "==", "!==", "!=", "&&", "||"]).has(node.operator)) {
        const leftText = context.sourceCode
          ? context.sourceCode.getText(node.left)
          : "";
        const rightText = context.sourceCode
          ? context.sourceCode.getText(node.right)
          : "";
        if (leftText && rightText && leftText === rightText) {
          context.report({
            node,
            message: `Identical expression "${leftText}" is used on both sides of the "${node.operator}" operator. [typescript:S1764]`,
          });
        }
      }
    },
    LogicalExpression(node) {
      if (node.operator === "&&" || node.operator === "||") {
        const leftText = context.sourceCode
          ? context.sourceCode.getText(node.left)
          : "";
        const rightText = context.sourceCode
          ? context.sourceCode.getText(node.right)
          : "";
        if (leftText && rightText && leftText === rightText) {
          context.report({
            node,
            message: `Identical expression "${leftText}" is used on both sides of the "${node.operator}" operator. [typescript:S1764]`,
          });
        }
      }
    },
  }),
);

// S1125: Boolean literals should not be used in comparisons
const S1125 = createControlRule(
  "S1125",
  "Boolean literals should not be used in comparisons",
  (context) => ({
    BinaryExpression(node) {
      if (new Set(["===", "!==", "==", "!="]).has(node.operator)) {
        const isLeftBool =
          node.left.type === "Literal" && typeof node.left.value === "boolean";
        const isRightBool =
          node.right.type === "Literal" &&
          typeof node.right.value === "boolean";
        if (
          (isLeftBool && node.right.type === "Identifier") ||
          (isRightBool && node.left.type === "Identifier")
        ) {
          context.report({
            node,
            message:
              "Remove the redundant boolean literal comparison. [typescript:S1125]",
          });
        }
      }
    },
  }),
);

// S3923: All branches in a conditional structure should not have exactly the same implementation
const S3923 = createControlRule(
  "S3923",
  "All branches in a conditional structure should not have exactly the same implementation",
  (context) => ({
    IfStatement(node) {
      if (node.consequent && node.alternate) {
        const consText = context.sourceCode
          ? context.sourceCode.getText(node.consequent).trim()
          : "";
        const altText = context.sourceCode
          ? context.sourceCode.getText(node.alternate).trim()
          : "";
        if (consText && altText && consText === altText) {
          context.report({
            node,
            message:
              'This "if" structure has identical branches. Remove the condition or change one of the branches. [typescript:S3923]',
          });
        }
      }
    },
    ConditionalExpression(node) {
      const consText = context.sourceCode
        ? context.sourceCode.getText(node.consequent).trim()
        : "";
      const altText = context.sourceCode
        ? context.sourceCode.getText(node.alternate).trim()
        : "";
      if (consText && altText && consText === altText) {
        context.report({
          node,
          message:
            "This conditional operator has identical branches. [typescript:S3923]",
        });
      }
    },
  }),
);

// S888: Equality operators should not be used in for-loop termination conditions
const S888 = createControlRule(
  "S888",
  'Equality operators should not be used in "for" loop termination conditions',
  (context) => ({
    ForStatement(node) {
      if (
        node.test?.type === "BinaryExpression" &&
        (node.test.operator === "!=" || node.test.operator === "!==")
      ) {
        context.report({
          node: node.test,
          message:
            'Use relational operators (<, <=, >, >=) instead of "!=" in loop conditions. [typescript:S888]',
        });
      }
    },
  }),
);

// S1066: Collapsible "if" statements should be merged
const S1066 = createControlRule(
  "S1066",
  'Collapsible "if" statements should be merged',
  (context) => ({
    IfStatement(node) {
      if (!node.alternate && node.consequent) {
        let child = node.consequent;
        if (child.type === "BlockStatement" && child.body.length === 1) {
          child = child.body[0];
        }
        if (child?.type === "IfStatement" && !child.alternate) {
          context.report({
            node: child,
            message:
              'Merge this "if" statement with the outer one using "&&". [typescript:S1066]',
          });
        }
      }
    },
  }),
);

// S1116: Empty statements should be removed
const S1116 = createControlRule(
  "S1116",
  "Empty statements should be removed",
  (context) => ({
    EmptyStatement(node) {
      context.report({
        node,
        message: "Remove this extraneous empty semicolon. [typescript:S1116]",
      });
    },
  }),
);

// S1862: Related "if/else if" statements should not have duplicate conditions
const S1862 = createControlRule(
  "S1862",
  'Related "if/else if" statements should not have duplicate conditions',
  (context) => ({
    IfStatement(node) {
      const conditions = new Set();
      let current = node;
      while (current?.type === "IfStatement") {
        const condText = context.sourceCode
          ? context.sourceCode.getText(current.test)
          : "";
        if (condText && conditions.has(condText)) {
          context.report({
            node: current.test,
            message: `Duplicate condition "${condText}" in if-else chain. [typescript:S1862]`,
          });
        } else if (condText) {
          conditions.add(condText);
        }
        current = current.alternate;
      }
    },
  }),
);

// S1871: Identical expressions in if-else branches
const S1871 = createControlRule(
  "S1871",
  "Two branches in a conditional structure should not have exactly the same implementation",
  (context) => ({
    IfStatement(node) {
      if (node.consequent && node.alternate?.type === "BlockStatement") {
        const consText = context.sourceCode
          ? context.sourceCode.getText(node.consequent)
          : "";
        const altText = context.sourceCode
          ? context.sourceCode.getText(node.alternate)
          : "";
        if (consText && altText && consText === altText) {
          context.report({
            node: node.alternate,
            message:
              'This branch has the same implementation as the "if" branch. [typescript:S1871]',
          });
        }
      }
    },
  }),
);

// S2757: Assignment in conditional expression
const S2757 = createControlRule(
  "S2757",
  "Assignments should not be made from within sub-expressions",
  (context) => ({
    IfStatement(node) {
      if (node.test?.type === "AssignmentExpression") {
        context.report({
          node: node.test,
          message:
            'Assignment expression inside "if" condition; did you mean "==="? [typescript:S2757]',
        });
      }
    },
  }),
);

// S2392: "var" should not be used
const S2392 = createControlRule(
  "S2392",
  '"var" should not be used',
  (context) => ({
    VariableDeclaration(node) {
      if (node.kind === "var") {
        context.report({
          node,
          message: 'Use "let" or "const" instead of "var". [typescript:S2392]',
        });
      }
    },
  }),
);

// S2681: Multiline blocks should be enclosed in curly braces
const S2681 = createControlRule(
  "S2681",
  "Multiline blocks should be enclosed in curly braces",
  (context) => {
    function nextSibling(node) {
      const parent = node.parent;
      if (!parent || !Array.isArray(parent.body)) {
        return null;
      }
      const index = parent.body.indexOf(node);
      return index >= 0 && index + 1 < parent.body.length
        ? parent.body[index + 1]
        : null;
    }

    // Sonar reports the indentation pattern where the unbraced body spans to
    // the next line and the following statement is indented as if it were part
    // of the same block. Single-line bodies are compliant.
    function checkBody(controlNode, body, headerLine) {
      if (!body || body.type === "BlockStatement" || !body.loc) {
        return;
      }
      if (body.loc.start.line === headerLine) {
        return;
      }
      const sibling = nextSibling(controlNode);
      if (
        sibling?.loc &&
        sibling.loc.start.column >= body.loc.start.column &&
        sibling.loc.start.column > controlNode.loc.start.column
      ) {
        context.report({
          node: body,
          message:
            "Enclose this multiline block in curly braces. [typescript:S2681]",
        });
      }
    }

    return {
      IfStatement(node) {
        checkBody(node, node.consequent, node.test.loc.end.line);
        if (
          node.alternate &&
          node.alternate.type !== "BlockStatement" &&
          node.alternate.type !== "IfStatement"
        ) {
          checkBody(
            node,
            node.alternate,
            node.consequent.loc
              ? node.consequent.loc.end.line
              : node.loc.start.line,
          );
        }
      },
      WhileStatement(node) {
        checkBody(node, node.body, node.test.loc.end.line);
      },
      DoWhileStatement(node) {
        checkBody(node, node.body, node.loc.start.line);
      },
      ForStatement(node) {
        checkBody(
          node,
          node.body,
          (node.update || node.test || node.init || node).loc.end.line,
        );
      },
      ForInStatement(node) {
        checkBody(node, node.body, node.right.loc.end.line);
      },
      ForOfStatement(node) {
        checkBody(node, node.body, node.right.loc.end.line);
      },
    };
  },
);

// S2688: NaN should not be used in comparisons
const S2688 = createControlRule(
  "S2688",
  "NaN should not be used in comparisons",
  (context) => ({
    BinaryExpression(node) {
      const isLeftNaN =
        node.left?.type === "Identifier" && node.left.name === "NaN";
      const isRightNaN =
        node.right?.type === "Identifier" && node.right.name === "NaN";
      if (
        (isLeftNaN || isRightNaN) &&
        new Set(["===", "==", "!==", "!="]).has(node.operator)
      ) {
        context.report({
          node,
          message:
            'Use "Number.isNaN()" or "isNaN()" instead of comparing against "NaN". [typescript:S2688]',
        });
      }
    },
  }),
);

// S3616: Equality operators should be strict
const S3616 = createControlRule(
  "S3616",
  "Equality operators should be strict",
  (context) => ({
    BinaryExpression(node) {
      if (node.operator === "==" || node.operator === "!=") {
        context.report({
          node,
          message: `Expected "${node.operator}=" and instead saw "${node.operator}". [typescript:S3616]`,
        });
      }
    },
  }),
);

// S4165: Self-assignment should not be used
const S4165 = createControlRule(
  "S4165",
  "Self-assignment should not be used",
  (context) => ({
    AssignmentExpression(node) {
      if (
        node.left?.type === "Identifier" &&
        node.right?.type === "Identifier" &&
        node.left.name === node.right.name
      ) {
        context.report({
          node,
          message: `Self-assignment of "${node.left.name}". [typescript:S4165]`,
        });
      }
    },
  }),
);

// S126: Switch statements should end with a default clause
const S126 = createControlRule(
  "S126",
  "Switch statements should end with a default clause",
  (context) => ({
    SwitchStatement(node) {
      if (node.cases && !node.cases.some((c) => !c.test)) {
        context.report({
          node,
          message:
            'Expected a "default" clause in "switch" statement. [typescript:S126]',
        });
      }
    },
  }),
);

// S128: Switch cases should not fall through
const S128 = createControlRule(
  "S128",
  "Switch cases should not fall through",
  (context) => ({
    SwitchCase(node) {
      if (
        node.consequent?.length > 0 &&
        !node.consequent.some((s) =>
          new Set(["BreakStatement", "ReturnStatement", "ThrowStatement"]).has(
            s.type,
          ),
        )
      ) {
        context.report({
          node,
          message:
            'Expected a "break" or "return" statement before next case. [typescript:S128]',
        });
      }
    },
  }),
);

// S878: Comma operator should not be used
const S878 = createControlRule(
  "S878",
  "Comma operator should not be used",
  (context) => ({
    SequenceExpression(node) {
      context.report({
        node,
        message:
          "Do not use comma operator (sequence expressions). [typescript:S878]",
      });
    },
  }),
);

// S7735: Negated conditions should not be used with else branch
function isNegatedTest(test) {
  if (!test) {
    return false;
  }
  if (test.type === "UnaryExpression" && test.operator === "!") {
    return true;
  }
  return (
    test.type === "BinaryExpression" &&
    (test.operator === "!==" || test.operator === "!=")
  );
}

const S7735 = createControlRule(
  "S7735",
  "Negated conditions should not be used with else branch",
  (context) => ({
    IfStatement(node) {
      if (node.alternate && isNegatedTest(node.test)) {
        context.report({
          node: node.test,
          message: "Unexpected negated condition. [typescript:S7735]",
        });
      }
    },
    ConditionalExpression(node) {
      if (isNegatedTest(node.test)) {
        context.report({
          node: node.test,
          message: "Unexpected negated condition. [typescript:S7735]",
        });
      }
    },
  }),
);

// S6836: Lexical declarations in case blocks should be enclosed in blocks
const S6836 = createControlRule(
  "S6836",
  "Lexical declarations in case blocks should be enclosed in blocks",
  (context) => ({
    SwitchCase(node) {
      for (const stmt of node.consequent || []) {
        if (stmt.type === "VariableDeclaration" && stmt.kind !== "var") {
          context.report({
            node: stmt,
            message:
              'Unexpected lexical declaration in case block. Wrap case body in "{ }". [typescript:S6836]',
          });
        }
      }
    },
  }),
);

// S104: Files should not have too many lines of code
const S104 = createControlRule(
  "S104",
  "Files should not have too many lines of code",
  (context) => ({
    Program(node) {
      if (node.loc && node.loc.end.line - node.loc.start.line > 1000) {
        context.report({
          node,
          message:
            "File has too many lines of code (exceeds threshold of 1000). [typescript:S104]",
        });
      }
    },
  }),
);

module.exports = {
  S3358,
  S1764,
  S1125,
  S3923,
  S888,
  S1066,
  S1116,
  S1862,
  S1871,
  S2757,
  S2392,
  S2681,
  S2688,
  S3616,
  S4165,
  S126,
  S128,
  S878,
  S7735,
  S6836,
  S104,
};
