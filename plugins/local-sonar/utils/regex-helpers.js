"use strict";

const BACKSLASH = String.fromCharCode(92);

/**
 * Regex parsing and operator precedence helper utilities
 */

function handleChar(char, state) {
  if (state.isEscaped) {
    state.current += char;
    state.isEscaped = false;
    return;
  }
  if (char === BACKSLASH) {
    state.current += char;
    state.isEscaped = true;
    return;
  }
  if (char === "[" && !state.inCharClass) {
    state.inCharClass = true;
    state.current += char;
    return;
  }
  if (char === "]" && state.inCharClass) {
    state.inCharClass = false;
    state.current += char;
    return;
  }
  if (!state.inCharClass) {
    if (char === "(") {
      state.depth++;
    } else if (char === ")") {
      state.depth = Math.max(0, state.depth - 1);
    } else if (char === "|" && state.depth === 0) {
      state.alternatives.push(state.current);
      state.current = "";
      return;
    }
  }
  state.current += char;
}

function splitTopLevelAlternatives(pattern) {
  const state = {
    alternatives: [],
    current: "",
    depth: 0,
    inCharClass: false,
    isEscaped: false,
  };
  for (let i = 0; i < pattern.length; i++) {
    handleChar(pattern[i], state);
  }
  state.alternatives.push(state.current);
  return state.alternatives;
}

function checkAnchorPrecedence(pattern) {
  if (!pattern || typeof pattern !== "string") {
    return { isCompliant: true };
  }

  const branches = splitTopLevelAlternatives(pattern);
  if (branches.length < 2) {
    return { isCompliant: true };
  }

  // If top-level alternation has anchors (^ or $) outside explicit non-capturing groups
  const hasAnchors = branches.some((b) => b.includes("^") || b.includes("$"));
  if (hasAnchors) {
    const isFullyGrouped = branches.every(
      (b) => b.startsWith("(?:") && b.endsWith(")"),
    );

    if (!isFullyGrouped) {
      return {
        isCompliant: false,
        message:
          "Group parts of the regex together to make the intended operator precedence explicit. [typescript:S5850]",
      };
    }
  }

  return { isCompliant: true };
}

module.exports = {
  splitTopLevelAlternatives,
  checkAnchorPrecedence,
};
