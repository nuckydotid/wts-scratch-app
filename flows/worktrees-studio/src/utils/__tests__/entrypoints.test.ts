import { describe, expect, it } from "vitest";
import type { NavigationEdgeData } from "../../data/screens-tree-data";
import { getEntryPaths } from "../entrypoints";

function edge(
  source: string,
  target: string,
  overrides: Partial<NavigationEdgeData> = {},
): NavigationEdgeData {
  return {
    id: `nav-${source}-${target}`,
    source,
    target,
    transitionType: "push",
    category: "member",
    ...overrides,
  };
}

describe("getEntryPaths", () => {
  it("returns the target itself when it has no incoming edges", () => {
    const { paths, truncated } = getEntryPaths("root", []);
    expect(truncated).toBe(false);
    expect(paths).toEqual([
      { nodeIds: ["root"], edgeIds: [], lastEdge: undefined },
    ]);
  });

  it("walks a straight chain back to its single root", () => {
    const edges = [edge("a", "b"), edge("b", "c")];
    const { paths } = getEntryPaths("c", edges);
    expect(paths).toHaveLength(1);
    expect(paths[0].nodeIds).toEqual(["a", "b", "c"]);
    expect(paths[0].edgeIds).toEqual(["nav-a-b", "nav-b-c"]);
    expect(paths[0].lastEdge?.id).toBe("nav-b-c");
  });

  it("enumerates branch roots shortest-first and deterministically", () => {
    const edges = [
      edge("root-a", "x"),
      edge("root-b", "x"),
      edge("x", "target"),
      edge("root-a", "target"),
    ];
    const { paths } = getEntryPaths("target", edges);
    expect(paths.map((p) => p.nodeIds)).toEqual([
      ["root-a", "target"],
      ["root-a", "x", "target"],
      ["root-b", "x", "target"],
    ]);
  });

  it("excludes auxiliary edges by default and includes them on request", () => {
    const edges = [
      edge("root", "x"),
      edge("root", "target"),
      edge("x", "target", { isAuxiliary: true }),
    ];
    expect(getEntryPaths("target", edges).paths.map((p) => p.nodeIds)).toEqual([
      ["root", "target"],
    ]);
    const withAux = getEntryPaths("target", edges, {
      includeAuxiliary: true,
    });
    expect(withAux.paths.map((p) => p.nodeIds)).toEqual([
      ["root", "target"],
      ["root", "x", "target"],
    ]);
  });

  it("returns no entry paths when every node sits inside a cycle", () => {
    const edges = [edge("a", "b"), edge("b", "a"), edge("a", "target")];
    const { paths } = getEntryPaths("target", edges);
    expect(paths).toEqual([]);
  });

  it("truncates when more paths exist than maxPaths", () => {
    const edges = [
      edge("r1", "x"),
      edge("r2", "x"),
      edge("r3", "x"),
      edge("x", "target"),
    ];
    const { paths, truncated } = getEntryPaths("target", edges, {
      maxPaths: 2,
    });
    expect(truncated).toBe(true);
    expect(paths).toHaveLength(2);
    expect(paths.every((p) => p.nodeIds.at(-1) === "target")).toBe(true);
  });

  it("is not truncated when the path count equals maxPaths", () => {
    const edges = [edge("r1", "target"), edge("r2", "target")];
    const { paths, truncated } = getEntryPaths("target", edges, {
      maxPaths: 2,
    });
    expect(truncated).toBe(false);
    expect(paths).toHaveLength(2);
  });
});
