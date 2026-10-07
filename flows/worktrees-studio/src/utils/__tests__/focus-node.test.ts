import { describe, expect, it } from "vitest";
import { resolveFocusNodeId } from "../focus-node";

describe("resolveFocusNodeId", () => {
  const ids = ["parent-home", "teacher-chat-room", "admin-class-detail"];

  it("resolves an existing node id", () => {
    expect(resolveFocusNodeId("teacher-chat-room", ids)).toBe(
      "teacher-chat-room",
    );
  });

  it("takes the first value when the param repeats", () => {
    expect(resolveFocusNodeId(["parent-home", "teacher-chat-room"], ids)).toBe(
      "parent-home",
    );
  });

  it("ignores unknown ids and empty params", () => {
    expect(resolveFocusNodeId("nope", ids)).toBeNull();
    expect(resolveFocusNodeId(undefined, ids)).toBeNull();
    expect(resolveFocusNodeId("", ids)).toBeNull();
  });
});
