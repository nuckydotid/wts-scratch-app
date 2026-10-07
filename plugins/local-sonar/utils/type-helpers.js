"use strict";

/**
 * Type-checker helpers for type-dependent Sonar rules.
 *
 * Rules using these helpers must no-op when parser services are unavailable
 * (`getTypeServices(context)` returns null), so they stay safe in configs
 * without `projectService`.
 */

let tsModule = null;

function getTypescript() {
  if (!tsModule) {
    tsModule = require("typescript");
  }
  return tsModule;
}

function getTypeServices(context) {
  const services = context.sourceCode?.parserServices;
  if (!services || !services.program || !services.esTreeNodeToTSNodeMap) {
    return null;
  }
  const checker = services.program.getTypeChecker();
  return {
    checker,
    services,
    toTsNode: (node) => services.esTreeNodeToTSNodeMap.get(node),
    toEsNode: (node) =>
      services.tsNodeToESTreeNodeMap
        ? services.tsNodeToESTreeNodeMap.get(node)
        : undefined,
  };
}

function callSignatures(checker, type) {
  const ts = getTypescript();
  if (!type) {
    return [];
  }
  if (type.isUnion && type.isUnion()) {
    return type.types.flatMap((unionType) =>
      checker.getSignaturesOfType(unionType, ts.SignatureKind.Call),
    );
  }
  return checker.getSignaturesOfType(type, ts.SignatureKind.Call);
}

function getReturnTypes(checker, type) {
  return callSignatures(checker, type).map((signature) =>
    signature.getReturnType(),
  );
}

function isVoidReturnType(type) {
  const ts = getTypescript();
  return Boolean(type.flags & (ts.TypeFlags.Void | ts.TypeFlags.Undefined));
}

function returnsVoid(checker, type) {
  return getReturnTypes(checker, type).some((returnType) =>
    isVoidReturnType(returnType),
  );
}

function isPromiseLikeType(type) {
  if (!type) {
    return false;
  }
  const symbol = type.getSymbol();
  const name = symbol ? symbol.getName() : "";
  if (name === "Promise" || name === "PromiseLike") {
    return true;
  }
  return (type.getProperties() || []).some(
    (property) => property.getName() === "then",
  );
}

function returnsPromise(checker, type) {
  return getReturnTypes(checker, type).some((returnType) =>
    isPromiseLikeType(returnType),
  );
}

module.exports = {
  getTypescript,
  getTypeServices,
  callSignatures,
  getReturnTypes,
  isVoidReturnType,
  returnsVoid,
  isPromiseLikeType,
  returnsPromise,
};
