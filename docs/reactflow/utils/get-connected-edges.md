---
title: "getConnectedEdges()"
description: "Given an array of nodes that may be connected to one another and an array of all your edges, this util gives you an array of edges that connect any of the given nodes together."
source: "https://reactflow.dev/api-reference/utils/get-connected-edges"
---

# getConnectedEdges()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L224) 

This utility filters an array of edges, keeping only those where either the source or target node is present in the given array of nodes.

```tsx
import { getConnectedEdges } from "@xyflow/react";

const nodes = [
  { id: "a", position: { x: 0, y: 0 } },
  { id: "b", position: { x: 100, y: 0 } },
];
const edges = [
  { id: "a->c", source: "a", target: "c" },
  { id: "c->d", source: "c", target: "d" },
];

const connectedEdges = getConnectedEdges(nodes, edges);
// => [{ id: 'a->c', source: 'a', target: 'c' }]
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `nodes` | `[NodeType](/api-reference/types/node)[]` Nodes you want to get the connected edges for. | |
| `edges` | `[EdgeType](/api-reference/types/edge)[]` All edges. | |

**Returns:**

`[EdgeType](/api-reference/types/edge)[]`

Last updated on August 24, 2026

[

getBezierPath()

](/api-reference/utils/get-bezier-path)[

getIncomers()

](/api-reference/utils/get-incomers)
