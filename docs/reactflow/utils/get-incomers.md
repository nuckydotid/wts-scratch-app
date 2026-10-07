---
title: "getIncomers()"
description: "This util is used to tell you what nodes, if any, are connected to the given node as the source of an edge."
source: "https://reactflow.dev/api-reference/utils/get-incomers"
---

# getIncomers()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L91) 

This util is used to tell you what nodes, if any, are connected to the given node as the _source_ of an edge.

```tsx
import { getIncomers } from "@xyflow/react";

const nodes = [];
const edges = [];

const incomers = getIncomers(
  { id: "1", position: { x: 0, y: 0 }, data: { label: "node" } },
  nodes,
  edges,
);
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `node` | `[NodeType](/api-reference/types/node) \| { id: string; }` The node to get the connected nodes from. | |
| `nodes` | `[NodeType](/api-reference/types/node)[]` The array of all nodes. | |
| `edges` | `[EdgeType](/api-reference/types/edge)[]` The array of all edges. | |

**Returns:**

`[NodeType](/api-reference/types/node)[]`

Last updated on August 24, 2026

[

getConnectedEdges()

](/api-reference/utils/get-connected-edges)[

getNodesBounds()

](/api-reference/utils/get-nodes-bounds)
