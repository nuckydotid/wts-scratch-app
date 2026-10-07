import { describe, expect, test } from "bun:test";
import { isTestCaseId, testIds } from "./index";

describe("shared ids", () => {
  test("screen ids are prefixed", () => expect(testIds.screen("home")).toBe("screen-home"));
  test("test-case id format", () => {
    expect(isTestCaseId("TC-AUTH-001")).toBe(true);
    expect(isTestCaseId("login-test")).toBe(false);
  });
});
