import { describe, expect, it } from "vitest";
import { inspectPackageVersions } from "../check-dependency-versions";

describe("inspectPackageVersions", () => {
  it("flags a dependency using different specs across workspaces", () => {
    const violations = inspectPackageVersions([
      {
        path: "apps/a/package.json",
        json: { dependencies: { react: "19.2.3" } },
      },
      {
        path: "packages/b/package.json",
        json: { dependencies: { react: "^19.2.2" } },
      },
    ]);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.name).toBe("react");
    expect(new Set(violations[0]?.specs.map((entry) => entry.spec))).toEqual(
      new Set(["19.2.3", "^19.2.2"]),
    );
  });

  it("accepts a single spec shared by many workspaces", () => {
    const violations = inspectPackageVersions([
      {
        path: "apps/a/package.json",
        json: { dependencies: { expo: "~57.0.17" } },
      },
      {
        path: "packages/b/package.json",
        json: { dependencies: { expo: "~57.0.17" } },
      },
      {
        path: "flows/c/package.json",
        json: { devDependencies: { expo: "~57.0.17" } },
      },
    ]);
    expect(violations).toEqual([]);
  });

  it("ignores workspace protocols, wildcards and non-string specs", () => {
    const violations = inspectPackageVersions([
      {
        path: "packages/ds/package.json",
        json: {
          dependencies: {
            "@repo/shared": "workspace:*",
            "worktrees-studio-mmkv": "file:../worktrees-studio-mmkv",
            uniwind: "catalog:",
          },
        },
      },
      {
        path: "modules/mmkv/package.json",
        json: { peerDependencies: { expo: "*", react: "*" } },
      },
    ]);
    expect(violations).toEqual([]);
  });

  it("compares specs across dependency sections", () => {
    const violations = inspectPackageVersions([
      {
        path: "apps/a/package.json",
        json: { dependencies: { jest: "29.7.0" } },
      },
      {
        path: "packages/b/package.json",
        json: { devDependencies: { jest: "29.6.0" } },
      },
    ]);
    expect(violations.map((entry) => entry.name)).toEqual(["jest"]);
  });
});
