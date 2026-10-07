import { graphlib, layout } from "@dagrejs/dagre";
import { Position, type Node, type Edge } from "@xyflow/react";
import type { ScreenNodeData } from "../data/screens-tree-data";

export const NODE_WIDTH = 280;
export const NODE_HEIGHT = 130;

interface LayoutOptions {
  direction?: "TB" | "LR";
  ranksep?: number;
  nodesep?: number;
  edgesep?: number;
  marginx?: number;
  marginy?: number;
}

export function getLayoutedElements<
  T extends Record<string, unknown> = ScreenNodeData,
>(
  nodes: Node<T>[],
  edges: Edge[],
  options: LayoutOptions = {},
): { nodes: Node<T>[]; edges: Edge[] } {
  const isHorizontal = options.direction === "LR";
  const {
    direction = "TB",
    ranksep = isHorizontal ? 540 : 440,
    nodesep = isHorizontal ? 260 : 340,
    edgesep = 120,
    marginx = 160,
    marginy = 160,
  } = options;

  const dagreGraph = new graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep,
    nodesep,
    edgesep,
    marginx,
    marginy,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  layout(dagreGraph);

  const targetPosition = isHorizontal ? Position.Left : Position.Top;
  const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      targetPosition,
      sourcePosition,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  const layoutedEdges = edges.map((edge) => {
    const dagreEdge = dagreGraph.edge(edge.source, edge.target);
    const points = dagreEdge?.points;

    return {
      ...edge,
      data: {
        ...(edge.data && typeof edge.data === "object" ? edge.data : {}),
        ...(points && points.length > 1 ? { points } : {}),
      },
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
}
