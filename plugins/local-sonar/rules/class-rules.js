"use strict";

const { createAstWalker } = require("../utils/ast-walk");

/**
 * Class, accessor and constructor rules (Sonar way, TypeScript).
 */

function createClassRule(ruleKey, ruleName, createFn) {
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

function getAccessorName(node) {
  const key = node.key;
  if (!key) {
    return null;
  }
  if (key.type === "Identifier" || key.type === "PrivateIdentifier") {
    return key.name;
  }
  if (key.type === "Literal") {
    return String(key.value);
  }
  return null;
}

function isAccessorFunction(node) {
  return (
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  );
}

function isSelfMemberAccess(node, name) {
  if (!node || node.type !== "MemberExpression") {
    return false;
  }
  if (node.object.type !== "ThisExpression") {
    return false;
  }
  if (node.property.type === "Identifier") {
    return node.property.name === name;
  }
  if (node.property.type === "PrivateIdentifier") {
    return node.property.name === name;
  }
  if (
    node.computed &&
    node.property.type === "Literal" &&
    typeof node.property.value === "string"
  ) {
    return node.property.value === name;
  }
  return false;
}

function isBackingFieldAccess(node, name) {
  return (
    node.type === "MemberExpression" &&
    node.object.type === "ThisExpression" &&
    !node.computed &&
    node.property.type === "Identifier" &&
    (node.property.name === `_${name}` || node.property.name === `__${name}`)
  );
}

// S7725: Getters and setters should not recursively access the same property
const S7725 = createClassRule(
  "S7725",
  "Getters and setters should not recursively access the same property",
  (context, ruleKey) => {
    const walk = createAstWalker(context.sourceCode, {
      skipNestedFunctions: true,
    });

    function checkAccessor(node) {
      if (
        (node.kind !== "get" && node.kind !== "set") ||
        !isAccessorFunction(node.value)
      ) {
        return;
      }
      const name = getAccessorName(node);
      if (!name) {
        return;
      }
      walk(node.value.body, (child) => {
        if (isSelfMemberAccess(child, name)) {
          context.report({
            node: child,
            message: `Accessor "${name}" recursively accesses its own property. [typescript:${ruleKey}]`,
          });
          return true;
        }
        return false;
      });
    }

    return {
      MethodDefinition: checkAccessor,
      Property: checkAccessor,
    };
  },
);

// S4275: Getters and setters should access the expected fields
const S4275 = createClassRule(
  "S4275",
  "Getters and setters should access the expected fields",
  (context, ruleKey) => {
    const walk = createAstWalker(context.sourceCode, {
      skipNestedFunctions: true,
    });

    function referencesField(node, name) {
      let found = false;
      walk(node.value.body, (child) => {
        if (
          isSelfMemberAccess(child, name) ||
          isBackingFieldAccess(child, name) ||
          (child.type === "Identifier" &&
            (child.name === name || child.name === `_${name}`))
        ) {
          found = true;
          return true;
        }
        return false;
      });
      return found;
    }

    function checkAccessor(node) {
      if (
        (node.kind !== "get" && node.kind !== "set") ||
        !isAccessorFunction(node.value)
      ) {
        return;
      }
      const name = getAccessorName(node);
      if (!name) {
        return;
      }
      if (!referencesField(node, name)) {
        context.report({
          node: node.key,
          message: `Getter and setter should access the field "${name}". [typescript:${ruleKey}]`,
        });
      }
    }

    return {
      MethodDefinition: checkAccessor,
      Property: checkAccessor,
    };
  },
);

// S3854: "super()" should be invoked appropriately
const S3854 = createClassRule(
  "S3854",
  '"super()" should be invoked appropriately',
  (context, ruleKey) => {
    const walk = createAstWalker(context.sourceCode, {
      skipNestedFunctions: true,
    });

    function findSuperCalls(ctor) {
      const calls = [];
      walk(ctor.value.body, (node) => {
        if (node.type === "CallExpression" && node.callee.type === "Super") {
          calls.push(node);
        }
        return false;
      });
      return calls;
    }

    function findThisBeforeSuper(ctor, firstSuper) {
      let violation = null;
      walk(ctor.value.body, (node) => {
        if (
          node.type === "ThisExpression" &&
          (!firstSuper || node.range[0] < firstSuper.range[0])
        ) {
          violation = node;
          return true;
        }
        return false;
      });
      return violation;
    }

    function findConstructor(node) {
      for (const member of node.body.body) {
        if (
          member.type === "MethodDefinition" &&
          member.kind === "constructor"
        ) {
          return member;
        }
      }
      return null;
    }

    function checkDerivedConstructor(constructor, superCalls) {
      if (superCalls.length === 0) {
        context.report({
          node: constructor.key,
          message: `"super()" should be called in the constructor of a derived class. [typescript:${ruleKey}]`,
        });
        return;
      }
      for (const extraCall of superCalls.slice(1)) {
        context.report({
          node: extraCall,
          message: `"super()" should be called only once. [typescript:${ruleKey}]`,
        });
      }
      const earlyThis = findThisBeforeSuper(constructor, superCalls[0]);
      if (earlyThis) {
        context.report({
          node: earlyThis,
          message: `"super()" should be called before "this" is accessed. [typescript:${ruleKey}]`,
        });
      }
    }

    function checkClass(node) {
      const constructor = findConstructor(node);
      if (!constructor) {
        return;
      }
      const superCalls = findSuperCalls(constructor);
      if (!node.superClass) {
        if (superCalls.length > 0) {
          context.report({
            node: superCalls[0],
            message: `"super()" should not be called in a class without a superclass. [typescript:${ruleKey}]`,
          });
        }
        return;
      }
      checkDerivedConstructor(constructor, superCalls);
    }

    return {
      ClassDeclaration: checkClass,
      ClassExpression: checkClass,
    };
  },
);

module.exports = {
  S7725,
  S4275,
  S3854,
};
