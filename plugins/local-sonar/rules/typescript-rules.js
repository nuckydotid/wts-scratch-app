"use strict";

const { createAstWalker } = require("../utils/ast-walk");
const { getTypeServices, getTypescript } = require("../utils/type-helpers");

/**
 * TypeScript Typing & Generics Engine
 * Covers: S4782, S6759, S4323, S4324, S4325, S6564, S6569, S6571, S4621, S2966, S4328, etc.
 */

function createTypeScriptRule(ruleKey, ruleName, checkFn) {
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

// S4782: Redundant optional property declaration with undefined union
const S4782 = createTypeScriptRule(
  "S4782",
  "Optional properties should not use 'undefined' in their type declaration",
  (context) => ({
    TSPropertySignature(node) {
      if (node.optional && node.typeAnnotation?.typeAnnotation) {
        const typeNode = node.typeAnnotation.typeAnnotation;
        if (typeNode.type === "TSUnionType" && typeNode.types) {
          const hasUndefined = typeNode.types.some(
            (t) => t.type === "TSUndefinedKeyword",
          );
          if (hasUndefined) {
            context.report({
              node: node.key,
              message:
                "Consider removing 'undefined' type or '?' specifier, one of them is redundant. [typescript:S4782]",
            });
          }
        }
      }
    },
  }),
);

// S6759: React props should be read-only
const S6759 = createTypeScriptRule(
  "S6759",
  "React props should be read-only",
  (context, ruleKey) => {
    const services = getTypeServices(context);
    if (!services) {
      // Type-aware rule: no-op without projectService (see eslint.config.js).
      return {};
    }
    const ts = getTypescript();
    const { checker, toTsNode } = services;

    function isReadonlyWrapper(annotation) {
      return (
        annotation &&
        annotation.type === "TSTypeReference" &&
        annotation.typeName &&
        annotation.typeName.type === "Identifier" &&
        annotation.typeName.name === "Readonly"
      );
    }

    function returnsJsx(fnNode) {
      const body = fnNode.body;
      if (!body) {
        return false;
      }
      if (body.type === "JSXElement" || body.type === "JSXFragment") {
        return true;
      }
      if (body.type !== "BlockStatement") {
        return false;
      }
      let found = false;
      const walk = createAstWalker(context.sourceCode, {
        skipNestedFunctions: true,
      });
      walk(body, (child) => {
        if (
          child.type === "ReturnStatement" &&
          child.argument &&
          (child.argument.type === "JSXElement" ||
            child.argument.type === "JSXFragment")
        ) {
          found = true;
          return true;
        }
        return false;
      });
      return found;
    }

    function hasMutableMembers(members) {
      if (!members) {
        return false;
      }
      return members.some((member) => {
        if (member.kind !== ts.SyntaxKind.PropertySignature) {
          return false;
        }
        const modifiers = member.modifiers || [];
        return !modifiers.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ReadonlyKeyword,
        );
      });
    }

    function getReferencedMembers(annotation) {
      const symbol = checker.getSymbolAtLocation(toTsNode(annotation.typeName));
      const declarations = (symbol && symbol.getDeclarations()) || [];
      // Third-party prop types cannot be changed here and are not reported.
      const local = declarations.find(
        (declaration) =>
          !declaration.getSourceFile().fileName.includes("node_modules"),
      );
      if (!local) {
        return null;
      }
      if (local.kind === ts.SyntaxKind.InterfaceDeclaration) {
        return local.members;
      }
      if (
        local.kind === ts.SyntaxKind.TypeAliasDeclaration &&
        local.type &&
        local.type.kind === ts.SyntaxKind.TypeLiteral
      ) {
        return local.type.members;
      }
      return null;
    }

    function getLocalPropsMembers(annotation) {
      if (!annotation) {
        return null;
      }
      if (isReadonlyWrapper(annotation)) {
        return [];
      }
      if (annotation.type === "TSTypeLiteral") {
        return annotation.members;
      }
      if (annotation.type === "TSIntersectionType") {
        return annotation.types.flatMap(
          (member) => getLocalPropsMembers(member) || [],
        );
      }
      if (annotation.type === "TSTypeReference" && annotation.typeName) {
        return getReferencedMembers(annotation);
      }
      return null;
    }

    function reportParam(param) {
      context.report({
        node: param,
        message:
          "Mark the props of the component as read-only. [typescript:" +
          ruleKey +
          "]",
      });
    }

    function checkFunction(fnNode) {
      const firstParam = fnNode.params && fnNode.params[0];
      if (!firstParam || !returnsJsx(fnNode)) {
        return;
      }
      const target =
        firstParam.type === "AssignmentPattern" ? firstParam.left : firstParam;
      const annotation =
        target.typeAnnotation && target.typeAnnotation.typeAnnotation;
      if (!annotation || isReadonlyWrapper(annotation)) {
        return;
      }
      const members = getLocalPropsMembers(annotation);
      if (hasMutableMembers(members)) {
        reportParam(firstParam);
      }
    }

    return {
      // Sonar resolves function declarations as components; arrow/function
      // expressions are not reported by the server rule, so we mirror that.
      FunctionDeclaration: checkFunction,
      ClassDeclaration(node) {
        const superClass = node.superClass;
        if (
          !superClass ||
          !superClass.typeArguments ||
          superClass.typeArguments.params.length === 0
        ) {
          return;
        }
        const typeArgument = superClass.typeArguments.params[0];
        if (isReadonlyWrapper(typeArgument)) {
          return;
        }
        const members = getLocalPropsMembers(typeArgument);
        if (hasMutableMembers(members)) {
          context.report({
            node: typeArgument,
            message:
              "Mark the props of the component as read-only. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

// S4325: Redundant casts and non-null assertions should be avoided
const S4325 = createTypeScriptRule(
  "S4325",
  "Redundant casts and non-null assertions should be avoided",
  (context, ruleKey) => {
    const services = getTypeServices(context);
    if (!services) {
      // Type-aware rule: no-op without projectService (see eslint.config.js).
      return {};
    }
    const { checker, toTsNode } = services;
    const ts = getTypescript();

    function report(node) {
      context.report({
        node,
        message: `This assertion is unnecessary since it does not change the type of the expression. [typescript:${ruleKey}]`,
      });
    }

    function isNullableType(type) {
      if (type.isUnion && type.isUnion()) {
        return type.types.some(
          (unionType) =>
            (unionType.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) !==
              0 || (unionType.flags & ts.TypeFlags.Any) !== 0,
        );
      }
      return (type.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) !== 0;
    }

    return {
      TSAsExpression(node) {
        if (
          node.typeAnnotation.type === "TSTypeReference" &&
          node.typeAnnotation.typeName?.type === "Identifier" &&
          node.typeAnnotation.typeName.name === "const"
        ) {
          return;
        }
        const expressionType = checker.getTypeAtLocation(
          toTsNode(node.expression),
        );
        const castType = checker.getTypeFromTypeNode(
          toTsNode(node.typeAnnotation),
        );
        const expressionIsAny = (expressionType.flags & ts.TypeFlags.Any) !== 0;
        const castIsAny = (castType.flags & ts.TypeFlags.Any) !== 0;
        if (castIsAny) {
          if (expressionIsAny) {
            report(node);
          }
          return;
        }
        if (
          (castType.flags & (ts.TypeFlags.Unknown | ts.TypeFlags.Never)) !==
            0 ||
          (expressionType.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !==
            0
        ) {
          return;
        }
        const unchanged =
          checker.isTypeAssignableTo(expressionType, castType) &&
          checker.isTypeAssignableTo(castType, expressionType);
        if (!unchanged) {
          return;
        }
        const sameText =
          checker.typeToString(expressionType) ===
          checker.typeToString(castType);
        if (sameText || node.expression.type === "TemplateLiteral") {
          report(node);
        }
      },
      TSNonNullExpression(node) {
        const expressionType = checker.getTypeAtLocation(
          toTsNode(node.expression),
        );
        if (
          (expressionType.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !==
          0
        ) {
          return;
        }
        if (!isNullableType(expressionType)) {
          report(node);
        }
      },
    };
  },
);

// S4323: Type aliases should be used
const S4323 = createTypeScriptRule(
  "S4323",
  "Type aliases should be used",
  (context, ruleKey) => {
    const unions = new Map();
    return {
      TSUnionType(node) {
        if (node.parent?.type !== "TSTypeParameterInstantiation") {
          return;
        }
        if ((node.types?.length || 0) < 3) {
          return;
        }
        const text = context.sourceCode.getText(node);
        const entry = unions.get(text);
        if (entry) {
          entry.count += 1;
        } else {
          unions.set(text, { count: 1, node });
        }
      },
      "Program:exit"() {
        for (const entry of unions.values()) {
          if (entry.count < 3) {
            continue;
          }
          context.report({
            node: entry.node,
            message:
              "Replace this union type with a type alias. [typescript:" +
              ruleKey +
              "]",
          });
        }
      },
    };
  },
);

// S4621: Duplicate constituents in union / intersection types
const S4621 = createTypeScriptRule(
  "S4621",
  "Union and intersection types should not include duplicated constituents",
  (context) => ({
    TSUnionType(node) {
      const seen = new Set();
      for (const t of node.types || []) {
        const raw = context.sourceCode ? context.sourceCode.getText(t) : "";
        if (raw) {
          if (seen.has(raw)) {
            context.report({
              node: t,
              message: `Duplicated constituent "${raw}" in union type should be removed. [typescript:S4621]`,
            });
          } else {
            seen.add(raw);
          }
        }
      }
    },
  }),
);

// S6564: Redundant type aliases
const S6564 = createTypeScriptRule(
  "S6564",
  "Redundant type aliases should not be used",
  (context) => ({
    TSTypeAliasDeclaration(node) {
      if (
        node.typeAnnotation?.type === "TSTypeReference" &&
        node.typeAnnotation.typeName?.type === "Identifier" &&
        node.id?.name === node.typeAnnotation.typeName.name
      ) {
        context.report({
          node,
          message:
            "Redundant self-referencing type alias should be removed. [typescript:S6564]",
        });
      }
    },
  }),
);

// S2966: Non-null assertion operator should not be overused
const S2966 = createTypeScriptRule(
  "S2966",
  'Non-null assertion operator "!" should not be used on already checked variables',
  (context) => ({
    TSNonNullExpression(node) {
      if (
        node.expression?.type === "Identifier" &&
        node.parent?.type === "TSNonNullExpression"
      ) {
        context.report({
          node,
          message:
            'Redundant non-null assertion "!!" should be simplified. [typescript:S2966]',
        });
      }
    },
  }),
);

// S4328: Redundant 'as const' assertions
const S4328 = createTypeScriptRule(
  "S4328",
  'Redundant "as const" assertions should not be used on primitive literals',
  (context) => ({
    TSTypeAssertion(node) {
      if (
        node.typeAnnotation?.typeAnnotation?.type === "TSTypeReference" &&
        node.typeAnnotation.typeAnnotation.typeName?.name === "const" &&
        node.expression?.type === "Literal"
      ) {
        context.report({
          node,
          message:
            'Redundant "as const" on simple literal value. [typescript:S4328]',
        });
      }
    },
  }),
);

// S4335: Type intersections should use meaningful types
const S4335 = createTypeScriptRule(
  "S4335",
  "Type intersections should use meaningful types",
  (context) => ({
    TSIntersectionType(node) {
      for (const member of node.types || []) {
        const isMeaningless =
          member.type === "TSAnyKeyword" ||
          member.type === "TSUnknownKeyword" ||
          member.type === "TSObjectKeyword" ||
          (member.type === "TSTypeLiteral" &&
            (member.members || []).length === 0);
        if (isMeaningless) {
          context.report({
            node: member,
            message:
              "Remove meaningless types from this intersection; they add no type safety. [typescript:S4335]",
          });
        }
      }
    },
  }),
);

module.exports = {
  S4782,
  S6759,
  S4325,
  S4323,
  S4621,
  S6564,
  S2966,
  S4328,
  S4335,
};
