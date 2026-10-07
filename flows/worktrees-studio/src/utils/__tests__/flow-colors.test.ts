import { describe, expect, it } from "vitest";
import {
  CATEGORY_HANDLE_COLOR,
  TRANSITION_STROKE_COLOR,
  HIGHLIGHT_STROKE_COLOR,
  DIMMED_STROKE_COLOR,
  MUTED_CANVAS_COLOR,
  categoryHandleColor,
  transitionStrokeColor,
} from "../flow-colors";

const HEX = /^#[0-9a-f]{6}$/;

describe("flow-colors", () => {
  it("covers every screen category with a valid hex handle color", () => {
    expect(Object.keys(CATEGORY_HANDLE_COLOR).sort()).toEqual([
      "admin",
      "e2e",
      "member",
      "public",
      "root",
      "staff",
    ]);
    for (const color of Object.values(CATEGORY_HANDLE_COLOR)) {
      expect(color).toMatch(HEX);
    }
  });

  it("covers every navigation transition kind", () => {
    expect(Object.keys(TRANSITION_STROKE_COLOR).sort()).toEqual([
      "bottom-sheet",
      "drawer",
      "fork",
      "full-sheet",
      "push",
      "redirect",
      "replace",
      "sheet",
      "tab",
      "teleport",
    ]);
  });

  it("falls back to root color for unknown categories", () => {
    expect(categoryHandleColor(undefined)).toBe(CATEGORY_HANDLE_COLOR.root);
    for (const [category, color] of Object.entries(CATEGORY_HANDLE_COLOR)) {
      expect(
        categoryHandleColor(category as keyof typeof CATEGORY_HANDLE_COLOR),
      ).toBe(color);
    }
  });

  it("falls back to redirect stroke for unknown transition kinds", () => {
    expect(transitionStrokeColor(undefined)).toBe(
      TRANSITION_STROKE_COLOR.redirect,
    );
    expect(transitionStrokeColor("nope")).toBe(
      TRANSITION_STROKE_COLOR.redirect,
    );
    expect(transitionStrokeColor("push")).toBe(TRANSITION_STROKE_COLOR.push);
  });

  it("exposes non-empty state/chrome colors", () => {
    for (const color of [
      HIGHLIGHT_STROKE_COLOR,
      DIMMED_STROKE_COLOR,
      MUTED_CANVAS_COLOR,
    ]) {
      expect(color.length).toBeGreaterThan(0);
    }
  });
});
