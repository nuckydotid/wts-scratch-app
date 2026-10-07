import { describe, expect, it } from "vitest";
import { Position, type Edge, type Node } from "@xyflow/react";
import { NODE_HEIGHT, NODE_WIDTH, getLayoutedElements } from "../layout-tree";

type LabelData = Record<string, unknown> & { label: string };

function node(id: string): Node<LabelData> {
  return {
    id,
    type: "screenNode",
    position: { x: 0, y: 0 },
    data: { label: id },
  };
}

function edge(source: string, target: string): Edge {
  return { id: `e-${source}-${target}`, source, target };
}

describe("getLayoutedElements", () => {
  it("returns empty output for empty input", () => {
    expect(getLayoutedElements([], [])).toEqual({ nodes: [], edges: [] });
  });

  it("lays parent above child in TB mode with finite positions", () => {
    const { nodes, edges } = getLayoutedElements(
      [node("a"), node("b")],
      [edge("a", "b")],
      { direction: "TB" },
    );
    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const a = byId.get("a")!;
    const b = byId.get("b")!;
    for (const n of [a, b]) {
      expect(Number.isFinite(n.position.x)).toBe(true);
      expect(Number.isFinite(n.position.y)).toBe(true);
    }
    expect(a.position.y + NODE_HEIGHT).toBeLessThanOrEqual(b.position.y);
    expect(a.targetPosition).toBe(Position.Top);
    expect(a.sourcePosition).toBe(Position.Bottom);
  });

  it("lays parent left of child in LR mode", () => {
    const { nodes } = getLayoutedElements(
      [node("a"), node("b")],
      [edge("a", "b")],
    );
    const lr = getLayoutedElements([node("a"), node("b")], [edge("a", "b")], {
      direction: "LR",
    });
    expect(nodes).toHaveLength(2);
    const byId = new Map(lr.nodes.map((n) => [n.id, n]));
    const a = byId.get("a")!;
    const b = byId.get("b")!;
    expect(a.position.x + NODE_WIDTH).toBeLessThanOrEqual(b.position.x);
    expect(a.targetPosition).toBe(Position.Left);
    expect(a.sourcePosition).toBe(Position.Right);
  });

  it("preserves edge identity and annotates routed points", () => {
    const { edges } = getLayoutedElements(
      [node("a"), node("b")],
      [edge("a", "b")],
    );
    expect(edges[0].id).toBe("e-a-b");
    expect(edges[0].source).toBe("a");
    expect(edges[0].target).toBe("b");
    const data = edges[0].data as { points?: { x: number; y: number }[] };
    expect(data.points).toBeDefined();
    expect(data.points!.length).toBeGreaterThan(1);
  });
});
