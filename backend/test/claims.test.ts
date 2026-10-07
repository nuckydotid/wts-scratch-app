import { describe, expect, test } from "bun:test";
import { claimsBody, parseArgs } from "../scripts/set-claims.ts";

describe("set-claims", () => {
  test("parses and validates arguments", () => {
    expect(parseArgs(["--uid", "abc_123", "--role", "admin", "--project", "p1"])).toEqual({ uid: "abc_123", role: "admin", project: "p1" });
    expect(() => parseArgs(["--role", "admin"])).toThrow();
    expect(() => parseArgs(["--uid", "../x", "--role", "admin"])).toThrow();
    expect(() => parseArgs(["--uid", "u", "--role", "Admin!"])).toThrow();
  });
  test("customAttributes is a JSON string (Identity Toolkit contract)", () => {
    expect(claimsBody("u", "admin")).toEqual({ localId: "u", customAttributes: '{"role":"admin"}' });
  });
});
