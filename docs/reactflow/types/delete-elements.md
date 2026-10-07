---
title: "DeleteElements"
description: "DeleteElements deletes nodes and edges from the flow and return the deleted edges and nodes asynchronously."
source: "https://reactflow.dev/api-reference/types/delete-elements"
---

# DeleteElements

DeleteElements deletes provided nodes and edges and handles deleting any connected edges as well as child nodes. Returns successfully deleted edges and nodes asynchronously.

```tsx
export type DeleteElements = (payload: {
  nodes?: (Partial<Node> & { id: Node["id"] })[];
  edges?: (Partial<Edge> & { id: Edge["id"] })[];
}) => Promise<{
  deletedNodes: Node[];
  deletedEdges: Edge[];
}>;
```

Last updated on August 24, 2026

[

DefaultEdgeOptions

](/api-reference/types/default-edge-options)[

Edge

](/api-reference/types/edge)
